import React from 'react';
import { Character } from '../../../types/Character';
import { useTranslation } from 'react-i18next';
import './CharacterTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faShield, faHeart, faGavel, faHatWizard } from '@fortawesome/free-solid-svg-icons';
import { CharacterClassColors } from '../../../enums/CharacterClassColours';
import { CharacterClass } from '../../../enums/CharacterClass';
import { useDrag } from 'react-dnd';

interface CharacterTableProps {
    characters: Character[];
    onDelete?: (id: number) => void;
    onUpdate?: (character: Character) => void;
    highlightedId?: number;
    isDraggable?: boolean;
    onDragStart?: (character: Character) => void;
    onDragEnd?: () => void;
    onDrop?: (partyIndex: number, position: number, character: Character) => void;
}

interface DraggableRowProps {
    character: Character;
    isDraggable: boolean;
    highlightedId?: number;
    onUpdate?: (character: Character) => void;
    onDelete?: (id: number) => void;
    onDragStart?: (character: Character) => void;
    onDragEnd?: () => void;
}

interface DragItem {
    character: Character;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
    character,
    isDraggable,
    highlightedId,
    onUpdate,
    onDelete,
    onDragStart,
    onDragEnd
}) => {
    const { t } = useTranslation();

    const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
        type: 'CHARACTER',
        item: { character },
        canDrag: () => isDraggable,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    React.useEffect(() => {
        if (isDragging && onDragStart) {
            onDragStart(character);
        }
        if (!isDragging && onDragEnd) {
            onDragEnd();
        }
    }, [isDragging, character, onDragStart, onDragEnd]);

    return (
        <tr
            ref={drag}
            className={`${character.id === highlightedId ? 'highlight' : ''} ${isDragging ? 'dragging' : ''}`}
            onClick={() => onUpdate && onUpdate(character)}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                <b>{character.id}</b>
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                <b>{character.name}</b>
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                <b>{character.characterClass}</b>
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                <b>{t(`specializations.${character.specialization}`)}</b>
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                <b>{character.iLevel}</b> <br></br>
                ({character.keystoneMinLevel}-{character.keystoneMaxLevel})
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                {character.bloodLust && (
                    <FontAwesomeIcon
                        icon={faCheck}
                        style={{ color: 'black' }}
                    />
                )}
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                {character.battleRez && (
                    <FontAwesomeIcon
                        icon={faCheck}
                        style={{ color: 'black' }}
                    />
                )}
            </td>
            <td style={{ color: 'black', backgroundColor: CharacterClassColors[character.characterClass as CharacterClass] }}>
                {onDelete && (
                    <button
                        className="delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(character.id);
                        }}
                    >
                        Delete
                    </button>
                )}
            </td>
        </tr>
    );
};

const CharacterTable: React.FC<CharacterTableProps> = ({
    characters,
    onDelete,
    onUpdate,
    highlightedId,
    isDraggable = false,
    onDragStart,
    onDragEnd
}) => {
    return (
        <table>
            <thead>
                <tr>
                    <th style={{ width: '10%' }}>#</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '15%' }}>Class</th>
                    <th style={{ width: '15%' }}>Specialization</th>
                    <th style={{ width: '15%' }}>
                        Items Level <br /> (Key min-max)
                    </th>
                    <th style={{ width: '15%' }}>Blood Lust</th>
                    <th style={{ width: '15%' }}>Battle Rez</th>
                    <th style={{ width: '10%' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {characters.map((character) => (
                    <DraggableRow
                        key={character.id}
                        character={character}
                        isDraggable={isDraggable}
                        highlightedId={highlightedId}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default CharacterTable;
