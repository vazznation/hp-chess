import { Chess } from 'chess.js';

const chess = new Chess();
console.log("Initial FEN:", chess.fen());

// Simulate executeForcedMove for a Pawn
// 1. Remove Pawn at e2
const pawn = chess.remove('e2');
// 2. Put Pawn at e3
chess.put(pawn, 'e3');

console.log("After manual Pawn move (remove/put):");
console.log("FEN:", chess.fen());

const rights = chess.fen().split(' ')[2];
if (rights.includes('K') && rights.includes('Q')) {
    console.log("SUCCESS: Castling rights preserved.");
} else {
    console.error("FAILURE: Castling rights LOST.");
}
