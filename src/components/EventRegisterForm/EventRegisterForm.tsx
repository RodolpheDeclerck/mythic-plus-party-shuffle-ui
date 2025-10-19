import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputField from '../InputFieldProps';
import SelectField from '../SelectField';
import { useTranslation } from 'react-i18next';
import { useClasses } from '../../context/ClassesContext'; // Import custom hook for classes
import { useSpecializations } from '../../context/SpecializationsContext'; // Import custom hook for specializations
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import './EventRegisterForm.css';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../constants/itemLevels';

const NAME_MAX_LENGTH = 12;

const EventRegisterForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
  const [selectSpecialization, setSelectSpecialization] = useState<string>('');
  const [iLevel, setILevel] = useState(ITEM_LEVEL_MIN.toString());
  const [kStoneMin, setKStoneMin] = useState(KEYSTONE_MIN_LEVEL.toString());
  const [kStoneMax, setKStoneMax] = useState(KEYSTONE_MAX_LEVEL.toString());
  const [isFirstInputAfterFocus, setIsFirstInputAfterFocus] = useState(false);
  const [isFirstInputAfterFocusKeyMin, setIsFirstInputAfterFocusKeyMin] = useState(false);
  const [isFirstInputAfterFocusKeyMax, setIsFirstInputAfterFocusKeyMax] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { classes } = useClasses(); // Use context for classes
  const { specializations, fetchSpecializations } = useSpecializations(); // Use context for specializations

  const location = useLocation(); // Use useLocation to get location object
  const eventCode = new URLSearchParams(location.search).get('code'); // Extract code from location.search

  // Check if a character already exists in localStorage
  useEffect(() => {
    const storedCharacter = localStorage.getItem('createdCharacter');
    if (storedCharacter && eventCode) { // Also check that eventCode is defined
      navigate('/event?code=' + eventCode);
    }
  }, [navigate, eventCode]);

  const handleClassChange = (selectedClass: string) => {
    setSelectCharacterClass(selectedClass);
    setSelectSpecialization('');
    fetchSpecializations(selectedClass);
  };

  const handleSpecializationChange = (selectedSpecialization: string) => {
    setSelectSpecialization(selectedSpecialization);
  };

  const handleILevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // If it's the first input after focus, replace the entire value
    if (isFirstInputAfterFocus) {
      setIsFirstInputAfterFocus(false);
      // Take only the last character entered
      const lastChar = inputValue.slice(-1);
      setILevel(lastChar);
      return;
    }

    // If value exceeds 3 digits (4 or more), take the last digit entered
    if (inputValue.length > 3) {
      const lastChar = inputValue.slice(-1);
      setILevel(lastChar);
      return;
    }

    // Sinon on accepte la valeur saisie (y compris vide)
    setILevel(inputValue);
  };

  const handleILevelBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setILevel(ITEM_LEVEL_MIN.toString());
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const value = Math.max(ITEM_LEVEL_MIN, Math.min(numValue, ITEM_LEVEL_MAX));
      setILevel(value.toString());
    } else {
      setILevel(ITEM_LEVEL_MIN.toString());
    }
  };

  const handleILevelFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFirstInputAfterFocus(true);
  };

  const handleKeystoneMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // If it's the first input after focus, replace the entire value
    if (isFirstInputAfterFocusKeyMin) {
      setIsFirstInputAfterFocusKeyMin(false);
      // Take only the last character entered
      const lastChar = inputValue.slice(-1);
      setKStoneMin(lastChar);
      return;
    }

    // If value exceeds 2 digits (3 or more), take the last digit entered
    if (inputValue.length > 2) {
      const lastChar = inputValue.slice(-1);
      setKStoneMin(lastChar);
      return;
    }

    // Sinon on accepte la valeur saisie (y compris vide)
    setKStoneMin(inputValue);
  };

  const handleKeystoneMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // If it's the first input after focus, replace the entire value
    if (isFirstInputAfterFocusKeyMax) {
      setIsFirstInputAfterFocusKeyMax(false);
      // Take only the last character entered
      const lastChar = inputValue.slice(-1);
      setKStoneMax(lastChar);
      return;
    }

    // If value exceeds 2 digits (3 or more), take the last digit entered
    if (inputValue.length > 2) {
      const lastChar = inputValue.slice(-1);
      setKStoneMax(lastChar);
      return;
    }

    // Sinon on accepte la valeur saisie (y compris vide)
    setKStoneMax(inputValue);
  };

  const handleKeystoneMinFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFirstInputAfterFocusKeyMin(true);
  };

  const handleKeystoneMaxFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFirstInputAfterFocusKeyMax(true);
  };

  const handleKeystoneMinBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setKStoneMin(KEYSTONE_MIN_LEVEL.toString());
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const value = Math.max(KEYSTONE_MIN_LEVEL, Math.min(numValue, parseInt(kStoneMax) || KEYSTONE_MAX_LEVEL));
      setKStoneMin(value.toString());
    } else {
      setKStoneMin(KEYSTONE_MIN_LEVEL.toString());
    }
  };

  const handleKeystoneMaxBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setKStoneMax(KEYSTONE_MAX_LEVEL.toString());
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const value = Math.max(parseInt(kStoneMin) || KEYSTONE_MIN_LEVEL, Math.min(numValue, KEYSTONE_MAX_LEVEL));
      setKStoneMax(value.toString());
    } else {
      setKStoneMax(KEYSTONE_MAX_LEVEL.toString());
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue.length <= NAME_MAX_LENGTH) {
      setName(inputValue);
    }
  };

  const handleSave = async () => {
    if (!eventCode) {
      console.error('Event code is missing');
      return; // Stoppe la fonction si eventCode est manquant
    }

    try {
      const characterData = {
        name,
        characterClass: selectCharacterClass,
        specialization: selectSpecialization,
        iLevel: Math.max(ITEM_LEVEL_MIN, Math.min(parseInt(iLevel) || ITEM_LEVEL_MIN, ITEM_LEVEL_MAX)),
        eventCode,
        keystoneMinLevel: Math.max(KEYSTONE_MIN_LEVEL, parseInt(kStoneMin) || KEYSTONE_MIN_LEVEL),
        keystoneMaxLevel: Math.min(KEYSTONE_MAX_LEVEL, Math.max(parseInt(kStoneMin) || KEYSTONE_MIN_LEVEL, parseInt(kStoneMax) || KEYSTONE_MAX_LEVEL))
      };

      const response = await axios.post(`${apiUrl}/api/characters`, characterData);
      localStorage.setItem('createdCharacter', JSON.stringify(response.data));
      navigate('/event?code=' + eventCode);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  return (
    <div className='wrapper'>

      <h1>Character Informations</h1>

      <div className='content-box'>
        <InputField
          label="Name: "
          value={name}
          onChange={handleNameChange}
          placeholder={`Enter character name`}
          maxLength={NAME_MAX_LENGTH}
        />

        {/* Champ de sélection pour les classes */}
        {name.length > 0 && (
          <SelectField
            label="Class: "
            options={classes.map(cls => ({
              value: cls,
              label: cls,
            }))}
            value={selectCharacterClass}
            onChange={handleClassChange}
            placeholder="Please select a class"
          />
        )}

        {/* Champ de sélection pour les spécialisations */}
        {specializations.length > 0 && (
          <SelectField
            label="Specialization: "
            options={specializations.map(spec => ({
              value: spec,
              label: t(`specializations.${spec}`),
            }))}
            value={selectSpecialization}
            onChange={handleSpecializationChange}
            placeholder="Please select a specialization"
          />
        )}

        {selectCharacterClass && selectSpecialization && (
          <InputField
            label="iLevel: "
            type="number"
            value={iLevel}
            onChange={handleILevelChange}
            onBlur={handleILevelBlur}
            onFocus={handleILevelFocus}
            placeholder="Enter character items level"
            min={ITEM_LEVEL_MIN}
            max={ITEM_LEVEL_MAX}
          />
        )}

        {/* Bouton pour sauvegarder le personnage */}
        {selectCharacterClass && selectSpecialization && parseInt(iLevel) >= ITEM_LEVEL_MIN && (
          <div>
            <InputField
              label="(OPTIONAL) Keystone MIN level: "
              type="number"
              value={kStoneMin}
              onChange={handleKeystoneMinChange}
              onBlur={handleKeystoneMinBlur}
              onFocus={handleKeystoneMinFocus}
              min={KEYSTONE_MIN_LEVEL}
              max={parseInt(kStoneMax) || KEYSTONE_MAX_LEVEL}
              placeholder="Enter minimum keystone level"
            />
            <InputField
              label="(OPTIONAL) Keystone MAX level: "
              type="number"
              value={kStoneMax}
              onChange={handleKeystoneMaxChange}
              onBlur={handleKeystoneMaxBlur}
              onFocus={handleKeystoneMaxFocus}
              min={parseInt(kStoneMin) || KEYSTONE_MIN_LEVEL}
              max={KEYSTONE_MAX_LEVEL}
              placeholder="Enter maximum keystone level"
            />
            <button className="save-button" onClick={handleSave}>
              Join Event!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegisterForm;
