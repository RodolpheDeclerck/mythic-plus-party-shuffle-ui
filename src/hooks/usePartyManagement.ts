import { useState } from 'react';
import { Party } from '../types/Party';
import { fetchParties as fetchPartiesApi, deleteParties } from '../services/api';
import apiUrl from '../config/apiConfig';

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
    
    const updatePartiesInBackend = async (updatedParties: Party[]) => {
        try {
            const response = await fetch(`${apiUrl}/api/events/${eventCode}/parties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedParties),
            });

            if (!response.ok) {
                throw new Error('Failed to update parties');
            }
            console.log('Parties updated in Redis');
        } catch (error) {
            console.error('Error updating parties in Redis:', error);
        }
    };
    
    const swapCharacters = (fromPartyIndex: number, toPartyIndex: number, sourceId: number, targetId: number) => {
        setParties((prevParties) => {
            const updatedParties = prevParties.map((party) => ({
                ...party,
                members: [...party.members],
            }));

            const sourceParty = updatedParties[fromPartyIndex];
            const targetParty = updatedParties[toPartyIndex];

            // Find the members by their IDs
            const sourceMemberIndex = sourceParty.members.findIndex(m => m.id === sourceId);
            const targetMemberIndex = targetParty.members.findIndex(m => m.id === targetId);

            if (sourceMemberIndex === -1 || targetMemberIndex === -1) {
                console.error("Members not found");
                return prevParties;
            }

            // Perform the swap using the found indices
            [sourceParty.members[sourceMemberIndex], targetParty.members[targetMemberIndex]] =
                [targetParty.members[targetMemberIndex], sourceParty.members[sourceMemberIndex]];

            updatePartiesInBackend(updatedParties);

            return updatedParties;
        });
    };
    
    return { 
        parties, 
        setParties,
        fetchParties,
        handleClearEvent,
        updatePartiesInBackend,
        swapCharacters
    };
};
