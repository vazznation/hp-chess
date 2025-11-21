import { Chess } from 'chess.js';

const chess = new Chess();
console.log("Initial FEN:", chess.fen());
console.log("Initial Rights:", chess.fen().split(' ')[2]);

// Find King
const kingSquare = 'e1';
const king = chess.get(kingSquare);

console.log("Removing King...");
chess.remove(kingSquare);
console.log("FEN after remove:", chess.fen());
console.log("Rights after remove:", chess.fen().split(' ')[2]);

console.log("Putting King back...");
chess.put(king, kingSquare);
console.log("FEN after put:", chess.fen());
console.log("Rights after put:", chess.fen().split(' ')[2]);

if (chess.fen().split(' ')[2] === '-') {
    console.error("FAILURE: Castling rights were lost!");
} else {
    console.log("SUCCESS: Castling rights preserved.");
}
