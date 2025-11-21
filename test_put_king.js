import { Chess } from 'chess.js';

const chess = new Chess();
// Load FEN from the failure case
chess.load('8/4Q3/8/8/8/8/8/4K3 b - - 0 1');
console.log("Loaded FEN:", chess.fen());

console.log("Attempting to put Black King at a8...");
const success = chess.put({ type: 'k', color: 'b' }, 'a8');
console.log("Put result:", success);

if (success) {
    console.log("FEN after put:", chess.fen());
} else {
    console.log("Put failed.");
}
