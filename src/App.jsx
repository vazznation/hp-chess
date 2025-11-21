import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Board } from './components/Board';
import { GameInfo } from './components/GameInfo';
import './index.css'; // Ensure Tailwind/CSS is loaded

// Connect to server (auto-detects host if served from same origin, otherwise needs config)
// For dev, we might need to specify URL if ports differ, but we will serve from express.
const socket = io({ autoConnect: false });

function App() {
  const [gameState, setGameState] = useState({
    turn: 'w',
    captured: { w: [], b: [] },
    winner: null,
    inCheck: { w: false, b: false }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [playerRole, setPlayerRole] = useState(null); // 'w', 'b', 'spectator', or null (local)
  const [remoteMove, setRemoteMove] = useState(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('player_role', (role) => {
      console.log("Assigned role:", role);
      setPlayerRole(role);
    });

    socket.on('opponent_move', (move) => {
      console.log("Received opponent move:", move);
      setRemoteMove(move);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('player_role');
      socket.off('opponent_move');
    };
  }, []);

  const toggleMultiplayer = () => {
    if (isConnected) {
      socket.disconnect();
      setPlayerRole(null);
    } else {
      // If running dev server on 5173 and express on 3000, we need to point to 3000.
      // But for production/LAN, we serve from 3000.
      // Let's try to connect to window.location.hostname:3000 if in dev.
      const url = window.location.port === '5173'
        ? `http://${window.location.hostname}:3000`
        : window.location.origin;

      socket.io.uri = url;
      socket.connect();
    }
  };

  const handleUpdate = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const handleMoveMade = (move) => {
    if (isConnected) {
      socket.emit('make_move', move);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#302E2B] flex items-center justify-start font-sans overflow-hidden pl-16">
      <div className="flex flex-row w-full max-w-[1600px] h-[90vh] gap-16 items-center">
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-8 h-full justify-center">
          <h1 className="text-5xl text-white font-black tracking-tight">HP Chess</h1>

          <div className="text-[#9ca3af] space-y-6">
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg border-b border-[#769656] pb-1 inline-block">HP System</h3>
              <p className="text-sm leading-relaxed">
                Pieces have Hit Points equal to their standard chess value.
                <br />
                <span className="text-[#81b64c]">Pawn: 1, Knight/Bishop: 3, Rook: 5, Queen: 9, King: 10</span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg border-b border-[#769656] pb-1 inline-block">Combat</h3>
              <p className="text-sm leading-relaxed">
                Attacking deals damage equal to the attacker's <strong>current HP</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg border-b border-[#769656] pb-1 inline-block">Survival</h3>
              <p className="text-sm leading-relaxed">
                If a piece takes damage but survives (HP &gt; 0), it <strong>teleports</strong> to its back rank.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg border-b border-[#769656] pb-1 inline-block">Win Condition</h3>
              <p className="text-sm leading-relaxed">
                Eliminate the enemy King by reducing its HP to 0.
              </p>
            </div>

            <div className="pt-4 border-t border-[#769656]/30">
              <button
                onClick={toggleMultiplayer}
                className={`w-full py-2 px-4 rounded font-bold transition-colors ${isConnected
                  ? 'bg-red-900/50 text-red-200 hover:bg-red-900/70'
                  : 'bg-[#769656]/20 text-[#769656] hover:bg-[#769656]/30'
                  }`}
              >
                {isConnected ? 'Disconnect' : 'Play on LAN'}
              </button>
              {isConnected && (
                <div className="mt-2 text-center">
                  <span className="text-xs uppercase tracking-widest text-[#9ca3af]">You are</span>
                  <div className={`text-xl font-bold ${playerRole === 'w' ? 'text-white' : 'text-black bg-gray-400 px-2 rounded inline-block ml-2'}`}>
                    {playerRole === 'w' ? 'WHITE' : playerRole === 'b' ? 'BLACK' : 'SPECTATOR'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Area - Constrained by height, aspect ratio preserved */}
        <div className="flex flex-col gap-2 h-full justify-center aspect-[9/10]">
          {/* Top Player (Black) */}
          <GameInfo
            player="b"
            captured={gameState.captured.b}
            isCurrentTurn={gameState.turn === 'b'}
            inCheck={gameState.inCheck?.b}
          />

          {/* Board - Flex grow to fill available space, keeping square aspect */}
          <div className="flex-1 min-h-0 aspect-square">
            <Board
              onUpdate={handleUpdate}
              playerRole={playerRole}
              remoteMove={remoteMove}
              onMoveMade={handleMoveMade}
            />
          </div>

          {/* Bottom Player (White) */}
          <GameInfo
            player="w"
            captured={gameState.captured.w}
            isCurrentTurn={gameState.turn === 'w'}
            inCheck={gameState.inCheck?.w}
          />
        </div>
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
