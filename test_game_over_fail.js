import { HPChess } from './src/game/logic.js';

const game = new HPChess();
console.log("Initial Setup");

// Setup:
// White Queen at d7 (10 HP)
// Black King at e7 (1 HP)
game.chess.clear();
game.chess.put({ type: 'q', color: 'w' }, 'd7');
game.chess.put({ type: 'k', color: 'b' }, 'e7');
game.chess.put({ type: 'k', color: 'w' }, 'e1');

game.initHP();
game.hpState['d7'] = { current: 10, max: 10 };
game.hpState['e7'] = { current: 1, max: 10 };

console.log("Before Attack:");
console.log("Game Over?", game.isGameOver());
console.log("Black King Danger?", game.isKingInLethalDanger('b'));

// Execute Move: Queen captures King
console.log("Executing Move: d7 -> e7");
game.move('d7', 'e7');

console.log("After Attack:");
console.log("Game Over?", game.isGameOver());
console.log("Black King Danger?", game.isKingInLethalDanger('b'));
console.log("White King Danger?", game.isKingInLethalDanger('w')); // This should trigger the crash if not fixed
console.log("Captured Pieces:", JSON.stringify(game.capturedPieces));
console.log("Winner:", game.getWinner());

if (game.isGameOver()) {
    console.log("SUCCESS: Game Over triggered.");
} else {
    console.error("FAILURE: Game Over NOT triggered.");
}
