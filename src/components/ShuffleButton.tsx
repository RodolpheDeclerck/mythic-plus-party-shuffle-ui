import React from 'react';

interface ShuffleButtonProps {
    onShuffle: () => void;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ onShuffle }) => {
    return (
        <button onClick={onShuffle} style={{ marginTop: '20px' }}>
            Launch Event
        </button>
    );
};

export default ShuffleButton;
