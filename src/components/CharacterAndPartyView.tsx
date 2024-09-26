import React, { useState } from 'react';
import CharacterTable from './CharacterTable';
import PartyTable from './PartyTable';
import ShuffleButton from './ShuffleButton';
import Loading from './Loading';
import useFetchCharacters from '../hooks/useFetchCharacters';
import useWebSocket from '../hooks/useWebSocket';
import { fetchCharacters as fetchCharactersApi, deleteCharacter, shuffleParties, fetchParties as fetchPartiesApi } from '../services/api';
import { Party } from '../types/Party';

const CharacterAndPartyView: React.FC = () => {
    const { characters, loading, error, setCharacters } = useFetchCharacters(); // Hook personnalisé pour récupérer les personnages
    const [parties, setParties] = useState<Party[]>([]); // État local pour stocker les groupes
    const [errorState, setErrorState] = useState<string | null>(null); // État local pour les erreurs

    // Fonction pour récupérer les personnages et mettre à jour l'état
    const fetchCharacters = async () => {
        try {
            const updatedCharacters = await fetchCharactersApi(); // Appeler la fonction API importée
            setCharacters(updatedCharacters); // Mettre à jour l'état avec les personnages récupérés
        } catch (error) {
            console.error('Error fetching characters:', error);
            setErrorState('Failed to fetch characters');
        }
    };

    // Fonction pour récupérer les groupes et mettre à jour l'état
    const fetchParties = async () => {
        try {
            const updatedParties = await fetchPartiesApi(); // Appeler la fonction API importée
            setParties(updatedParties); // Mettre à jour l'état avec les groupes récupérés
        } catch (error) {
            console.error('Error fetching parties:', error);
            setErrorState('Failed to fetch parties');
        }
    };

    // Utilisation du hook WebSocket pour gérer les événements et les mises à jour en temps réel
    useWebSocket(fetchCharacters, fetchParties);

    // Fonction pour supprimer un personnage
    const handleDelete = async (id: number) => {
        try {
            await deleteCharacter(id); // Supprimer le personnage
            fetchCharacters(); // Mettre à jour la liste des personnages après la suppression
        } catch (error) {
            console.error(`Error deleting character with ID ${id}:`, error);
            setErrorState('Failed to delete character');
        }
    };

    // Fonction pour mélanger les groupes
    const handleShuffle = async () => {
        try {
            const shuffledParties = await shuffleParties(); // Mélanger les groupes
            setParties(shuffledParties); // Mettre à jour l'état avec les groupes mélangés
        } catch (error) {
            console.error('Error shuffling parties:', error);
            setErrorState('Failed to shuffle parties');
        }
    };

    // Calculer le nombre total de membres dans tous les groupes
    const totalMembers = parties.reduce((acc, party) => acc + party.members.length, 0);

    // Gestion des états de chargement et des erreurs
    if (loading) return <Loading />;
    if (error || errorState) return <div>{error || errorState}</div>;

    return (
        <div>
            <h1>Character List ({characters.length} participants)</h1>
            <CharacterTable characters={characters} onDelete={handleDelete} /> {/* Affichage de la liste des personnages */}
            <ShuffleButton onShuffle={handleShuffle} /> {/* Bouton pour mélanger les groupes */}
            {parties.length > 0 && (
                <div>
                    <h2>Shuffled Groups ({totalMembers} participants)</h2>
                    <PartyTable parties={parties} />
                </div>
            )}
        </div>
    );
};

export default CharacterAndPartyView;
