// src/services/api.ts

import axios from 'axios';
import apiUrl from '../config/apiConfig';
import { Character } from '../types/Character';
import { Party } from '../types/Party';

// Récupérer tous les personnages
export const fetchCharacters = async (): Promise<Character[]> => {
    const response = await axios.get<Character[]>(`${apiUrl}/api/characters`);
    return response.data;
};

// Supprimer un personnage
export const deleteCharacter = async (id: number): Promise<void> => {
    await axios.delete(`${apiUrl}/api/characters/${id}`);
};

// Récupérer tous les groupes
export const fetchParties = async (): Promise<Party[]> => {
    const response = await axios.get<Party[]>(`${apiUrl}/api/parties`);
    return response.data;
};

// Mélanger les groupes
export const shuffleParties = async (): Promise<Party[]> => {
    const response = await axios.get<Party[]>(`${apiUrl}/api/parties/shuffle`);
    return response.data;
};
