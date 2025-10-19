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
    
    return { 
        createdCharacter, 
        setCreatedCharacter, 
        isEditing, 
        setIsEditing,
        handleSaveCharacter,
        handleUpdate
    };
};
