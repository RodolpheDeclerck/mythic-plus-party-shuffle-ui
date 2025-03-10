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
  const [iLevel, setILevel] = useState<number>(ITEM_LEVEL_MIN);
  const [kStoneMin, setKStoneMin] = useState<number>(KEYSTONE_MIN_LEVEL);
  const [kStoneMax, setKStoneMax] = useState<number>(KEYSTONE_MAX_LEVEL);

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

  const handleILevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(ITEM_LEVEL_MIN, Math.min(parseInt(e.target.value) || ITEM_LEVEL_MIN, ITEM_LEVEL_MAX));
    setILevel(value);
  };

  const handleKeystoneMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(KEYSTONE_MIN_LEVEL, Math.min(parseInt(e.target.value) || KEYSTONE_MIN_LEVEL, kStoneMax));
    setKStoneMin(value);
  };

  const handleKeystoneMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(kStoneMin, Math.min(parseInt(e.target.value) || KEYSTONE_MAX_LEVEL, KEYSTONE_MAX_LEVEL));
    setKStoneMax(value);
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
        iLevel: Math.max(ITEM_LEVEL_MIN, Math.min(iLevel, ITEM_LEVEL_MAX)),
        eventCode,
        keystoneMinLevel: Math.max(KEYSTONE_MIN_LEVEL, kStoneMin),
        keystoneMaxLevel: Math.min(KEYSTONE_MAX_LEVEL, Math.max(kStoneMin, kStoneMax))
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
            placeholder="Enter character items level"
            min={ITEM_LEVEL_MIN}
            max={ITEM_LEVEL_MAX}
          />
        )}

        {/* Bouton pour sauvegarder le personnage */}
        {selectCharacterClass && selectSpecialization && iLevel >= ITEM_LEVEL_MIN && (
          <div>
            <InputField
              label="(OPTIONAL) Keystone MIN level: "
              type="number"
              value={kStoneMin}
              onChange={handleKeystoneMinChange}
              min={KEYSTONE_MIN_LEVEL}
              max={kStoneMax}
              placeholder="Enter minimum keystone level"
            />
            <InputField
              label="(OPTIONAL) Keystone MAX level: "
              type="number"
              value={kStoneMax}
              onChange={handleKeystoneMaxChange}
              min={kStoneMin}
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
