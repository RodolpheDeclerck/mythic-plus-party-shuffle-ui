import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputField from '../InputFieldProps';
import SelectField from '../SelectField';
import { useTranslation } from 'react-i18next';
import { useClasses } from '../../context/ClassesContext'; // Importer le hook personnalisé pour les classes
import { useSpecializations } from '../../context/SpecializationsContext'; // Importer le hook personnalisé pour les spécialisations
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import './EventRegisterForm.css';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../constants/itemLevels';


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

  const { classes } = useClasses(); // Utiliser le contexte pour les classes
  const { specializations, fetchSpecializations } = useSpecializations(); // Utiliser le contexte pour les spécialisations

  const location = useLocation(); // Utiliser useLocation pour obtenir l'objet location
  const eventCode = new URLSearchParams(location.search).get('code'); // Extraire le code depuis location.search

  // Vérifier si un personnage existe déjà dans le localStorage
  useEffect(() => {
    const storedCharacter = localStorage.getItem('createdCharacter');
    if (storedCharacter && eventCode) { // Vérifie également que eventCode est défini
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
    
    // Si c'est la première saisie après le focus, on remplace complètement la valeur
    if (isFirstInputAfterFocus) {
      setIsFirstInputAfterFocus(false);
      // On prend uniquement le dernier caractère saisi
      const lastChar = inputValue.slice(-1);
      setILevel(lastChar);
      return;
    }

    // Si la valeur dépasse 3 chiffres (4 ou plus), on prend le dernier chiffre saisi
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
    
    // Si c'est la première saisie après le focus, on remplace complètement la valeur
    if (isFirstInputAfterFocusKeyMin) {
      setIsFirstInputAfterFocusKeyMin(false);
      // On prend uniquement le dernier caractère saisi
      const lastChar = inputValue.slice(-1);
      setKStoneMin(lastChar);
      return;
    }

    // Si la valeur dépasse 2 chiffres (3 ou plus), on prend le dernier chiffre saisi
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
    
    // Si c'est la première saisie après le focus, on remplace complètement la valeur
    if (isFirstInputAfterFocusKeyMax) {
      setIsFirstInputAfterFocusKeyMax(false);
      // On prend uniquement le dernier caractère saisi
      const lastChar = inputValue.slice(-1);
      setKStoneMax(lastChar);
      return;
    }

    // Si la valeur dépasse 2 chiffres (3 ou plus), on prend le dernier chiffre saisi
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
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
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
