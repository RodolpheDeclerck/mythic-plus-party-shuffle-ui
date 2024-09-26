import React from 'react';
import { Character } from '../types/Character';

interface CharacterTableProps {
    characters: Character[];
    onDelete: (id: number) => void;
}

const CharacterTable: React.FC<CharacterTableProps> = ({ characters, onDelete }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Specialization</th>
                    <th>Role</th>
                    <th>BloodLust</th>
                    <th>BattleRez</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {characters.map((character, index) => (
                    <tr key={character.id}>
                        <td>{index + 1}</td>
                        <td>{character.name}</td>
                        <td>{character.characterClass}</td>
                        <td>{character.specialization}</td>
                        <td>{character.role}</td>
                        <td>{character.bloodLust ? 'Yes' : 'No'}</td>
                        <td>{character.battleRez ? 'Yes' : 'No'}</td>
                        <td>
                            <button onClick={() => onDelete(character.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CharacterTable;
