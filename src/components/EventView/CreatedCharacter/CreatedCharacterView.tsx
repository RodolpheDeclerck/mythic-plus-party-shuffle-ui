import React from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../SelectField';
import { useSpecializations } from '../../../context/SpecializationsContext';
import { useClasses } from '../../../context/ClassesContext';
import './CreatedCharacterView.css';
import { useNavigate } from 'react-router-dom';
import InputField from '../../InputFieldProps';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../../constants/itemLevels';
import { useCharacterForm } from '../../../hooks/useCharacterForm';
import { useCharacterActions } from '../../../hooks/useCharacterActions';
import CharacterFormField from './CharacterFormField/CharacterFormField';
import ValidatedNumberInput from './ValidatedNumberInput/ValidatedNumberInput';

const NAME_MAX_LENGTH = 12;

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
    // ===== HOOKS & CONTEXT =====
    const { t } = useTranslation();
    const { specializations, fetchSpecializations } = useSpecializations();
    const { classes } = useClasses();
    const navigate = useNavigate();

    // ===== CUSTOM HOOKS =====
    // Form state management
    const formState = useCharacterForm(character, isEditing, fetchSpecializations);
    
    // Character actions (save/delete/leave)
    const actions = useCharacterActions(eventCode, onSave, onDelete, navigate);

    // ===== EVENT HANDLERS =====
    // Handle save with form validation
    const handleSave = async () => {
        const formValues = formState.getFormValues();
        await actions.handleSave(formValues, character, isAdmin, setIsEditing);
    };

    // Handle leave/delete character
    const handleLeave = async () => {
        await actions.handleLeave(character);
    };

    // Handle add new character
    const handleAdd = () => {
        actions.handleAdd(setIsEditing);
    };

    // Handle cancel editing
    const handleCancel = () => {
        actions.handleCancel(setIsEditing);
    };

    return (
        <div className={`created-character-info ${isEditing ? 'editing' : ''}`}>
            {/* ===== CHARACTER ID ===== */}
            <CharacterFormField 
                label="ID" 
                value={character?.id || '-'} 
                isEditing={false} 
            />
            
            {/* ===== CHARACTER NAME ===== */}
            <CharacterFormField 
                label="Name" 
                value={character?.name || 'Unnamed Character'} 
                isEditing={isEditing}
            >
                {isEditing && (
                    <InputField
                        label=""
                        type="text"
                        value={formState.editedName}
                        onChange={formState.handleNameChange}
                        placeholder="Enter character name"
                        maxLength={NAME_MAX_LENGTH}
                    />
                )}
            </CharacterFormField>
            
            {/* ===== CHARACTER CLASS ===== */}
            <CharacterFormField 
                label="Class" 
                value={character?.characterClass || 'Unknown Class'} 
                isEditing={isEditing}
            >
                {isEditing && (
                    <SelectField
                        label=""
                        options={classes.map(cls => ({
                            value: cls,
                            label: `${cls}`,
                        }))}
                        value={formState.selectCharacterClass}
                        onChange={formState.handleClassChange}
                        placeholder="Please select a class"
                    />
                )}
            </CharacterFormField>
            
            {/* ===== CHARACTER SPECIALIZATION ===== */}
            <CharacterFormField 
                label="Specialization" 
                value={t(`specializations.${character?.specialization}`) || 'Unknown Specialization'} 
                isEditing={isEditing}
            >
                {isEditing && (
                    <SelectField
                        label=""
                        options={specializations.map(spec => ({
                            value: spec,
                            label: t(`specializations.${spec}`),
                        }))}
                        value={formState.selectSpecialization}
                        onChange={formState.handleSpecializationChange}
                        placeholder="Please select a specialization"
                    />
                )}
            </CharacterFormField>
            
            {/* ===== ITEM LEVEL ===== */}
            <CharacterFormField 
                label="ILevel" 
                value={character?.iLevel !== undefined ? character.iLevel : ITEM_LEVEL_MIN} 
                isEditing={isEditing}
            >
                {isEditing && (
                    <ValidatedNumberInput
                        value={formState.iLevelInput.value}
                        onChange={formState.iLevelInput.handleChange}
                        onBlur={formState.iLevelInput.handleBlur}
                        onFocus={formState.iLevelInput.handleFocus}
                        min={ITEM_LEVEL_MIN}
                        max={ITEM_LEVEL_MAX}
                        maxLength={3}
                        placeholder="Enter item level"
                    />
                )}
            </CharacterFormField>
            
            {/* ===== KEYSTONE MIN LEVEL ===== */}
            <CharacterFormField 
                label="KeyMin" 
                value={character?.keystoneMinLevel !== undefined ? character.keystoneMinLevel : KEYSTONE_MIN_LEVEL} 
                isEditing={isEditing}
            >
                {isEditing && (
                    <ValidatedNumberInput
                        value={formState.keystoneMinInput.value}
                        onChange={formState.keystoneMinInput.handleChange}
                        onBlur={formState.keystoneMinInput.handleBlur}
                        onFocus={formState.keystoneMinInput.handleFocus}
                        min={KEYSTONE_MIN_LEVEL}
                        max={parseInt(formState.keystoneMaxInput.value) || KEYSTONE_MAX_LEVEL}
                        maxLength={2}
                        placeholder="Enter keystone min level"
                    />
                )}
            </CharacterFormField>
            
            {/* ===== KEYSTONE MAX LEVEL ===== */}
            <CharacterFormField 
                label="KeyMax" 
                value={character?.keystoneMaxLevel !== undefined ? character.keystoneMaxLevel : KEYSTONE_MAX_LEVEL} 
                isEditing={isEditing}
            >
                {isEditing && (
                    <ValidatedNumberInput
                        value={formState.keystoneMaxInput.value}
                        onChange={formState.keystoneMaxInput.handleChange}
                        onBlur={formState.keystoneMaxInput.handleBlur}
                        onFocus={formState.keystoneMaxInput.handleFocus}
                        min={parseInt(formState.keystoneMinInput.value) || KEYSTONE_MIN_LEVEL}
                        max={KEYSTONE_MAX_LEVEL}
                        maxLength={2}
                        placeholder="Enter keystone max level"
                    />
                )}
            </CharacterFormField>
            
            {/* ===== ACTION BUTTONS ===== */}
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
                                <button onClick={() => setIsEditing(true)}>Update</button>
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
