import { HPChess } from './src/game/logic.js';

const game = new HPChess();
console.log("Initial Setup");

// Setup:
// White Queen at d7 (10 HP)
// Black King at e7 (1 HP) - Low HP to ensure death
game.chess.clear();
game.chess.put({ type: 'q', color: 'w' }, 'd7');
game.chess.put({ type: 'k', color: 'b' }, 'e7');
game.chess.put({ type: 'k', color: 'w' }, 'e1'); // White King needed for valid game state

game.initHP();
// Set HP
game.hpState['d7'] = { current: 10, max: 10 };
game.hpState['e7'] = { current: 1, max: 10 };

console.log("Before Attack:");
console.log("d7 (Queen):", game.hpState['d7']);
console.log("e7 (King):", game.hpState['e7']);
console.log("Game Over?", game.isGameOver());

// Execute Move: Queen captures King
console.log("Executing Move: d7 -> e7");
game.move('d7', 'e7');

console.log("After Attack:");
console.log("Game Over?", game.isGameOver());
console.log("Winner:", game.getWinner());

if (game.isGameOver() && game.getWinner() === 'White') {
    console.log("SUCCESS: Game ended, White won.");
} else {
    console.error("FAILURE: Game did not end correctly.");
}
