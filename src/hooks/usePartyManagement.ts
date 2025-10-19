import { useState } from 'react';
import { Party } from '../types/Party';
import { fetchParties as fetchPartiesApi, deleteParties } from '../services/api';

export const usePartyManagement = (eventCode: string) => {
    const [parties, setParties] = useState<Party[]>([]);
    
    const fetchParties = async (setErrorState: (error: string) => void) => {
        if (eventCode) {
            try {
                const updatedParties = await fetchPartiesApi(eventCode);
                setParties([...updatedParties]);
            } catch (error) {
                console.error('Error fetching parties:', error);
                setErrorState('Failed to fetch parties');
            }
        } else {
            console.error('Event code is null');
        }
    };
    
    const handleClearEvent = async (setErrorState: (error: string) => void) => {
        if (eventCode) {
            try {
                await deleteParties(eventCode);
                setParties([]);
            } catch (error) {
                console.error('Error deleting parties:', error);
                setErrorState('Failed to delete parties');
            }
        } else {
            console.error('Event code is null');
        }
    };
    
    return { 
        parties, 
        setParties,
        fetchParties,
        handleClearEvent
    };
};
