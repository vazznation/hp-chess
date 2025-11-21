import { Chess } from 'chess.js';

const chess = new Chess();

// Correct FEN for 1. e4 d5 2. Bb5+
// Black King e8, White Bishop b5. d7 is empty.
const fen = 'rnbqkbnr/ppp1pppp/8/1B1p4/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2';
chess.load(fen);

console.log("Turn:", chess.turn());
console.log("In Check:", chess.inCheck());

// Try to get moves for a7 (pawn)
// In standard chess, a7-a6 is VALID because it blocks the check?
// No, check is from b5 to e8. a6 is not on the diagonal.
// a6 is at row 6, col 0.
// Diagonal squares: c6 (2,5), d7 (3,6).
// a6 is (0,5). Not on diagonal.
// So a7-a6 does NOT block check.
// So in standard chess, a7-a6 is ILLEGAL.

const movesStandard = chess.moves({ square: 'a7', verbose: true });
console.log("Standard moves for a7 (should be empty):", movesStandard.map(m => m.to));

// Now try the "Remove King" trick
const kingSquare = 'e8';
const savedKing = chess.remove(kingSquare);
console.log("Removed King from", kingSquare);
console.log("In Check (after remove):", chess.inCheck());

const movesNoKing = chess.moves({ square: 'a7', verbose: true });
console.log("Moves without King (should include a6, a5):", movesNoKing.map(m => m.to));

chess.put(savedKing, kingSquare);
