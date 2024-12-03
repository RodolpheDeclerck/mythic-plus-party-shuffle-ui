import React from 'react';
import { Character } from '../../../types/Character';
import { useTranslation } from 'react-i18next';
import './CharacterTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CharacterClassColors } from '../../../enums/CharacterClassColours';
import { CharacterClass } from '../../../enums/CharacterClass';

interface CharacterTableProps {
    characters: Character[];
    onDelete?: (id: number) => void;
    onUpdate?: (character: Character) => void; // Nouvelle prop pour Update
    highlightedId?: number; // Add this prop for row highlighting
}

const CharacterTable: React.FC<CharacterTableProps> = ({ characters, onDelete, onUpdate, highlightedId }) => {
    const { t } = useTranslation();

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ width: '10%' }}>#</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '15%' }}>Class</th>
                    <th style={{ width: '15%' }}>Specialization</th>
                    <th style={{ width: '15%' }}>Items Level</th>
                    <th style={{ width: '15%' }}>Blood Lust</th>
                    <th style={{ width: '15%' }}>Battle Rez</th>
                    <th style={{ width: '10%' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {characters.map((character) => (
                    <tr
                        key={character.id}
                        className={character.id === highlightedId ? 'highlight' : ''}
                        onClick={() => onUpdate && onUpdate(character)} // Appel de onUpdate lors du clic sur la ligne
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
                            <b>{character.iLevel}</b>
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
                                        e.stopPropagation(); // Empêche onClick de la ligne de se déclencher
                                        onDelete(character.id);
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CharacterTable;
