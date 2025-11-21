import { HPChess } from './src/game/logic.js';

const game = new HPChess();
console.log("Initial FEN:", game.chess.fen());

// 1. Move Knight: g1 -> h3 (Standard move)
console.log("Moving Knight g1 -> h3");
game.move('g1', 'h3');
console.log("FEN:", game.chess.fen());

// 2. Move Pawn: e2 -> e3 (Standard move)
console.log("Moving Pawn e2 -> e3");
game.move('e2', 'e3');
console.log("FEN:", game.chess.fen());

// 3. Move Bishop: f1 -> e2 (Standard move)
console.log("Moving Bishop f1 -> e2");
game.move('f1', 'e2');
console.log("FEN:", game.chess.fen());

// Path e1-g1 should be clear.
const f1 = game.chess.get('f1');
const g1 = game.chess.get('g1');
console.log(`f1: ${f1 ? f1.type : 'empty'}, g1: ${g1 ? g1.type : 'empty'}`);

// Check valid moves for King at e1
const moves = game.getValidMoves('e1');
const castlingMoves = moves.filter(m => m.san.includes('O-O'));

console.log("Castling Moves Found:", castlingMoves.map(m => m.san));

if (castlingMoves.length > 0) {
    console.log("SUCCESS: Castling is available.");
} else {
    console.error("FAILURE: Castling is NOT available.");
    console.log("Castling Rights in FEN:", game.chess.fen().split(' ')[2]);
}
