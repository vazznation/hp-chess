import { Chess } from 'chess.js';

const chess = new Chess();

// Setup board: White Bishop b5, Black King e8, Black Pawn a7. White to move? No, Black to move.
// FEN: rnbqkbnr/pppp1ppp/8/1B6/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2
// (After 1. e4 d5 2. Bb5+)

chess.load('rnbqkbnr/pppp1ppp/8/1B6/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2');

console.log("Turn:", chess.turn()); // Should be 'b'
console.log("In Check:", chess.inCheck()); // Should be true

// Try to get moves for a7 (pawn)
const movesStandard = chess.moves({ square: 'a7', verbose: true });
console.log("Standard moves for a7 (should be empty if pinned/check blocks it? No, a6 blocks check? No, Bishop is on b5. a6 doesn't block. King is at e8. Bishop attacks e8. a6 does nothing to stop check.)");
console.log("Standard moves:", movesStandard.map(m => m.to));

// Now try the "Remove King" trick
const kingSquare = 'e8';
const savedKing = chess.remove(kingSquare);
console.log("Removed King from", kingSquare);
console.log("In Check (after remove):", chess.inCheck()); // Should be false (no king)

const movesNoKing = chess.moves({ square: 'a7', verbose: true });
console.log("Moves without King:", movesNoKing.map(m => m.to));

chess.put(savedKing, kingSquare);
