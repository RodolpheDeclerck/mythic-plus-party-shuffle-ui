import { useState } from 'react';

export const useCharacterManagement = () => {
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const handleSaveCharacter = (updatedCharacter: any) => {
        setCreatedCharacter({ ...updatedCharacter });
        localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
    };
    
    return { 
        createdCharacter, 
        setCreatedCharacter, 
        isEditing, 
        setIsEditing,
        handleSaveCharacter
    };
};
