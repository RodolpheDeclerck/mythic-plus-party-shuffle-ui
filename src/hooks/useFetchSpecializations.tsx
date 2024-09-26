import { useState } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';

const useFetchSpecializations = () => {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [specializationDetails, setSpecializationDetails] = useState(null);

  const fetchSpecializations = async (selectedClass: string) => {
    try {
      const response = await axios.get<string[]>(`${apiUrl}/api/specializations/${selectedClass}`);
      setSpecializations(response.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  return { specializations, fetchSpecializations, specializationDetails };
};

export default useFetchSpecializations;
