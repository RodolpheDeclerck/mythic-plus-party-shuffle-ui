// ClassesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';

interface ClassesContextProps {
  classes: string[];
}

const ClassesContext = createContext<ClassesContextProps | undefined>(undefined);

export const ClassesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    // Check if classes are already stored in localStorage
    const storedClasses = localStorage.getItem('classes');
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    } else {
      // Otherwise, call the API to retrieve them
      const fetchClasses = async () => {
        try {
          const response = await axios.get<string[]>(`${apiUrl}/api/classes`);
          setClasses(response.data);
          // Store retrieved data in localStorage
          localStorage.setItem('classes', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      };

      fetchClasses();
    }
  }, []);

  return (
    <ClassesContext.Provider value={{ classes }}>
      {children}
    </ClassesContext.Provider>
  );
};

// Custom hook to use the classes context
export const useClasses = () => {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
};
