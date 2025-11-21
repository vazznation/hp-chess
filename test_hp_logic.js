import { HPChess } from './src/game/logic.js';

// Test getValidMoves for e2 (Standard start)
const gameStart = new HPChess();
console.log("Turn (Start):", gameStart.getTurn());
const movesStart = gameStart.getValidMoves('e2');
console.log("Moves for e2:", movesStart.map(m => m.to));

if (movesStart.find(m => m.to === 'e4')) {
    console.log("SUCCESS: e4 is a valid move.");
} else {
    console.log("FAILURE: e4 is NOT a valid move.");
}
