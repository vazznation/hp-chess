import React from 'react';
import { PieceIcons } from './PieceIcons';

export const Piece = ({ type, color, hp }) => {
    if (!type) return null;

    const { current, max } = hp;
    const healthPercent = (current / max) * 100;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Health Bar */}
            <div className="absolute -top-2 w-[80%] flex flex-col items-center z-10">
                <span className="text-[10px] font-bold text-black mb-[1px] drop-shadow-sm bg-white/50 px-1 rounded">
                    {current}/{max}
                </span>
                <div className="w-full h-2 bg-red-600 rounded-full border border-black overflow-hidden">
                    <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${healthPercent}%` }}
                    />
                </div>
            </div>

            {/* Piece Icon */}
            <div className="w-[80%] h-[80%]">
                <PieceIcons type={type} color={color} />
            </div>
        </div>
    );
};
