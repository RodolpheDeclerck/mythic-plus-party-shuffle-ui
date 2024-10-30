import React from 'react';
import './ShuffleButton.css';

interface ShuffleButtonProps {
    onShuffle: () => void;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ onShuffle }) => {
    return (
        <div className="shuffle-button-container">
            <button className="shuffle-button"  onClick={onShuffle}>
                <h1>Shuffle</h1>
            </button>
        </div>
    );
};

export default ShuffleButton;
