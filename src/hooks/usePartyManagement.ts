import { useState } from 'react';
import { Party } from '../types/Party';
import { fetchParties as fetchPartiesApi, deleteParties, shuffleParties } from '../services/api';
import apiUrl from '../config/apiConfig';
import axios from 'axios';

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
    
    const moveCharacter = (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => {
        setParties((prevParties) => {
            const updatedParties = [...prevParties];
            const sourceParty = updatedParties[fromPartyIndex];
            const targetParty = updatedParties[toPartyIndex];

            if (!sourceParty || !targetParty) {
                console.error("Invalid party indices");
                return prevParties;
            }

            // Find the member by ID
            const memberIndex = sourceParty.members.findIndex(m => m.id === memberId);
            if (memberIndex === -1) {
                console.error("Member not found");
                return prevParties;
            }

            // Remove the member from the source party
            const [movedCharacter] = sourceParty.members.splice(memberIndex, 1);

            if (targetParty.members.length < 5) {
                // Insert at the specified target index
                targetParty.members.splice(toIndex, 0, movedCharacter);
            } else {
                console.error("Target party is full. Move not allowed.");
                // Put the character back in the source party
                sourceParty.members.splice(memberIndex, 0, movedCharacter);
            }

            updatePartiesInBackend(updatedParties);

            return updatedParties;
        });
    };
    
    const handleShuffle = async (createdCharacter: any, setCreatedCharacter: (character: any) => void, setErrorState: (error: string) => void) => {
        if (eventCode) {
            try {
                await axios.patch(
                    `${apiUrl}/api/events/${eventCode}/setPartiesVisibility`,
                    { visible: false },
                    { withCredentials: true }
                );

                const shuffledParties = await shuffleParties(eventCode);
                let updatedCharacter = null;

                if (createdCharacter) {
                    updatedCharacter = shuffledParties
                        .flatMap((party) => party.members)
                        .find((member) => member.id === createdCharacter.id);
                }

                if (updatedCharacter) {
                    setCreatedCharacter({ ...updatedCharacter });
                    localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
                } else {
                    setCreatedCharacter(null);
                    localStorage.removeItem('createdCharacter');
                }

                setParties([...shuffledParties]);

            } catch (error) {
                console.error('Error shuffling parties:', error);
                setErrorState('Failed to shuffle parties');
            }
        } else {
            console.error('Event code is null');
        }
    };
    
    return { 
        parties, 
        setParties,
        fetchParties,
        handleClearEvent,
        updatePartiesInBackend,
        swapCharacters,
        moveCharacter,
        handleShuffle
    };
};
