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

  // Utilisation de useCallback pour mémoriser la fonction et éviter les appels répétés inutiles
  const fetchSpecializations = useCallback(async (selectedClass: string) => {
    try {
      // Vérifiez si les spécialisations pour cette classe sont déjà stockées dans le localStorage
      const storedSpecializations = localStorage.getItem(`specializations_${selectedClass}`);
      if (storedSpecializations) {
        setSpecializations(JSON.parse(storedSpecializations));
      } else {
        // Sinon, appelez l'API pour les récupérer
        const response = await axios.get<string[]>(`${apiUrl}/api/specializations/${selectedClass}`);
        setSpecializations(response.data);
        // Stockez les spécialisations dans le localStorage
        localStorage.setItem(`specializations_${selectedClass}`, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  }, []); // Le tableau de dépendances est vide, donc cette fonction ne sera pas recréée à chaque rendu

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
