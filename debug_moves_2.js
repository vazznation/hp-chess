import { Chess } from 'chess.js';

const chess = new Chess();

// Simple Check: White Rook a1, Black King a8.
chess.load('k7/8/8/8/8/8/8/R7 b - - 0 1');

console.log("Turn:", chess.turn());
console.log("In Check:", chess.inCheck());

// Try to move King to b8 (valid)
console.log("Moves for King:", chess.moves({ square: 'a8', verbose: true }).map(m => m.to));

// Try to move King to a7 (invalid, attacked by Rook)
// In HP Chess, we want this to be VALID (King takes damage).
// Standard chess should say invalid.

// Now try the "Remove King" trick for King? No, for King we use manual calculation.
// Let's test the manual calculation logic I wrote in logic.js (simulated here).

const square = 'a8';
const piece = chess.get(square);
if (piece && piece.type === 'k') {
    console.log("Manual King Moves Calculation:");
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const fileIdx = files.indexOf(square[0]);
    const rankIdx = ranks.indexOf(square[1]);

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
            // Check if occupied by friendly
            const targetPiece = chess.get(targetSquare);
            if (!targetPiece || targetPiece.color !== piece.color) {
                console.log("Potential Move:", targetSquare);
            }
        }
    });
}
