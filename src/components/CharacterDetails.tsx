import React from 'react';
import { SpecializationDetails } from '../types/SpecializationsDetails';

interface CharacterDetailsProps {
  name: string;
  characterClass: string;
  specialization: string;
  specializationDetails: SpecializationDetails | null;
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ name, characterClass, specialization, specializationDetails }) => (
  <div style={{ marginTop: '20px' }}>
    <h2>Character Details</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Class:</strong> {characterClass}</p>
    <p><strong>Specialization:</strong> {specialization}</p>

    {specializationDetails && (
      <div style={{ marginTop: '20px' }}>
        <h2>Specialization Details</h2>
        <p><strong>Role:</strong> {specializationDetails.role}</p>
        <p><strong>Bloodlust:</strong> {specializationDetails.bloodLust ? 'Yes' : 'No'}</p>
        <p><strong>Battle Rez:</strong> {specializationDetails.battleRez ? 'Yes' : 'No'}</p>
      </div>
    )}
  </div>
);

export default CharacterDetails;
