import { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';

const useFetchClasses = () => {
  const [classes, setClasses] = useState<string[]>([]);

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

  return classes;
};

export default useFetchClasses;
