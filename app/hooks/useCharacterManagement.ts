import { useState } from 'react';
import { deleteCharacter, deleteCharacters, fetchCharacters as fetchCharactersApi } from '../services/api';

export const useCharacterManagement = (eventCode: string, refetchCharacters?: () => void) => {
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSaveCharacter = (updatedCharacter: any) => {
        setCreatedCharacter({ ...updatedCharacter });
        localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
        // Trigger refetch if callback provided
        if (refetchCharacters) {
            refetchCharacters();
        }
    };
    
    const handleUpdate = (character: any) => {
        setCreatedCharacter(character);
        setIsEditing(true);
    };
    
    const handleDelete = async (id: number) => {
        try {
            await deleteCharacter(id);
            // Trigger refetch if callback provided
            if (refetchCharacters) {
                refetchCharacters();
            }
        } catch (error) {
            console.error(`Error deleting character with ID ${id}:`, error);
            setError('Failed to delete character');
        }
    };
    
    const handleClear = async (characters: any[]) => {
        try {
            const ids = characters.map((character) => character.id);
            await deleteCharacters(ids);
            // Trigger refetch if callback provided
            if (refetchCharacters) {
                refetchCharacters();
            }
        } catch (error) {
            console.error('Error deleting characters:', error);
            setError('Failed to delete characters');
        }
    };
    
    const handleCharacterDeletion = (deletedId: number) => {
        // This function is now handled by the parent component's state management
        // Characters will be updated via WebSocket
    };
    
    return { 
        createdCharacter, 
        setCreatedCharacter, 
        isEditing, 
        setIsEditing,
        error,
        handleSaveCharacter,
        handleUpdate,
        handleDelete,
        handleClear,
        handleCharacterDeletion
    };
};
