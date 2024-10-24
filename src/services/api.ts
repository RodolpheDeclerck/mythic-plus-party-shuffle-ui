// src/services/api.ts

import axios from 'axios';
import apiUrl from '../config/apiConfig';
import { Character } from '../types/Character';
import { Party } from '../types/Party';

// Récupérer tous les personnages
export const fetchCharacters = async (eventCode: string): Promise<Character[]> => {
    const response = await axios.get<Character[]>(`${apiUrl}/api/events/${eventCode}/characters`);
    return response.data;
};

export const updateCharacter = async (character: Character): Promise<Character> => {
    const response = await axios.put<Character>(`${apiUrl}/api/characters/${character.id}`, character);
    return response.data;
}

export const upsertCharacter = async (character: Character): Promise<Character> => {
    const response = await axios.put<Character>(`${apiUrl}/api/characters/upsert`, character);
    return response.data;
}

// Supprimer un personnage
export const deleteCharacter = async (id: number): Promise<void> => {
    await axios.delete(`${apiUrl}/api/characters/${id}`);
};

// Supprimer un personnage
export const deleteCharacters = async (ids: number[]): Promise<void> => {
    await axios.post(`${apiUrl}/api/characters/remove`, { ids: ids });
};

// Récupérer tous les groupes
export const fetchParties = async (eventCode: string): Promise<Party[]> => {
    const response = await axios.get<Party[]>(`${apiUrl}/api/events/${eventCode}/parties`);
    return response.data;
};

// Mélanger les groupes
export const shuffleParties = async (eventCode: string): Promise<Party[]> => {
    const response = await axios.get<Party[]>(`${apiUrl}/api/events/${eventCode}/shuffle-parties`);
    return response.data;
};

export const deleteParties = async (eventCode: string): Promise<void> => {
    await axios.delete(`${apiUrl}/api/events/${eventCode}/parties`);
};
