import React from 'react';

export const Square = ({ isBlack, children, onClick, isSelected, isHighlighted, isLastMove }) => {
    const baseColor = isBlack ? 'bg-[#769656]' : 'bg-[#EEEED2]';
    const selectedColor = isSelected ? 'bg-yellow-200' : '';
    const highlightColor = isHighlighted ? (isBlack ? 'after:bg-black/20' : 'after:bg-black/20') : '';

    // Using a pseudo-element for the highlight dot/ring

    return (
        <div
            className={`${baseColor} ${selectedColor} w-full h-full relative flex items-center justify-center cursor-pointer select-none`}
            onClick={onClick}
        >
            {/* Highlight Dot */}
            {isHighlighted && !children && (
                <div className="absolute w-4 h-4 bg-black/20 rounded-full pointer-events-none" />
            )}

            {/* Highlight Ring for Capture */}
            {isHighlighted && children && (
                <div className="absolute w-full h-full border-4 border-black/20 rounded-full pointer-events-none" />
            )}

            {children}

            {/* Coordinate labels could go here if needed */}
        </div>
    );
};
