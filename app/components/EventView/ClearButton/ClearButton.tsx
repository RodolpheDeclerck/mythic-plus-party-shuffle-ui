import React from 'react';
import './ClearButton.css';

interface ClearButtonProps {
    onClear: () => void;
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear }) => {
    return (
        <button className="clear-button" onClick={onClear}>
            Clear
        </button>
    );
};

export default ClearButton;
