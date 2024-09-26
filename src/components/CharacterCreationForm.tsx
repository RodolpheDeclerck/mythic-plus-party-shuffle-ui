import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputFieldProps';
import SelectField from './SelectField';
import CharacterDetails from './CharacterDetails';
import useFetchClasses from '../hooks/useFetchClasses';
import useFetchSpecializations from '../hooks/useFetchSpecializations';
import axios from 'axios';
import apiUrl from '../config/apiConfig';

const CharacterCreationForm : React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
  const [selectSpecialization, setSelectSpecialization] = useState<string>(''); // État pour la spécialisation
  const navigate = useNavigate();

  const classes = useFetchClasses();
  const { specializations, fetchSpecializations, specializationDetails } = useFetchSpecializations();

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = event.target.value;
    setSelectCharacterClass(selectedClass);
    setSelectSpecialization(''); // Réinitialiser la spécialisation sélectionnée
    fetchSpecializations(selectedClass);
  };

  const handleSpecializationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSpecialization = event.target.value;
    setSelectSpecialization(selectedSpecialization);
  };

  const handleSave = async () => {
    try {
      const characterData = {
        name,
        characterClass: selectCharacterClass,
        specialization: selectSpecialization, // Inclure la spécialisation sélectionnée
      };
      await axios.post(`${apiUrl}/api/characters`, characterData);
      navigate('/list');
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  return (
    <div>
      <h1>Character Form</h1>
      <InputField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter character name"
      />
      
      {/* Champ de sélection pour les classes */}
      {name.length > 0 && (
        <SelectField
          label="Class"
          options={classes}
          value={selectCharacterClass}
          onChange={handleClassChange}
        />
      )}

      {/* Champ de sélection pour les spécialisations */}
      {specializations.length > 0 && (
        <SelectField
          label="Specialization"
          options={specializations}
          value={selectSpecialization}
          onChange={handleSpecializationChange}
        />
      )}

      {/* Bouton pour sauvegarder le personnage */}
      {selectCharacterClass && selectSpecialization && (
        <button onClick={handleSave} style={{ marginTop: '20px' }}>
          Save Character
        </button>
      )}

      {/* Détails du personnage */}
      <CharacterDetails
        name={name}
        characterClass={selectCharacterClass}
        specialization={selectSpecialization}
        specializationDetails={specializationDetails}
      />
    </div>
  );
};

export default CharacterCreationForm ;
