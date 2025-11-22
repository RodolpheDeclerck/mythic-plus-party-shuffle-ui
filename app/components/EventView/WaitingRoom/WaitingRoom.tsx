import React from 'react';
import { faShield, faHeart, faGavel, faHatWizard } from '@fortawesome/free-solid-svg-icons';
import RoleSection from '../RoleSection/RoleSection';
import { Character } from '../../../types/Character';
import './WaitingRoom.css';

interface WaitingRoomProps {
    tanks: Character[];
    heals: Character[];
    melees: Character[];
    dist: Character[];
    isAuthenticated: boolean;
    onDelete: (id: number) => Promise<void>;
    onUpdate: (character: any) => void;
    highlightedId: number | undefined;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
    tanks,
    heals,
    melees,
    dist,
    isAuthenticated,
    onDelete,
    onUpdate,
    highlightedId
}) => {
    return (
        <div className="table-container">
            <RoleSection
                icon={faShield}
                title="Tanks"
                characters={tanks}
                onDelete={isAuthenticated ? onDelete : undefined}
                onUpdate={isAuthenticated ? onUpdate : undefined}
                highlightedId={highlightedId}
                className="role-icon-tank"
            />
            <RoleSection
                icon={faHeart}
                title="Heals"
                characters={heals}
                onDelete={isAuthenticated ? onDelete : undefined}
                onUpdate={isAuthenticated ? onUpdate : undefined}
                highlightedId={highlightedId}
                className="role-icon-heal"
            />
            <RoleSection
                icon={faGavel}
                title="Melees"
                characters={melees}
                onDelete={isAuthenticated ? onDelete : undefined}
                onUpdate={isAuthenticated ? onUpdate : undefined}
                highlightedId={highlightedId}
                className="role-icon-melee"
            />
            <RoleSection
                icon={faHatWizard}
                title="Dist"
                characters={dist}
                onDelete={isAuthenticated ? onDelete : undefined}
                onUpdate={isAuthenticated ? onUpdate : undefined}
                highlightedId={highlightedId}
                className="role-icon-dist"
            />
        </div>
    );
};

export default WaitingRoom;
