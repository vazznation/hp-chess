import React, { useState } from 'react';
import { Board } from './components/Board';
import { GameInfo } from './components/GameInfo';
import './index.css'; // Ensure Tailwind/CSS is loaded

function App() {
  const [gameState, setGameState] = useState({
    turn: 'w',
    captured: { w: [], b: [] },
    winner: null,
    inCheck: { w: false, b: false }
  });

  const handleUpdate = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  return (
    <div className="min-h-screen bg-[#302E2B] flex flex-col items-center justify-center font-sans">
      <h1 className="text-3xl text-white font-bold mb-8">HP Chess</h1>

      <div className="flex flex-col gap-1">
        {/* Top Player (Black) */}
        <GameInfo
          player="b"
          captured={gameState.captured.b}
          isCurrentTurn={gameState.turn === 'b'}
          inCheck={gameState.inCheck?.b}
        />

        {/* Board */}
        <Board onUpdate={handleUpdate} />

        {/* Bottom Player (White) */}
        <GameInfo
          player="w"
          captured={gameState.captured.w}
          isCurrentTurn={gameState.turn === 'w'}
          inCheck={gameState.inCheck?.w}
        />
      </div>

      {gameState.winner && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-[#262421] border-4 border-[#769656] p-8 rounded-lg shadow-2xl text-center transform scale-110">
            <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg tracking-wider">
              {gameState.winner.toUpperCase()} WINS!
            </h2>
            <p className="text-[#9ca3af] mb-8 text-lg font-medium">
              by King Elimination
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-[#81b64c] text-white text-xl font-bold rounded shadow-[0_4px_0_0_#457524] hover:bg-[#a3d160] hover:shadow-[0_4px_0_0_#457524] active:translate-y-1 active:shadow-none transition-all"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
