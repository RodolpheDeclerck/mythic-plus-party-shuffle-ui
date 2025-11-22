import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import CharacterTable from '../CharacterTable/CharacterTable';
import { Character } from '../../../types/Character';
import './RoleSection.css';

interface RoleSectionProps {
    icon: IconDefinition;
    title: string;
    characters: Character[];
    onDelete?: (id: number) => void;
    onUpdate?: (character: Character) => void;
    highlightedId?: number;
    className?: string;
}

const RoleSection: React.FC<RoleSectionProps> = ({
    icon,
    title,
    characters,
    onDelete,
    onUpdate,
    highlightedId,
    className = ''
}) => {
    return (
        <div className={`table-wrapper ${className}`}>
            <div className="icon-text-container">
                <FontAwesomeIcon icon={icon} className="role-icon" />
                <h2>{title} ({characters.length})</h2>
            </div>
            <CharacterTable
                characters={characters}
                onDelete={onDelete}
                onUpdate={onUpdate}
                highlightedId={highlightedId}
            />
        </div>
    );
};

export default RoleSection;
