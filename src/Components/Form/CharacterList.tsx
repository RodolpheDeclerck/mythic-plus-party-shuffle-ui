import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import apiUrl from '../../config/config';

// Définir une interface pour typer les données des personnages
interface Character {
    id: number;
    name: string;
    characterClass: string;
    specialization: string;
    role: string;
    bloodLust: boolean;
    battleRez: boolean;
}

// Définir une interface pour typer les groupes (parties)
interface Party {
    members: Character[];
}

const CharacterList: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [parties, setParties] = useState<Party[]>([]); // Pour stocker les groupes mélangés

    // Initialiser le socket
    const [socket, setSocket] = useState<Socket | null>(null);

    // Utiliser useEffect pour récupérer les données depuis le backend et configurer le WebSocket
    useEffect(() => {
        // Appel initial pour charger les personnages et les groupes dès le premier rendu
        fetchCharacters();

        // Connecter au serveur WebSocket
        const socketIo = io(`${apiUrl}`); // URL de ton backend WebSocket
        setSocket(socketIo);

        // Lorsque l'événement 'character-updated' est émis, rafraîchir les données
        socketIo.on('character-updated', () => {
            fetchCharacters();
        });

        // Lorsque l'événement 'parties-shuffled' est émis, rafraîchir les données
        socketIo.on('parties-shuffled', () => {
            fetchParties();
        });

        // Nettoyage du socket à la fermeture du composant
        return () => {
            socketIo.disconnect();
        };
    }, []);  // [] signifie que ce useEffect sera exécuté au montage du composant uniquement

    const fetchCharacters = async () => {
        try {
            const response = await axios.get<Character[]>(`${apiUrl}/api/characters`);
            setCharacters(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching characters:', error);
            setError('Failed to fetch characters');
            setLoading(false);
        }
    };

    const fetchParties = async () => {
        try {
            const response = await axios.get<Party[]>(`${apiUrl}/api/parties`);
            setParties(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching parties:', error);
            setError('Failed to fetch parties');
            setLoading(false);
        }
    };

    // Fonction pour supprimer un personnage
    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${apiUrl}/api/characters/${id}`);
            // Actualiser la liste des personnages après suppression (WebSocket va aussi déclencher un rafraîchissement)
            fetchCharacters();
        } catch (error) {
            console.error(`Error deleting character with ID ${id}:`, error);
            setError('Failed to delete character');
        }
    };

    // Fonction pour mélanger les groupes (shuffle)
    const handleShuffle = async () => {
        try {
            const response = await axios.get<Party[]>(`${apiUrl}/api/parties/shuffle`);
            console.log('Shuffle response:', response.data); // Ajoutez ce log pour voir la réponse
            setParties(response.data); // Mettre à jour l'état avec les nouveaux groupes
        } catch (error) {
            console.error('Error shuffling parties:', error);
            setError('Failed to shuffle parties');
        }
    };


    // Calculer le nombre total de membres dans tous les groupes
    const totalMembers = parties.reduce((acc, party) => acc + party.members.length, 0);

    // Affichage de l'état de chargement ou des erreurs
    if (loading) {
        return <div>Loading characters...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>
                Character List ({characters.length} participants) {/* Affiche le nombre de personnages ici */}
            </h1>
            {characters.length === 0 ? (
                <p>No characters found</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Specialization</th>
                            <th>Role</th>
                            <th>BloodLust</th>
                            <th>BattleRez</th>
                            <th>Actions</th> {/* Nouvelle colonne pour les actions */}
                        </tr>
                    </thead>
                    <tbody>
                        {characters.map((character, index) => (
                            <tr key={character.id}>
                                {/* Affiche le numéro de la ligne (index + 1) */}
                                <td>{index + 1}</td>
                                <td>{character.name}</td>
                                <td>{character.characterClass}</td>
                                <td>{character.specialization}</td>
                                <td>{character.role}</td>
                                <td>{character.bloodLust ? 'Yes' : 'No'}</td>
                                <td>{character.battleRez ? 'Yes' : 'No'}</td>
                                <td>
                                    {/* Bouton pour supprimer le personnage */}
                                    <button onClick={() => handleDelete(character.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Bouton Shuffle avec le nombre total de membres */}
            <button onClick={handleShuffle} style={{ marginTop: '20px' }}>
                Shuffle Groups
            </button>

            {/* Affichage des groupes mélangés */}
            {parties.length > 0 && (
                <div>
                    <h2>Shuffled Groups  ({totalMembers} participants)</h2>
                    {parties.map((party, index) => (
                        <div key={index}>
                            <h3>Group {index + 1}</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Specialization</th>
                                        <th>Role</th>
                                        <th>BloodLust</th>
                                        <th>BattleRez</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {party.members.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.id}</td>
                                            <td>{member.name}</td>
                                            <td>{member.characterClass}</td>
                                            <td>{member.specialization}</td>
                                            <td>{member.role}</td>
                                            <td>{member.bloodLust ? 'Yes' : 'No'}</td>
                                            <td>{member.battleRez ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CharacterList;
