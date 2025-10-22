import React from 'react';
import ClearButton from '../ClearButton/ClearButton';
import { Character } from '../../../types/Character';
import './WaitingRoomHeader.css';

interface WaitingRoomHeaderProps {
    characters: Character[];
    isAuthenticated: boolean;
    onClear: (characters: Character[]) => void;
}

const WaitingRoomHeader: React.FC<WaitingRoomHeaderProps> = ({
    characters,
    isAuthenticated,
    onClear
}) => {
    return (
        <div className="title-container">
            <div className="title-clear-container">
                <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                {isAuthenticated && <ClearButton onClear={() => onClear(characters)} />}
            </div>
        </div>
    );
};

export default WaitingRoomHeader;
