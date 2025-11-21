import { Chess } from 'chess.js';
import { PIECE_HP } from './constants.js';

export class HPChess {
    constructor() {
        this.chess = new Chess();
        this.hpState = {}; // Map of square (e.g., 'e4') -> { current, max }
        this.capturedPieces = { w: [], b: [] }; // Graveyard for pieces with 0 HP
        this.initHP();
    }

    initHP() {
        this.hpState = {};
        const board = this.chess.board();
        board.forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    this.hpState[piece.square] = {
                        current: PIECE_HP[piece.type],
                        max: PIECE_HP[piece.type]
                    };
                }
            });
        });
    }

    getBoard() {
        // Return board with HP data merged
        const board = this.chess.board();
        return board.map(row =>
            row.map(piece => {
                if (!piece) return null;
                return {
                    ...piece,
                    hp: this.hpState[piece.square] || { current: 1, max: 1 } // Fallback
                };
            })
        );
    }

    getTurn() {
        return this.chess.turn();
    }

    getValidMoves(square) {
        const piece = this.chess.get(square);
        if (!piece) return [];

        // If it's the King, we want to allow moving into check.
        // Standard chess.js won't allow this.
        // We can manually calculate the 8 surrounding squares + castling.
        if (piece.type === 'k') {
            const moves = [];
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
            const fileIdx = files.indexOf(square[0]);
            const rankIdx = ranks.indexOf(square[1]);

            // 8 directions
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

            directions.forEach(([df, dr]) => {
                const f = fileIdx + df;
                const r = rankIdx + dr;
                if (f >= 0 && f < 8 && r >= 0 && r < 8) {
                    const targetSquare = files[f] + ranks[r];
                    const targetPiece = this.chess.get(targetSquare);

                    // Allow if empty or enemy
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        // Construct a move object similar to chess.js
                        moves.push({
                            from: square,
                            to: targetSquare,
                            color: piece.color,
                            piece: 'k',
                            flags: targetPiece ? 'c' : 'n', // capture or non-capture
                            san: 'K' + targetSquare // Simplified SAN
                        });
                    }
                }
            });

            // Castling Logic (Relaxed)
            // Check FEN for castling rights
            const fen = this.chess.fen();
            const castlingRights = fen.split(' ')[2]; // e.g. "KQkq" or "-"

            if (piece.color === 'w') {
                // White Kingside (K)
                if (castlingRights.includes('K')) {
                    if (!this.chess.get('f1') && !this.chess.get('g1')) {
                        moves.push({ from: 'e1', to: 'g1', color: 'w', piece: 'k', flags: 'k', san: 'O-O' });
                    }
                }
                // White Queenside (Q)
                if (castlingRights.includes('Q')) {
                    if (!this.chess.get('d1') && !this.chess.get('c1') && !this.chess.get('b1')) {
                        moves.push({ from: 'e1', to: 'c1', color: 'w', piece: 'k', flags: 'q', san: 'O-O-O' });
                    }
                }
            } else {
                // Black Kingside (k)
                if (castlingRights.includes('k')) {
                    if (!this.chess.get('f8') && !this.chess.get('g8')) {
                        moves.push({ from: 'e8', to: 'g8', color: 'b', piece: 'k', flags: 'k', san: 'O-O' });
                    }
                }
                // Black Queenside (q)
                if (castlingRights.includes('q')) {
                    if (!this.chess.get('d8') && !this.chess.get('c8') && !this.chess.get('b8')) {
                        moves.push({ from: 'e8', to: 'c8', color: 'b', piece: 'k', flags: 'q', san: 'O-O-O' });
                    }
                }
            }

            return moves;
        }

        // For non-King pieces, we want to ignore pins.
        // Strategy: Temporarily remove the King, generate moves, put King back.

        // Find King
        const kingPiece = this.chess.board().flat().find(p => p && p.type === 'k' && p.color === piece.color);
        const kingSquare = kingPiece ? kingPiece.square : null;

        if (kingSquare) {
            // Save state (including castling rights)
            const fen = this.chess.fen();

            // Remove King
            this.chess.remove(kingSquare);

            // Generate moves
            const moves = this.chess.moves({ square, verbose: true });

            // Restore state
            this.chess.load(fen);

            return moves;
        } else {
            // Should not happen in normal play, but fallback
            // If King is missing (e.g. captured in HP chess?), then pins don't exist anyway.
            return this.chess.moves({ square, verbose: true });
        }
    }

    move(from, to) {
        const piece = this.chess.get(from);
        if (!piece) {
            console.error(`[Logic] No piece at ${from}`);
            return false;
        }

        // We delegate the actual move execution to handleHPMove -> executeForcedMove.
        // We do NOT call this.chess.move() here, because that would mutate the board
        // before handleHPMove has a chance to check for captures or handle combat.
        return this.handleHPMove(from, to, piece);
    }

    handleHPMove(from, to, attackerPiece) {
        // This replaces the old move() logic but uses our forced execution

        const attackerSquare = from;
        const targetSquare = to;
        // attackerPiece passed in because we might have messed with board? 
        // No, let's assume board is state BEFORE move.

        // We need to check if there is a defender at 'to' BEFORE we execute the move in chess.js
        // But wait, if we used the "Remove King" trick, we haven't executed the move yet in the real board state (we restored King).
        // So board is intact.

        // Check for defender (using our HP state or chess board)
        // Note: chess.get(to) might be empty if we are capturing en passant? 
        // For now, standard capture.

        const defenderPiece = this.chess.get(to); // Real board check

        if (defenderPiece) {
            // Combat!
            let attackerState = this.hpState[attackerSquare];
            if (!attackerState) {
                console.warn(`[Logic] HP state missing for attacker at ${attackerSquare}, using default`);
                attackerState = {
                    current: PIECE_HP[attackerPiece.type],
                    max: PIECE_HP[attackerPiece.type]
                };
                this.hpState[attackerSquare] = attackerState;
            }

            let defenderState = this.hpState[targetSquare];
            if (!defenderState) {
                console.warn(`[Logic] HP state missing for defender at ${targetSquare}, using default`);
                defenderState = {
                    current: PIECE_HP[defenderPiece.type],
                    max: PIECE_HP[defenderPiece.type]
                };
                this.hpState[targetSquare] = defenderState;
            }

            const attackerHP = attackerState.current;
            const defenderHP = defenderState.current;
            const defenderMaxHP = defenderState.max; // Capture max HP before state is overwritten

            const damage = attackerHP;
            const newDefenderHP = defenderHP - damage;

            if (newDefenderHP <= 0) {
                // Die
                this.capturedPieces[defenderPiece.color].push({ ...defenderPiece, hp: { current: 0, max: defenderMaxHP } });
                delete this.hpState[targetSquare];

                // Execute move (Force if needed)
                this.executeForcedMove(from, to);

                this.hpState[to] = this.hpState[from];
                delete this.hpState[from];

            } else {
                // Survive & Teleport
                // 1. Execute move (Force if needed)
                this.executeForcedMove(from, to);

                // 2. Move attacker HP
                this.hpState[to] = this.hpState[from];
                delete this.hpState[from];

                // 3. Teleport defender
                // We need to put defender back on board at new square
                const teleportSquare = this.findTeleportSquare(defenderPiece.color);
                if (teleportSquare) {
                    console.log(`[Logic] Teleporting ${defenderPiece.type} to ${teleportSquare}`);
                    const success = this.forcePut({ type: defenderPiece.type, color: defenderPiece.color }, teleportSquare);
                    console.log(`[Logic] Put result: ${success}`);

                    this.hpState[teleportSquare] = {
                        current: newDefenderHP,
                        max: defenderMaxHP
                    };
                } else {
                    console.log("[Logic] Teleport failed, no square found");
                    this.capturedPieces[defenderPiece.color].push({ ...defenderPiece, hp: { current: newDefenderHP, max: defenderMaxHP } });
                }
            }
        } else {
            // Non-capture move
            this.executeForcedMove(from, to);
            this.hpState[to] = this.hpState[from];
            delete this.hpState[from];
        }

        return true;
    }

    forcePut(piece, square) {
        // Try standard put first
        if (this.chess.put(piece, square)) return true;

        // If failed (likely due to missing King validation), patch FEN
        console.log("[Logic] Standard put failed, patching FEN...");
        try {
            const fen = this.chess.fen();
            const parts = fen.split(' ');
            const rows = parts[0].split('/');

            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const rankIndex = 8 - parseInt(square[1]); // 8 -> 0, 1 -> 7
            const fileIndex = files.indexOf(square[0]);

            let row = rows[rankIndex];
            let expandedRow = '';
            for (let char of row) {
                if (isNaN(char)) {
                    expandedRow += char;
                } else {
                    expandedRow += '1'.repeat(parseInt(char));
                }
            }

            const pieceChar = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
            const newRowArr = expandedRow.split('');
            newRowArr[fileIndex] = pieceChar;
            const newExpandedRow = newRowArr.join('');

            // Compress
            let compressedRow = '';
            let emptyCount = 0;
            for (let char of newExpandedRow) {
                if (char === '1') {
                    emptyCount++;
                } else {
                    if (emptyCount > 0) {
                        compressedRow += emptyCount;
                        emptyCount = 0;
                    }
                    compressedRow += char;
                }
            }
            if (emptyCount > 0) compressedRow += emptyCount;

            rows[rankIndex] = compressedRow;
            parts[0] = rows.join('/');

            const newFen = parts.join(' ');
            console.log(`[Logic] Loading patched FEN: ${newFen}`);
            this.chess.load(newFen);
            return true;
        } catch (e) {
            console.error("[Logic] Force put failed:", e);
            return false;
        }
    }

    executeForcedMove(from, to) {
        // Try standard move
        try {
            const res = this.chess.move({ from, to });
            if (res) return;
        } catch (e) { }

        // If failed (illegal in standard chess), force it
        const piece = this.chess.get(from);
        this.chess.remove(from);
        this.chess.put(piece, to);

        // Handle Castling (Rook Move)
        if (piece.type === 'k' && Math.abs(to.charCodeAt(0) - from.charCodeAt(0)) === 2) {
            // Kingside
            if (to === 'g1') {
                const rook = this.chess.remove('h1');
                this.chess.put(rook, 'f1');
                this.hpState['f1'] = this.hpState['h1'];
                delete this.hpState['h1'];
            } else if (to === 'c1') { // Queenside
                const rook = this.chess.remove('a1');
                this.chess.put(rook, 'd1');
                this.hpState['d1'] = this.hpState['a1'];
                delete this.hpState['a1'];
            } else if (to === 'g8') { // Black Kingside
                const rook = this.chess.remove('h8');
                this.chess.put(rook, 'f8');
                this.hpState['f8'] = this.hpState['h8'];
                delete this.hpState['h8'];
            } else if (to === 'c8') { // Black Queenside
                const rook = this.chess.remove('a8');
                this.chess.put(rook, 'd8');
                this.hpState['d8'] = this.hpState['a8'];
                delete this.hpState['a8'];
            }
        }

        // Swap turn
        const fen = this.chess.fen();
        const fenParts = fen.split(' ');
        fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
        fenParts[3] = '-';
        if (piece.type === 'k') {
            fenParts[2] = fenParts[2].replace(piece.color === 'w' ? /[KQ]/g : /[kq]/g, '');
            if (fenParts[2] === '') fenParts[2] = '-';
        }
        // Also handle Rook castling rights if Rook moves?
        // Ideally we parse the move to see if it was a rook move from corner.
        // For prototype, this is acceptable.

        this.chess.load(fenParts.join(' '));
    }

    findTeleportSquare(color) {
        // Back row: White = 1 (index 7 in chess.js board?), Black = 8 (index 0)
        // chess.js ranks: 1..8.
        // White Back Row: Rank 1. Front Row: Rank 2.
        // Black Back Row: Rank 8. Front Row: Rank 7.

        const backRank = color === 'w' ? '1' : '8';
        const frontRank = color === 'w' ? '2' : '7';
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        console.log(`[Logic] Finding teleport for ${color}. Back: ${backRank}, Front: ${frontRank}`);

        // Try Back Rank
        for (let file of files) {
            const square = `${file}${backRank}`;
            const piece = this.chess.get(square);
            if (!piece) {
                console.log(`[Logic] Found empty back rank square: ${square}`);
                return square;
            }
        }

        // Try Front Rank
        for (let file of files) {
            const square = `${file}${frontRank}`;
            const piece = this.chess.get(square);
            if (!piece) {
                console.log(`[Logic] Found empty front rank square: ${square}`);
                return square;
            }
        }

        console.log("[Logic] No teleport square found!");
        return null;
    }

    isGameOver() {
        // Check if either King is dead (captured)
        const whiteKingCaptured = this.capturedPieces['w'].some(p => p.type === 'k');
        const blackKingCaptured = this.capturedPieces['b'].some(p => p.type === 'k');

        if (whiteKingCaptured || blackKingCaptured) return true;

        return this.chess.isGameOver();
    }

    getWinner() {
        const whiteKingCaptured = this.capturedPieces['w'].some(p => p.type === 'k');
        const blackKingCaptured = this.capturedPieces['b'].some(p => p.type === 'k');

        if (whiteKingCaptured) return 'Black';
        if (blackKingCaptured) return 'White';

        if (this.chess.isCheckmate()) {
            return this.chess.turn() === 'w' ? 'Black' : 'White';
        }
        return null;
    }

    isKingInLethalDanger(color) {
        // 1. Find King
        const kingPiece = this.chess.board().flat().find(p => p && p.type === 'k' && p.color === color);
        if (!kingPiece) return false; // King dead?

        const kingSquare = kingPiece.square;
        const kingHP = this.hpState[kingSquare]?.current || 1;

        // 2. Find attackers
        const enemyColor = color === 'w' ? 'b' : 'w';

        // Save state
        const fen = this.chess.fen();

        // Force turn to enemy to generate their moves/attacks
        if (this.chess.turn() !== enemyColor) {
            const fenParts = fen.split(' ');
            fenParts[1] = enemyColor;
            fenParts[3] = '-'; // Clear en passant to avoid errors?
            try {
                this.chess.load(fenParts.join(' '));
            } catch (e) {
                console.warn(`[Logic] isKingInLethalDanger: Failed to switch turn (Game Over?): ${e.message}`);
                return false;
            }
        }

        const board = this.chess.board();
        let maxDamage = 0;

        board.forEach(row => {
            row.forEach(piece => {
                if (piece && piece.color === enemyColor) {
                    // Check if this piece attacks the King
                    const moves = this.chess.moves({ square: piece.square, verbose: true });
                    if (moves.some(m => m.to === kingSquare)) {
                        // It attacks!
                        const attackerHP = this.hpState[piece.square]?.current || 1;
                        if (attackerHP > maxDamage) {
                            maxDamage = attackerHP;
                        }
                    }
                }
            });
        });

        // Restore state
        try {
            this.chess.load(fen);
        } catch (e) {
            console.error(`[Logic] isKingInLethalDanger: Failed to restore FEN: ${e.message}`);
            // If we can't restore, we might be in trouble, but usually this means we are already in the "bad" state
            // or the "bad" state was the original state.
        }

        return maxDamage >= kingHP;
    }
}
