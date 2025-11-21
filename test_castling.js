import { HPChess } from './src/game/logic.js';

const game = new HPChess();
console.log("Initial Board Setup");

// Clear path for White Kingside Castling
// Remove Knight at g1 and Bishop at f1
game.chess.remove('g1');
game.chess.remove('f1');

console.log("Path cleared: g1 and f1 empty");

// Check valid moves for King at e1
const moves = game.getValidMoves('e1');
const castlingMove = moves.find(m => m.san === 'O-O');

if (castlingMove) {
    console.log("SUCCESS: Kingside castling move found (O-O)");
} else {
    console.error("FAILURE: Kingside castling move NOT found");
    console.log("Moves:", moves.map(m => m.san));
}

// Execute Castling
console.log("Executing Castling (e1 -> g1)...");
const result = game.move('e1', 'g1');

if (result) {
    console.log("Move executed successfully");
    const king = game.chess.get('g1');
    const rook = game.chess.get('f1');

    if (king && king.type === 'k' && king.color === 'w') {
        console.log("SUCCESS: King is at g1");
    } else {
        console.error("FAILURE: King is NOT at g1");
    }

    if (rook && rook.type === 'r' && rook.color === 'w') {
        console.log("SUCCESS: Rook is at f1");
    } else {
        console.error("FAILURE: Rook is NOT at f1");
    }

} else {
    console.error("FAILURE: Move execution failed");
}
