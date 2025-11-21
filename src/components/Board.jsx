import React, { useState, useEffect } from 'react';
import { Square } from './Square';
import { Piece } from './Piece';
import { HPChess } from '../game/logic';

// Initialize game instance outside component to persist state across re-renders
const game = new HPChess();

export const Board = ({ onUpdate, playerRole, remoteMove, onMoveMade }) => {
    const [board, setBoard] = useState(game.getBoard());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [turn, setTurn] = useState(game.getTurn());

    // Handle Remote Move
    useEffect(() => {
        if (remoteMove) {
            console.log("[Board] Executing remote move:", remoteMove);
            game.move(remoteMove.from, remoteMove.to);
            setBoard(game.getBoard());
            setTurn(game.getTurn());
            onUpdate({
                turn: game.getTurn(),
                captured: game.capturedPieces,
                winner: game.getWinner(),
                inCheck: {
                    w: game.isKingInLethalDanger('w'),
                    b: game.isKingInLethalDanger('b')
                }
            });
        }
    }, [remoteMove]);

    useEffect(() => {
        // Initial update
        onUpdate({
            turn: game.getTurn(),
            captured: game.capturedPieces,
            winner: game.getWinner(),
            inCheck: {
                w: game.isKingInLethalDanger('w'),
                b: game.isKingInLethalDanger('b')
            }
        });
    }, []);

    const handleSquareClick = (square) => {
        // If game over, do nothing
        if (game.isGameOver()) return;

        // Multiplayer Check: If role is assigned and not my turn, block
        if (playerRole && playerRole !== 'spectator' && playerRole !== game.getTurn()) {
            console.log("Not your turn!");
            return;
        }
        // If spectator, block all
        if (playerRole === 'spectator') return;

        const piece = game.chess.get(square);
        const isOwnPiece = piece && piece.color === game.getTurn();

        // If square is in valid moves, execute move
        if (validMoves.includes(square)) {
            game.move(selectedSquare, square);
            setBoard(game.getBoard());
            setSelectedSquare(null);
            setValidMoves([]);
            setTurn(game.getTurn());
            onUpdate({
                turn: game.getTurn(),
                captured: game.capturedPieces,
                winner: game.getWinner(),
                inCheck: {
                    w: game.isKingInLethalDanger('w'),
                    b: game.isKingInLethalDanger('b')
                }
            });

            // Notify parent of move (for multiplayer)
            if (onMoveMade) {
                onMoveMade({ from: selectedSquare, to: square, color: game.getTurn() === 'w' ? 'b' : 'w' }); // Turn has already flipped, so send previous turn color? No, send who moved.
                // Wait, game.getTurn() is now the NEXT player.
                // So the mover was the OPPOSITE of current turn.
            }
            return;
        }

        // If clicking own piece, select it
        if (isOwnPiece) {
            // Toggle selection if same square
            if (selectedSquare === square) {
                setSelectedSquare(null);
                setValidMoves([]);
            } else {
                setSelectedSquare(square);
                const moves = game.getValidMoves(square);
                setValidMoves(moves.map(m => m.to));
            }
        } else {
            // Clicking empty square or enemy piece (not valid move)
            setSelectedSquare(null);
            setValidMoves([]);
        }
    };

    return (
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full aspect-square border-4 border-[#769656]">
            {board.map((row, rowIndex) => (
                row.map((piece, colIndex) => {
                    const file = String.fromCharCode(97 + colIndex); // a..h
                    const rank = 8 - rowIndex; // 8..1
                    const squareId = `${file}${rank}`;
                    const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                    const isSelected = selectedSquare === squareId;
                    const isHighlighted = validMoves.includes(squareId);

                    return (
                        <Square
                            key={squareId}
                            isBlack={isBlackSquare}
                            onClick={() => handleSquareClick(squareId)}
                            isSelected={isSelected}
                            isHighlighted={isHighlighted}
                        >
                            {piece && (
                                <Piece
                                    type={piece.type}
                                    color={piece.color}
                                    hp={piece.hp}
                                />
                            )}
                        </Square>
                    );
                })
            ))}
        </div>
    );
};
