import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../InputFieldProps';
import SelectField from '../SelectField';
import PasswordPopup from '../PasswordPopup/PasswordPopup';
import { useTranslation } from 'react-i18next';
import { useClasses } from '../../context/ClassesContext'; // Importer le hook personnalisé pour les classes
import { useSpecializations } from '../../context/SpecializationsContext'; // Importer le hook personnalisé pour les spécialisations
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import './EventRegisterForm.css';

const EventRegisterForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
  const [selectSpecialization, setSelectSpecialization] = useState<string>('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [iLevel, setILevel] = useState<number>(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { classes } = useClasses(); // Utiliser le contexte pour les classes
  const { specializations, fetchSpecializations } = useSpecializations(); // Utiliser le contexte pour les spécialisations

  // Vérifier si un personnage existe déjà dans le localStorage
  useEffect(() => {
    const storedCharacter = localStorage.getItem('createdCharacter');
    if (storedCharacter) {
      navigate('/event'); // Rediriger vers /event si un personnage existe
    }
  }, [navigate]);

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = event.target.value;
    setSelectCharacterClass(selectedClass);
    setSelectSpecialization('');
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
        specialization: selectSpecialization,
        iLevel,
      };

      // Envoyer le personnage au backend
      const response = await axios.post(`${apiUrl}/api/characters`, characterData);

      // Stocker les informations du personnage dans le localStorage
      localStorage.setItem('createdCharacter', JSON.stringify(response.data));

      // Naviguer vers la page /event
      navigate('/event');
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const handleAdminClick = () => {
    setShowPasswordPopup(true);
  };

  const handlePasswordConfirm = (password: string) => {
    if (password === 'W1ck3dWabb1t') {
      localStorage.setItem('isAdmin', 'true');
      setShowPasswordPopup(false);
      navigate('/event/admin');
    } else {
      alert('Incorrect password');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordPopup(false);
  };

  return (
    <div className="form-container">
      {/* Bouton "Admin" en haut à droite */}
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button onClick={handleAdminClick}>Admin</button>
      </div>

      <h1 className="title">Register for the event</h1>

      <div className="form-content">
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
            value={iLevel}
            onChange={(e) => setILevel(Number(e.target.value))}
            placeholder="Enter character items level"
          />
        )}

        {/* Bouton pour sauvegarder le personnage */}
        {selectCharacterClass && selectSpecialization && iLevel > 0 && (
          <button className="save-button" onClick={handleSave}>
            Join Event!
          </button>
        )}
      </div>

      {showPasswordPopup && (
        <PasswordPopup onConfirm={handlePasswordConfirm} onCancel={handlePasswordCancel} />
      )}
    </div>
  );
};

export default EventRegisterForm;
