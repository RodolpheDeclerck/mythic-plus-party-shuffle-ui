import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../SelectField';
import { useSpecializations } from '../../../context/SpecializationsContext';
import { useClasses } from '../../../context/ClassesContext';
import './CreatedCharacterView.css';
import { deleteCharacter, upsertCharacter } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import InputField from '../../InputFieldProps';
import AuthButtons from '../../Authentication/AuthButtons';

interface CreatedCharacterProps {
    character: any;
    onSave: (updatedCharacter: any) => void;
    onDelete: (id: number) => void; // Ensure this is defined in the component's props
}

const CreatedCharacterView: React.FC<CreatedCharacterProps> = ({ character, onSave, onDelete }) => {
    // Utilise des valeurs par défaut si `character` est `null` ou `undefined`
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(character?.name || ''); // Valeur par défaut vide
    const [editILevel, setILevel] = useState(character?.iLevel || ''); // Valeur par défaut vide
    const { t } = useTranslation();
    const { specializations, fetchSpecializations } = useSpecializations();
    const [selectSpecialization, setSelectSpecialization] = useState<string>(character?.specialization || ''); // Valeur par défaut vide
    const [selectCharacterClass, setSelectCharacterClass] = useState<string>(character?.characterClass || ''); // Valeur par défaut vide
    const { classes } = useClasses();
    const navigate = useNavigate();

    useEffect(() => {
        if (selectCharacterClass) {
            fetchSpecializations(selectCharacterClass);
        }
    }, [selectCharacterClass, fetchSpecializations]);

    const handleClassChange = (selectedClass: string) => {
        setSelectCharacterClass(selectedClass);
        setSelectSpecialization(''); // Réinitialiser la spécialisation lors du changement de classe
        fetchSpecializations(selectedClass);
    };

    const handleSpecializationChange = (selectedSpecialization: string) => {
        setSelectSpecialization(selectedSpecialization);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedName(event.target.value);
    };

    const handleILevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setILevel(event.target.value);
    };

    const handleSave = async () => {
        const updatedCharacter = {
            ...character,
            name: editedName || 'Unnamed Character', // Valeur par défaut si vide
            characterClass: selectCharacterClass || 'Unknown Class', // Valeur par défaut si vide
            specialization: selectSpecialization || 'Unknown Specialization', // Valeur par défaut si vide
            iLevel: editILevel || 0 // Valeur par défaut si vide
        };

        try {
            const savedCharacter = await upsertCharacter(updatedCharacter);
            onSave(savedCharacter);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to upsert character:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleLeave = async () => {
        try {
            await deleteCharacter(character?.id || 0); // Valeur par défaut de 0 si id est absent
            onDelete(character?.id || 0);
        } catch (error) {
            console.error('Failed to delete character:', error);
        } finally {
            localStorage.removeItem('createdCharacter');
            navigate('/event/join');
        }
    };

    return (
        <div className="created-character-info">
            <div className="character-field"><b>ID:</b> {character?.id || '-'}</div> {/* Valeur par défaut '-' */}
            <div className="character-field">
                <b>Name: </b>
                {isEditing ? (
                    <InputField
                        label="Character Name:"
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                        placeholder="Enter character name"
                    />
                ) : (
                    character?.name || 'Unnamed Character' // Valeur par défaut si absente
                )}
            </div>
            <div className="character-field">
                <b>Class: </b>
                {isEditing ? (
                    <SelectField
                        label=""
                        options={classes.map(cls => ({
                            value: cls,
                            label: `${cls}`,
                        }))}
                        value={selectCharacterClass}
                        onChange={handleClassChange}
                        placeholder="Please select a class"
                    />
                ) : (
                    character?.characterClass || 'Unknown Class' // Valeur par défaut si absente
                )}
            </div>
            <div className="character-field">
                <b>Specialization: </b>
                {isEditing ? (
                    <SelectField
                        label=""
                        options={specializations.map(spec => ({
                            value: spec,
                            label: t(`specializations.${spec}`),
                        }))}
                        value={selectSpecialization}
                        onChange={handleSpecializationChange}
                        placeholder="Please select a specialization"
                    />
                ) : (
                    t(`specializations.${character?.specialization}`) || 'Unknown Specialization' // Valeur par défaut
                )}
            </div>
            <div className="character-field">
                <b>ILevel: </b>
                {isEditing ? (
                    <InputField
                        label="Item Level:"
                        type="number"
                        value={editILevel}
                        onChange={handleILevelChange}
                        placeholder="Enter item level"
                    />
                ) : (
                    character?.iLevel !== undefined ? character.iLevel : 'Unknown' // Valeur par défaut
                )}
            </div>
            <div className="character-field">
                {isEditing ? (
                    <>
                        <button onClick={handleSave}>Save</button>
                        <button className='cancel-button' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)}>Update</button>
                        <button className='cancel-button' onClick={handleLeave}>Leave</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatedCharacterView;
