import { HPChess } from './src/game/logic.js';

const game = new HPChess();
console.log("Initial Setup");

// Setup:
// White Queen at d7 (9 HP)
// Black King at e7 (10 HP)
// We need to clear the board or set it up specifically.
// Let's just clear e7 and d7 and put pieces there.

game.chess.clear();
game.chess.put({ type: 'q', color: 'w' }, 'd7');
game.chess.put({ type: 'k', color: 'b' }, 'e7');
// We need kings for both sides for chess.js to be happy? 
game.chess.put({ type: 'k', color: 'w' }, 'e1');

// Initialize HP
game.initHP();
// Manually set HP to be sure
game.hpState['d7'] = { current: 9, max: 9 };
game.hpState['e7'] = { current: 10, max: 10 };

console.log("Before Attack:");
console.log("d7 (Queen):", game.hpState['d7']);
console.log("e7 (King):", game.hpState['e7']);

// Execute Move: Queen captures King
console.log("Executing Move: d7 -> e7");
game.move('d7', 'e7');

console.log("After Attack:");
const queenSquare = 'e7';
const kingSquare = game.chess.board().flat().find(p => p && p.type === 'k' && p.color === 'b')?.square;

console.log(`Queen is at ${queenSquare}`);
console.log(`King is at ${kingSquare}`);

if (kingSquare) {
    console.log("King HP:", game.hpState[kingSquare]);
    if (game.hpState[kingSquare].current === 1) {
        console.log("SUCCESS: King survived with 1 HP.");
    } else {
        console.error(`FAILURE: King HP is ${game.hpState[kingSquare].current}, expected 1.`);
    }
} else {
    console.error("FAILURE: King is missing (died)!");
}
