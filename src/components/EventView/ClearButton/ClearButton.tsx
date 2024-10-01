import React from 'react';
import './ClearButton.css';

interface ClearButtonProps {
    onClear: () => void;
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear }) => {
    return (
        <button className="clear-button" onClick={onClear} style={{ marginTop: '20px' }}>
            Clear
        </button>
    );
};

export default ClearButton;
