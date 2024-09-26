import { useState, useEffect } from 'react';
import axios from 'axios';
import { Character } from '../types/Character';
import apiUrl from '../config/apiConfig';

const useFetchCharacters = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const response = await axios.get<Character[]>(`${apiUrl}/api/characters`);
                setCharacters(response.data);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setError('Failed to fetch characters');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    return { characters, loading, error, setCharacters };
};

export default useFetchCharacters;
