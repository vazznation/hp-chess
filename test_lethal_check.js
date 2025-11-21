import { HPChess } from './src/game/logic.js';

const game = new HPChess();
console.log("Initial Setup");

// Setup:
// White King at e1 (10 HP)
// Black Pawn at e2 (1 HP) -> Attacks e1. Damage 1. Non-lethal.
// Black Queen at d1 (10 HP) -> Attacks e1. Damage 10. Lethal.

game.chess.clear();
game.chess.put({ type: 'k', color: 'w' }, 'e1');
game.chess.put({ type: 'k', color: 'b' }, 'e8'); // Need both kings

game.initHP();
game.hpState['e1'] = { current: 10, max: 10 };

// Scenario 1: Non-lethal Check
console.log("Scenario 1: Non-lethal Check (Pawn 1 HP vs King 10 HP)");
game.chess.put({ type: 'p', color: 'b' }, 'd2'); // Pawn at d2 attacks e1
game.hpState['d2'] = { current: 1, max: 1 };

const isLethal1 = game.isKingInLethalDanger('w');
console.log(`Lethal Danger: ${isLethal1}`);
if (!isLethal1) {
    console.log("SUCCESS: Correctly identified non-lethal check.");
} else {
    console.error("FAILURE: Incorrectly flagged as lethal.");
}

// Scenario 2: Lethal Check
console.log("Scenario 2: Lethal Check (Queen 10 HP vs King 10 HP)");
game.chess.remove('d2'); // Remove pawn
game.chess.put({ type: 'q', color: 'b' }, 'e2'); // Queen at e2 attacks e1
game.hpState['e2'] = { current: 10, max: 10 };

const isLethal2 = game.isKingInLethalDanger('w');
console.log(`Lethal Danger: ${isLethal2}`);
if (isLethal2) {
    console.log("SUCCESS: Correctly identified lethal check.");
} else {
    console.error("FAILURE: Failed to flag as lethal.");
}
