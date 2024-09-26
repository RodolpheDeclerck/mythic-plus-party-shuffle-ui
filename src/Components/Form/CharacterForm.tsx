import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Utilisez useNavigate au lieu de useHistory
import apiUrl from '../../config/config';

interface SpecializationDetails {
  role: string;
  bloodLust: boolean;
  battleRez: boolean;
}

const CharacterForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
  const [classes, setClasses] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectSpecialization, setSelectSpecialization] = useState<string>('');
  const [specializationDetails, setSpecializationDetails] = useState<SpecializationDetails | null>(null);

  const navigate = useNavigate(); // Utilisez useNavigate pour la redirection

  // Récupérer les classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get<string[]>(`${apiUrl}/api/classes`);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  // Gérer le changement de la classe et récupérer les spécialisations
  const handleClassChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = event.target.value;
    setSelectCharacterClass(selectedClass);

    if (selectedClass) {
      try {
        const response = await axios.get<string[]>(`${apiUrl}/api/specializations/${selectedClass}`);
        setSpecializations(response.data);
        setSelectSpecialization('');
        setSpecializationDetails(null);
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    } else {
      setSpecializations([]);
      setSpecializationDetails(null);
    }
  };

  // Gérer le changement de la spécialisation et récupérer les détails associés
  const handleSpecializationChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSpecialization = event.target.value;
    setSelectSpecialization(selectedSpecialization);

    if (selectedSpecialization) {
      try {
        const response = await axios.get<SpecializationDetails>(`${apiUrl}/api/specializationDetails/${selectedSpecialization}`);
        setSpecializationDetails(response.data);
      } catch (error) {
        console.error('Error fetching specialization details:', error);
      }
    } else {
      setSpecializationDetails(null);
    }
  };

  // Fonction pour sauvegarder le personnage
  const handleSave = async () => {
    try {
      const characterData = {
        name,
        characterClass: selectCharacterClass,
        specialization: selectSpecialization,
      };

      // Envoyer les données au backend
      await axios.post(`${apiUrl}/api/characters`, characterData);

      // Rediriger l'utilisateur vers /list après l'enregistrement
      navigate('/list');
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  return (
    <div>
      <h1>Character Form</h1>

      {/* Champ de saisie pour le nom */}
      <div>
        <label htmlFor="name">Name: </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
        />
      </div>

      {/* Sélecteur pour les classes */}
      {name.length > 0 && (
        <div>
          <label htmlFor="class">Class: </label>
          <select
            id="class"
            value={selectCharacterClass}
            onChange={handleClassChange}
          >
            <option value="">Select Class</option>
            {classes.map((characterClass) => (
              <option key={characterClass} value={characterClass}>
                {characterClass}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sélecteur pour les spécialisations */}
      {specializations.length > 0 && (
        <div>
          <label htmlFor="specialization">Specialization: </label>
          <select
            id="specialization"
            value={selectSpecialization}
            onChange={handleSpecializationChange}
          >
            <option value="">Select Specialization</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Affichage des détails */}
      <div style={{ marginTop: '20px' }}>
        <h2>Character Details</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Class:</strong> {selectCharacterClass}</p>
        <p><strong>Specialization:</strong> {selectSpecialization}</p>
      </div>

      {specializationDetails && (
        <div style={{ marginTop: '20px' }}>
          <h2>Specialization Details</h2>
          <p><strong>Role:</strong> {specializationDetails.role}</p>
          <p><strong>Bloodlust:</strong> {specializationDetails.bloodLust ? 'Yes' : 'No'}</p>
          <p><strong>Battle Rez:</strong> {specializationDetails.battleRez ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* Bouton pour sauvegarder le personnage */}
      {selectCharacterClass && selectSpecialization && (
        <button onClick={handleSave} style={{ marginTop: '20px' }}>
          Save Character
        </button>
      )}
    </div>
  );
};

export default CharacterForm;
