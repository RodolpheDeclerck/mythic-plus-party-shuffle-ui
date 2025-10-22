import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';

interface SpecializationsContextProps {
  specializations: string[];
  fetchSpecializations: (selectedClass: string) => void;
}

const SpecializationsContext = createContext<SpecializationsContextProps | undefined>(undefined);

export const SpecializationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Use useCallback to memoize the function and avoid unnecessary repeated calls
  const fetchSpecializations = useCallback(async (selectedClass: string) => {
    try {
      // Check if specializations for this class are already stored in localStorage
      const storedSpecializations = localStorage.getItem(`specializations_${selectedClass}`);
      if (storedSpecializations) {
        setSpecializations(JSON.parse(storedSpecializations));
      } else {
        // Otherwise, call the API to retrieve them
        const response = await axios.get<string[]>(`${apiUrl}/api/specializations/${selectedClass}`);
        setSpecializations(response.data);
        // Store specializations in localStorage
        localStorage.setItem(`specializations_${selectedClass}`, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  }, []); // Empty dependency array, so this function won't be recreated on every render

  return (
    <SpecializationsContext.Provider value={{ specializations, fetchSpecializations }}>
      {children}
    </SpecializationsContext.Provider>
  );
};

export const useSpecializations = () => {
  const context = useContext(SpecializationsContext);
  if (!context) {
    throw new Error('useSpecializations must be used within a SpecializationsProvider');
  }
  return context;
};
