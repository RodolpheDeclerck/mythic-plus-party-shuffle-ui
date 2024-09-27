import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../InputFieldProps';
import SelectField from '../SelectField';
import PasswordPopup from '../PasswordPopup/PasswordPopup';
import { useTranslation } from 'react-i18next';
import useFetchClasses from '../../hooks/useFetchClasses';
import useFetchSpecializations from '../../hooks/useFetchSpecializations';
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import './EventRegisterForm.css';

const EventRegisterForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
  const [selectSpecialization, setSelectSpecialization] = useState<string>('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const classes = useFetchClasses();
  const { specializations, fetchSpecializations, specializationDetails } = useFetchSpecializations();

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
      };
      await axios.post(`${apiUrl}/api/characters`, characterData);
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
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
        />

        {/* Champ de sélection pour les classes */}
        {name.length > 0 && (
          <SelectField
            label="Class"
            options={classes.map(cls => ({
              value: cls,
              label: cls, // Vous pouvez traduire `cls` si nécessaire
            }))}
            value={selectCharacterClass}
            onChange={handleClassChange}
          />
        )}

        {/* Champ de sélection pour les spécialisations */}
        {specializations.length > 0 && (
          <SelectField
            label="Specialization"
            options={specializations.map(spec => ({
              value: spec,
              label: t(`specializations.${spec}`),
            }))}
            value={selectSpecialization}
            onChange={handleSpecializationChange}
          />
        )}

        {/* Bouton pour sauvegarder le personnage */}
        {selectCharacterClass && selectSpecialization && (
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
