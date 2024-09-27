import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CharacterTable from './CharacterTable';
import PartyTable from './PartyTable';
import ShuffleButton from '../ShuffleButton';
import Loading from '../Loading';
import PasswordPopup from '../PasswordPopup/PasswordPopup';
import useFetchCharacters from '../../hooks/useFetchCharacters';
import useWebSocket from '../../hooks/useWebSocket';
import { fetchCharacters as fetchCharactersApi, deleteCharacter, shuffleParties, fetchParties as fetchPartiesApi } from '../../services/api';
import { Party } from '../../types/Party';
import './EventView.css';

const EventView: React.FC = () => {
    const { characters, loading, error, setCharacters } = useFetchCharacters();
    const [parties, setParties] = useState<Party[]>([]);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const isAdminPage = location.pathname === '/event/admin';

    useEffect(() => {
        // Redirection si l'utilisateur essaie d'accéder à /event/admin sans être authentifié
        if (isAdminPage && localStorage.getItem('isAdmin') !== 'true') {
            navigate('/event');
        }
    }, [isAdminPage, navigate]);

    const fetchCharacters = async () => {
        try {
            const updatedCharacters = await fetchCharactersApi();
            setCharacters(updatedCharacters);
        } catch (error) {
            console.error('Error fetching characters:', error);
            setErrorState('Failed to fetch characters');
        }
    };

    const fetchParties = async () => {
        try {
            const updatedParties = await fetchPartiesApi();
            setParties(updatedParties);
        } catch (error) {
            console.error('Error fetching parties:', error);
            setErrorState('Failed to fetch parties');
        }
    };

    useWebSocket(fetchCharacters, fetchParties);

    const handleDelete = async (id: number) => {
        try {
            await deleteCharacter(id);
            fetchCharacters();
        } catch (error) {
            console.error(`Error deleting character with ID ${id}:`, error);
            setErrorState('Failed to delete character');
        }
    };

    const handleShuffle = async () => {
        try {
            const shuffledParties = await shuffleParties();
            setParties(shuffledParties);
        } catch (error) {
            console.error('Error shuffling parties:', error);
            setErrorState('Failed to shuffle parties');
        }
    };

    const handleAdminClick = () => {
        setShowPasswordPopup(true);
    };

    const handlePasswordConfirm = (password: string) => {
        if (password === 'W1ck3dWabb1t') { // Remplacez par votre mot de passe
            localStorage.setItem('isAdmin', 'true'); // Stocke l'authentification dans localStorage
            setShowPasswordPopup(false);
            navigate('/event/admin');
        } else {
            alert('Incorrect password');
        }
    };

    const handlePasswordCancel = () => {
        setShowPasswordPopup(false);
    };

    const totalMembers = parties.reduce((acc, party) => acc + party.members.length, 0);

    useEffect(() => {
        fetchParties();
    }, []);

    const tanks = characters.filter(character => character.role === 'TANK');
    const heals = characters.filter(character => character.role === 'HEAL');
    const dps = characters.filter(character => character.role === 'DIST' || character.role === 'CAC');

    if (loading) return <Loading />;
    if (error || errorState) return <div>{error || errorState}</div>;

    return (
        <div>
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {!isAdminPage && (
                    <button onClick={handleAdminClick}>Admin</button>
                )}
            </div>

            <h1 className="title">Waiting Room ({characters.length} participants)</h1>

            {/* Conteneur flex pour les tableaux */}
            <div className="table-container">
                {/* Tableau des Tanks */}
                <div className="table-wrapper">
                    <h2>Tanks</h2>
                    <CharacterTable characters={tanks} onDelete={isAdminPage ? handleDelete : undefined} />
                </div>

                {/* Tableau des Heals */}
                <div className="table-wrapper">
                    <h2>Heals</h2>
                    <CharacterTable characters={heals} onDelete={isAdminPage ? handleDelete : undefined} />
                </div>

                {/* Tableau des DPS */}
                <div className="table-wrapper">
                    <h2>DPS</h2>
                    <CharacterTable characters={dps} onDelete={isAdminPage ? handleDelete : undefined} />
                </div>
            </div>

            {isAdminPage && <ShuffleButton onShuffle={handleShuffle} />}
            {parties.length === 0 && !isAdminPage && <p><b>Waiting for the event to launch...</b></p>}
            {parties.length > 0 && (
                <div>
                    <h2 className="subtitle">Event running... ({totalMembers} participants)</h2>
                    <PartyTable parties={parties} />
                </div>
            )}

            {showPasswordPopup && (
                <PasswordPopup onConfirm={handlePasswordConfirm} onCancel={handlePasswordCancel} />
            )}
        </div>
    );
};

export default EventView;
