import React from 'react';
import './ShuffleButton.css'; // Import your CSS file

interface ShuffleButtonProps {
    onShuffle: () => void;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ onShuffle }) => {
    return (
        <div className="shuffle-button-container">
            <button onClick={onShuffle}>
                Shuffle
            </button>
        </div>
    );
};

export default ShuffleButton;
