import { useState } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';
import { Event } from '../types/Event';

export const useEventData = (eventCode: string) => {
    const [arePartiesVisible, setArePartiesVisible] = useState(false);
    
    const checkEventExistence = async (): Promise<boolean> => {
        if (eventCode) {
            try {
                const response = await axios.get<Event>(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
                const event = response.data;
                if (event) {
                    setArePartiesVisible(event.arePartiesVisible); // Stockez la valeur dans l'état
                }
                setArePartiesVisible(event.arePartiesVisible); // Stockez la valeur dans l'état
                return true; // L'événement existe
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    return false; // L'événement n'existe pas
                } else {
                    console.error('Erreur lors de la vérification de l\'événement:', error);
                }
            }
        }
        return false; // Aucun eventCode ou autre erreur
    };
    
    return { 
        arePartiesVisible, 
        setArePartiesVisible,
        checkEventExistence
    };
};
