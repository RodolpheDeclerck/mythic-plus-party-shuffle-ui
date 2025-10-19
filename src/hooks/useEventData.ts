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

    const fetchEvent = async () => {
        if (eventCode) {
            try {
                const response = await axios.get<Event>(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
                const event = response.data;
                if (event) {
                    setArePartiesVisible(event.arePartiesVisible); // Stockez la valeur dans l'état
                }
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    console.error('Error fetching event:', error);
                    // Note: setErrorState n'est pas disponible dans ce hook
                } else {
                    console.error('Error fetching event:', error);
                }
            }
        }
    };

    const togglePartiesVisibility = async () => {
        if (!eventCode) {
            console.error('Event code is missing.');
            return;
        }

        try {
            // Envoyer une requête PATCH pour mettre à jour la visibilité
            await axios.patch(
                `${apiUrl}/api/events/${eventCode}/setPartiesVisibility`,
                { visible: !arePartiesVisible }, // Corps de la requête
                { withCredentials: true } // Inclure les cookies si nécessaires
            );

        } catch (error) {
            console.error('Failed to update parties visibility:', error);
        }
    };
    
    return { 
        arePartiesVisible, 
        setArePartiesVisible,
        checkEventExistence,
        fetchEvent,
        togglePartiesVisibility
    };
};
