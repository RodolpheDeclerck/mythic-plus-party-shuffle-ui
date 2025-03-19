import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../SelectField';
import { useSpecializations } from '../../../context/SpecializationsContext';
import { useClasses } from '../../../context/ClassesContext';
import './CreatedCharacterView.css';
import { deleteCharacter, upsertCharacter } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import InputField from '../../InputFieldProps';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../../constants/itemLevels';

interface CreatedCharacterProps {
    character: any;
    onSave: (updatedCharacter: any) => void;
    onDelete: (id: number) => void;
    isAdmin: boolean;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    eventCode: string;
}

const CreatedCharacterView: React.FC<CreatedCharacterProps> = ({
    character,
    onSave,
    onDelete,
    isAdmin,
    isEditing,
    setIsEditing,
    eventCode,
}) => {
    const [editedName, setEditedName] = useState('');
    const [editILevel, setILevel] = useState(ITEM_LEVEL_MIN.toString());
    const [keystoneMaxLevel, setKeystoneMaxLevel] = useState('');
    const [keystoneMinLevel, setKeystoneMinLevel] = useState('');
    const { t } = useTranslation();
    const { specializations, fetchSpecializations } = useSpecializations();
    const [selectSpecialization, setSelectSpecialization] = useState<string>('');
    const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
    const { classes } = useClasses();
    const navigate = useNavigate();

    useEffect(() => {
        if (character && isEditing) {
            setEditedName(character.name || '');
            setILevel(character.iLevel?.toString() || ITEM_LEVEL_MIN.toString());
            setKeystoneMinLevel(character.keystoneMinLevel || KEYSTONE_MIN_LEVEL.toString());
            setKeystoneMaxLevel(character.keystoneMaxLevel || KEYSTONE_MAX_LEVEL.toString());
            setSelectCharacterClass(character.characterClass || '');
            setSelectSpecialization(character.specialization || '');

            if (character.characterClass) {
                fetchSpecializations(character.characterClass);
            }
        } else if (!character) {
            setEditedName('');
            setILevel(ITEM_LEVEL_MIN.toString());
            setKeystoneMinLevel(KEYSTONE_MIN_LEVEL.toString());
            setKeystoneMaxLevel(KEYSTONE_MAX_LEVEL.toString());
            setSelectCharacterClass('');
            setSelectSpecialization('');
        }
    }, [character, isEditing, fetchSpecializations]);

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
        const inputValue = event.target.value;
        
        // Si le champ est vide, on met la valeur minimale
        if (inputValue === '') {
            setILevel(ITEM_LEVEL_MIN.toString());
            return;
        }

        // On convertit en nombre et on applique les limites
        const numValue = parseInt(inputValue);
        if (isNaN(numValue)) {
            setILevel(ITEM_LEVEL_MIN.toString());
            return;
        }

        const value = Math.max(ITEM_LEVEL_MIN, Math.min(numValue, ITEM_LEVEL_MAX));
        setILevel(value.toString());
    };

    const handleKeystoneMinLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(KEYSTONE_MIN_LEVEL, Math.min(parseInt(event.target.value) || KEYSTONE_MIN_LEVEL, parseInt(keystoneMaxLevel) || KEYSTONE_MAX_LEVEL));
        setKeystoneMinLevel(value.toString());
    };

    const handleKeystoneMaxLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(parseInt(keystoneMinLevel) || KEYSTONE_MIN_LEVEL, Math.min(parseInt(event.target.value) || KEYSTONE_MAX_LEVEL, KEYSTONE_MAX_LEVEL));
        setKeystoneMaxLevel(value.toString());
    };

    const handleSave = async () => {
        const minLevel = Math.max(KEYSTONE_MIN_LEVEL, parseInt(keystoneMinLevel) || KEYSTONE_MIN_LEVEL);
        const maxLevel = Math.min(KEYSTONE_MAX_LEVEL, Math.max(minLevel, parseInt(keystoneMaxLevel) || KEYSTONE_MAX_LEVEL));
        const itemLevel = Math.max(ITEM_LEVEL_MIN, Math.min(parseInt(editILevel) || ITEM_LEVEL_MIN, ITEM_LEVEL_MAX));
        
        const updatedCharacter = {
            ...character,
            name: editedName || 'Unnamed Character',
            characterClass: selectCharacterClass || 'Unknown Class',
            specialization: selectSpecialization || 'Unknown Specialization',
            iLevel: itemLevel,
            keystoneMinLevel: minLevel,
            keystoneMaxLevel: maxLevel,
            eventCode: eventCode,
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

    const handleAdd = () => {
        setIsEditing(true);
        onSave({});
    };

    const handleLeave = async () => {
        try {
            await deleteCharacter(character?.id || 0);
            onDelete(character?.id || 0);
        } catch (error) {
            console.error('Failed to delete character:', error);
        } finally {
            localStorage.removeItem('createdCharacter');
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
                        min={ITEM_LEVEL_MIN}
                        max={ITEM_LEVEL_MAX}
                    />
                ) : (
                    character?.iLevel !== undefined ? character.iLevel : ITEM_LEVEL_MIN
                )}
            </div>
            <div className="character-field">
                <b>KeyMin: </b>
                {isEditing ? (
                    <InputField
                        label=""
                        type="number"
                        value={keystoneMinLevel}
                        onChange={handleKeystoneMinLevelChange}
                        placeholder="Enter keystone min level"
                        min={KEYSTONE_MIN_LEVEL}
                        max={parseInt(keystoneMaxLevel) || KEYSTONE_MAX_LEVEL}
                    />
                ) : (
                    character?.keystoneMinLevel !== undefined ? character.keystoneMinLevel : KEYSTONE_MIN_LEVEL
                )}
            </div>
            <div className="character-field">
                <b>KeyMax: </b>
                {isEditing ? (
                    <InputField
                        label=""
                        type="number"
                        value={keystoneMaxLevel}
                        onChange={handleKeystoneMaxLevelChange}
                        placeholder="Enter keystone max level"
                        min={parseInt(keystoneMinLevel) || KEYSTONE_MIN_LEVEL}
                        max={KEYSTONE_MAX_LEVEL}
                    />
                ) : (
                    character?.keystoneMaxLevel !== undefined ? character.keystoneMaxLevel : KEYSTONE_MAX_LEVEL
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
                        {isAdmin ? (
                            <button onClick={handleAdd}>Add</button>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)}>{'Update'}</button>
                                <button className='cancel-button' onClick={handleLeave}>Leave</button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatedCharacterView;
