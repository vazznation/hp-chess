import React from 'react';
import { PieceIcons } from './PieceIcons';

export const GameInfo = ({ player, captured, isCurrentTurn, inCheck }) => {
    // player: 'w' or 'b'
    // captured: array of pieces captured BY this player

    const playerName = player === 'w' ? 'White' : 'Black';
    const isActive = isCurrentTurn;

    return (
        <div className={`flex items-center justify-between w-[700px] p-2 ${isActive ? 'bg-yellow-100/50' : ''} rounded transition-colors duration-200`}>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <span className="font-bold text-gray-500">{player.toUpperCase()}</span>
                </div>
                <div className="font-bold text-white">{playerName}</div>
                {inCheck && (
                    <div className="ml-4 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded animate-pulse">
                        CHECK
                    </div>
                )}
            </div>

            <div className="flex gap-1 h-6">
                {captured.map((piece, idx) => (
                    <div key={idx} className="w-4 h-4 opacity-70">
                        <PieceIcons type={piece.type} color={piece.color} />
                    </div>
                ))}
            </div>
        </div>
    );
};
