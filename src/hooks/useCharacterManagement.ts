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
    
    return { 
        createdCharacter, 
        setCreatedCharacter, 
        isEditing, 
        setIsEditing,
        handleSaveCharacter,
        handleUpdate,
        handleDelete
    };
};
