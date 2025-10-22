import React from 'react';
import './CharacterFormField.css';

interface CharacterFormFieldProps {
    label: string;
    value?: string | number;
    isEditing: boolean;
    children?: React.ReactNode;
}

const CharacterFormField: React.FC<CharacterFormFieldProps> = ({ 
    label, 
    value, 
    isEditing, 
    children 
}) => {
    return (
        <div className="character-field">
            <b>{label}: </b>
            {isEditing ? (
                children
            ) : (
                value || '-'
            )}
        </div>
    );
};

export default CharacterFormField;
