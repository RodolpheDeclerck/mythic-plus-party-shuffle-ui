import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../SelectField';
import { useSpecializations } from '../../../context/SpecializationsContext';
import { useClasses } from '../../../context/ClassesContext';
import './CreatedCharacterView.css';
import { deleteCharacter, upsertCharacter } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

interface CreatedCharacterProps {
    character: any;
    onSave: (updatedCharacter: any) => void;
    onDelete: (id: number) => void; // Ensure this is defined in the component's props
}

const CreatedCharacterView: React.FC<CreatedCharacterProps> = ({ character, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(character.name);
    const { t } = useTranslation();
    const { specializations, fetchSpecializations } = useSpecializations();
    const [selectSpecialization, setSelectSpecialization] = useState<string>(character.specialization);
    const [selectCharacterClass, setSelectCharacterClass] = useState<string>(character.characterClass); // Initialiser avec la classe du personnage
    const { classes } = useClasses(); // Utiliser le contexte pour les classes
    const navigate = useNavigate();

    useEffect(() => {
        if (selectCharacterClass) {
            fetchSpecializations(selectCharacterClass);
        }
    }, [selectCharacterClass, fetchSpecializations]);

    const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClass = event.target.value;
        setSelectCharacterClass(selectedClass);
        setSelectSpecialization(''); // Réinitialiser la spécialisation lors du changement de classe
        fetchSpecializations(selectedClass);
    };

    const handleSpecializationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSpecialization = event.target.value;
        setSelectSpecialization(selectedSpecialization);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedName(event.target.value);
    };

    const handleSave = async () => {
        const updatedCharacter = {
            ...character,
            name: editedName,
            characterClass: selectCharacterClass,
            specialization: selectSpecialization,
        };

        try {
            // Await the response from the upsert API call
            const savedCharacter = await upsertCharacter(updatedCharacter);

            // Use the response to update the character, including the ID
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
            await deleteCharacter(character.id);

            // Supprimer complètement le personnage du localStorage
            localStorage.removeItem('createdCharacter');

            // Rediriger vers la page d'accueil
            navigate('/');

            // Notifier le parent de la suppression
            onDelete(character.id);
        } catch (error) {
            console.error('Failed to delete character:', error);
        }
    };

    return (
        <div className="created-character-info">
            <div className="character-field"><b>ID:</b> {character.id}</div>
            <div className="character-field">
                <b>Name: </b>
                {isEditing ? (
                    <input
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                    />
                ) : (
                    character.name
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
                    character.characterClass
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
                    t(`specializations.${character.specialization}`)
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
