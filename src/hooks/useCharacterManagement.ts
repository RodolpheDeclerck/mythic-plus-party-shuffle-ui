import { useState } from 'react';

export const useCharacterManagement = () => {
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const handleSaveCharacter = (updatedCharacter: any) => {
        setCreatedCharacter({ ...updatedCharacter });
        localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
    };
    
    const handleUpdate = (character: any) => {
        setCreatedCharacter(character);
        setIsEditing(true);
    };
    
    const handleDelete = async (id: number, deleteCharacterApi: (id: number) => Promise<void>, fetchCharacters: () => Promise<void>, setErrorState: (error: string) => void) => {
        try {
            await deleteCharacterApi(id);
            fetchCharacters();
        } catch (error) {
            console.error(`Error deleting character with ID ${id}:`, error);
            setErrorState('Failed to delete character');
        }
    };
    
    const handleClear = async (characters: any[], deleteCharactersApi: (ids: number[]) => Promise<void>, fetchCharacters: () => Promise<void>, setErrorState: (error: string) => void) => {
        try {
            const ids = characters.map((character) => character.id);
            await deleteCharactersApi(ids);
            fetchCharacters();
        } catch (error) {
            console.error('Error deleting characters:', error);
            setErrorState('Failed to delete characters');
        }
    };
    
    return { 
        createdCharacter, 
        setCreatedCharacter, 
        isEditing, 
        setIsEditing,
        handleSaveCharacter,
        handleUpdate,
        handleDelete,
        handleClear
    };
};
