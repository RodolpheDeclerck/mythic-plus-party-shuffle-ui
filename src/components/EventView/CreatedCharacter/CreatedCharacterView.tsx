import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../SelectField';
import { useSpecializations } from '../../../context/SpecializationsContext';
import { useClasses } from '../../../context/ClassesContext';
import './CreatedCharacterView.css';
import { deleteCharacter, upsertCharacter } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import InputField from '../../InputFieldProps';

interface CreatedCharacterProps {
    character: any;
    onSave: (updatedCharacter: any) => void;
    onDelete: (id: number) => void;
    isAdmin: boolean; // Nouvelle prop pour indiquer si l'utilisateur est admin
}

const CreatedCharacterView: React.FC<CreatedCharacterProps> = ({ character, onSave, onDelete, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editILevel, setILevel] = useState('');
    const { t } = useTranslation();
    const { specializations, fetchSpecializations } = useSpecializations();
    const [selectSpecialization, setSelectSpecialization] = useState<string>('');
    const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
    const { classes } = useClasses();
    const navigate = useNavigate();

    // Initialise les valeurs en fonction du personnage chargé
    useEffect(() => {
        if (character) {
            setEditedName(character.name || '');
            setILevel(character.iLevel || '');
            setSelectCharacterClass(character.characterClass || '');
            setSelectSpecialization(character.specialization || '');

            // Charge les spécialisations pour la classe existante
            if (character.characterClass) {
                fetchSpecializations(character.characterClass);
            }
        }
    }, [character, fetchSpecializations]);

    const handleClassChange = (selectedClass: string) => {
        setSelectCharacterClass(selectedClass);
        setSelectSpecialization('');
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
            name: editedName || 'Unnamed Character',
            characterClass: selectCharacterClass || 'Unknown Class',
            specialization: selectSpecialization || 'Unknown Specialization',
            iLevel: editILevel || 0
        };

        try {
            const savedCharacter = await upsertCharacter(updatedCharacter);
            if (!isAdmin) {
                onSave(savedCharacter);
            }
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
            if (!isAdmin) {
                await deleteCharacter(character?.id || 0);
                onDelete(character?.id || 0);
            }
        } catch (error) {
            console.error('Failed to delete character:', error);
        } finally {
            if (!isAdmin) {
                localStorage.removeItem('createdCharacter');
            }
            navigate('/event/join');
        }
    };

    return (
        <div className={`created-character-info ${isEditing ? 'editing' : ''}`}>
            <div className="character-field"><b>ID:</b> {character?.id || '-'}</div>
            <div className="character-field">
                <b>Name: </b>
                {isEditing ? (
                    <InputField
                        label=""
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                        placeholder="Enter character name"
                    />
                ) : (
                    character?.name || 'Unnamed Character'
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
                    character?.characterClass || 'Unknown Class'
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
                    t(`specializations.${character?.specialization}`) || 'Unknown Specialization'
                )}
            </div>
            <div className="character-field">
                <b>ILevel: </b>
                {isEditing ? (
                    <InputField
                        label=""
                        type="number"
                        value={editILevel}
                        onChange={handleILevelChange}
                        placeholder="Enter item level"
                    />
                ) : (
                    character?.iLevel !== undefined ? character.iLevel : 'Unknown'
                )}
            </div>
            <div className="button-container">
                {isEditing ? (
                    <>
                        <button onClick={handleSave}>Save</button>
                        <button className='cancel-button' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)}>{isAdmin ? 'Add' : 'Update'}
                        </button>
                        <button className='cancel-button' onClick={handleLeave}>Leave</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatedCharacterView;
