import React from 'react';

export const PieceIcons = ({ type, color, className }) => {
    // Standard Unicode Chess Symbols
    // White: ♔♕♖♗♘♙
    // Black: ♚♛♜♝♞♟
    // However, it's often better to use the "White" symbols for both and color them with CSS
    // to ensure consistent shape style, or use the specific ones.
    // Let's use the specific ones for maximum standardness, or just one set colored.
    // Using specific ones might have fill issues depending on font.
    // Best practice for web chess often uses a font or SVG.
    // Since SVGs failed, let's use the specific Unicode characters which are widely supported.

    const symbols = {
        w: {
            k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙'
        },
        b: {
            k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
        }
    };

    const symbol = symbols[color][type];

    return (
        <div className={`${className} flex items-center justify-center w-full h-full select-none`} style={{ lineHeight: 1 }}>
            <span style={{
                fontSize: '4rem', // Large size for 600x600 board squares
                color: color === 'w' ? '#fff' : '#000',
                textShadow: color === 'w' ? '0 0 2px #000' : '0 0 2px #fff', // Stroke effect
                fontFamily: 'serif' // Serif fonts usually have better chess glyphs
            }}>
                {symbol}
            </span>
        </div>
    );
};
