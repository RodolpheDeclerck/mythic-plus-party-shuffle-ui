import React from 'react';
import { Character } from '../../../types/Character';
import { useTranslation } from 'react-i18next';
import './CharacterTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface CharacterTableProps {
    characters: Character[];
    onDelete?: (id: number) => void;
    highlightedId?: number; // Add this prop for row highlighting
}

const CharacterTable: React.FC<CharacterTableProps> = ({ characters, onDelete, highlightedId }) => {
    const { t } = useTranslation();

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ width: '10%' }}>#</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '15%' }}>Class</th>
                    <th style={{ width: '15%' }}>Specialization</th>
                    <th style={{ width: '15%' }}>Blood Lust</th>
                    <th style={{ width: '15%' }}>Battle Rez</th>
                    <th style={{ width: '10%' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {characters.map((character) => (
                    <tr key={character.id} className={character.id === highlightedId ? 'highlight' : ''}>
                        <td>{character.id}</td>
                        <td><b>{character.name}</b></td>
                        <td>{character.characterClass}</td>
                        <td>{t(`specializations.${character.specialization}`)}</td>
                        <td>
                            <FontAwesomeIcon
                                icon={character.bloodLust ? faCheck : faTimes}
                                style={{ color: character.bloodLust ? 'green' : 'red' }}
                            />
                        </td>
                        <td>
                            <FontAwesomeIcon
                                icon={character.battleRez ? faCheck : faTimes}
                                style={{ color: character.battleRez ? 'green' : 'red' }}
                            />
                        </td>
                        <td>
                            {onDelete && (
                                <button className="delete-button" onClick={() => onDelete(character.id)}>Delete</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CharacterTable;
