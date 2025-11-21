import { HPChess } from './src/game/logic.js';

const game = new HPChess();

// Setup a board where White King is vulnerable
// e.g. White King at e4 (HP 1), Black Queen at e5 (HP 9)
game.chess.clear();
game.chess.put({ type: 'k', color: 'w' }, 'e4');
game.chess.put({ type: 'q', color: 'b' }, 'e5');
game.chess.put({ type: 'k', color: 'b' }, 'h8'); // Black King needed for valid FEN initially

game.initHP();
// Set White King HP to 1
game.hpState['e4'] = { current: 1, max: 10 };
// Set Black Queen HP to 9
game.hpState['e5'] = { current: 9, max: 9 };

console.log("Initial Board State:");
console.log("White King at e4, HP: 1");
console.log("Black Queen at e5, HP: 9");

// Force turn to Black
game.chess.load(game.chess.fen().replace(' w ', ' b '));

console.log("Attempting to capture White King with Black Queen (e5 -> e4)...");

try {
    const result = game.move('e5', 'e4');
    console.log("Move result:", result);

    if (game.isGameOver()) {
        console.log("Game Over detected correctly.");
        console.log("Winner:", game.getWinner());
    } else {
        console.error("Game Over NOT detected!");
    }
} catch (e) {
    console.error("CRASH DETECTED during move:", e.message);
}
