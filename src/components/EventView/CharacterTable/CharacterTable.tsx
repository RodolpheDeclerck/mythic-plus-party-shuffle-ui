import React from 'react';
import { Character } from '../../../types/Character';
import { useTranslation } from 'react-i18next';
import './CharacterTable.css';

interface CharacterTableProps {
    characters: Character[];
    onDelete?: (id: number) => void;
}

const CharacterTable: React.FC<CharacterTableProps> = ({ characters, onDelete }) => {
    const { t } = useTranslation();

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ width: '10%' }}>#</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '15%' }}>Class</th>
                    <th style={{ width: '15%' }}>Specialization</th>
                    <th style={{ width: '15%' }}>BloodLust</th>
                    <th style={{ width: '15%' }}>BattleRez</th>
                    <th style={{ width: '10%' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {characters.map((character, index) => (
                    <tr key={character.id}>
                        <td>{character.id}</td>
                        <td>{character.name}</td>
                        <td>{character.characterClass}</td>
                        <td>{t(`specializations.${character.specialization}`)}</td>
                        <td>{character.bloodLust ? 'Yes' : 'No'}</td>
                        <td>{character.battleRez ? 'Yes' : 'No'}</td>
                        <td>
                            {onDelete && (
                                <button className="delete-button" onClick={() => onDelete(character.id)}>Delete</button>
                            )}                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CharacterTable;
