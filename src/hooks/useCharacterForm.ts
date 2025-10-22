import { useState, useEffect } from 'react';
import { useValidatedNumberInput } from './useValidatedNumberInput';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../constants/itemLevels';

const NAME_MAX_LENGTH = 12;

export const useCharacterForm = (character: any, isEditing: boolean, fetchSpecializations: (selectedClass: string) => void) => {
    // Basic form state
    const [editedName, setEditedName] = useState('');
    const [selectSpecialization, setSelectSpecialization] = useState<string>('');
    const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');

    // Number inputs using validated hook
    const iLevelInput = useValidatedNumberInput({
        initialValue: ITEM_LEVEL_MIN.toString(),
        min: ITEM_LEVEL_MIN,
        max: ITEM_LEVEL_MAX,
        maxLength: 3
    });

    const keystoneMinInput = useValidatedNumberInput({
        initialValue: KEYSTONE_MIN_LEVEL.toString(),
        min: KEYSTONE_MIN_LEVEL,
        max: KEYSTONE_MAX_LEVEL,
        maxLength: 2
    });

    const keystoneMaxInput = useValidatedNumberInput({
        initialValue: KEYSTONE_MAX_LEVEL.toString(),
        min: KEYSTONE_MIN_LEVEL,
        max: KEYSTONE_MAX_LEVEL,
        maxLength: 2
    });

    // Initialize form when character or editing state changes
    useEffect(() => {
        if (character && isEditing) {
            setEditedName(character.name || '');
            iLevelInput.setValue(character.iLevel?.toString() || ITEM_LEVEL_MIN.toString());
            keystoneMinInput.setValue(character.keystoneMinLevel?.toString() || KEYSTONE_MIN_LEVEL.toString());
            keystoneMaxInput.setValue(character.keystoneMaxLevel?.toString() || KEYSTONE_MAX_LEVEL.toString());
            setSelectCharacterClass(character.characterClass || '');
            setSelectSpecialization(character.specialization || '');

            if (character.characterClass) {
                fetchSpecializations(character.characterClass);
            }
        } else if (!character) {
            setEditedName('');
            iLevelInput.setValue(ITEM_LEVEL_MIN.toString());
            keystoneMinInput.setValue(KEYSTONE_MIN_LEVEL.toString());
            keystoneMaxInput.setValue(KEYSTONE_MAX_LEVEL.toString());
            setSelectCharacterClass('');
            setSelectSpecialization('');
        }
    }, [character, isEditing, fetchSpecializations]);

    // Handle class change
    const handleClassChange = (selectedClass: string) => {
        setSelectCharacterClass(selectedClass);
        setSelectSpecialization('');
        fetchSpecializations(selectedClass);
    };

    // Handle specialization change
    const handleSpecializationChange = (selectedSpecialization: string) => {
        setSelectSpecialization(selectedSpecialization);
    };

    // Handle name change with length validation
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        if (inputValue.length <= NAME_MAX_LENGTH) {
            setEditedName(inputValue);
        }
    };

    // Get current form values
    const getFormValues = () => ({
        name: editedName || 'Unnamed Character',
        characterClass: selectCharacterClass || 'Unknown Class',
        specialization: selectSpecialization || 'Unknown Specialization',
        iLevel: parseInt(iLevelInput.value) || ITEM_LEVEL_MIN,
        keystoneMinLevel: parseInt(keystoneMinInput.value) || KEYSTONE_MIN_LEVEL,
        keystoneMaxLevel: parseInt(keystoneMaxInput.value) || KEYSTONE_MAX_LEVEL
    });

    // Reset form
    const resetForm = () => {
        setEditedName('');
        setSelectCharacterClass('');
        setSelectSpecialization('');
        iLevelInput.setValue(ITEM_LEVEL_MIN.toString());
        keystoneMinInput.setValue(KEYSTONE_MIN_LEVEL.toString());
        keystoneMaxInput.setValue(KEYSTONE_MAX_LEVEL.toString());
    };

    return {
        // Form state
        editedName,
        selectCharacterClass,
        selectSpecialization,
        
        // Number inputs
        iLevelInput,
        keystoneMinInput,
        keystoneMaxInput,
        
        // Handlers
        handleNameChange,
        handleClassChange,
        handleSpecializationChange,
        
        // Utilities
        getFormValues,
        resetForm
    };
};
