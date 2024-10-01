import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CharacterTable from './CharacterTable/CharacterTable';
import PartyTable from './PartyTable/PartyTable';
import ShuffleButton from './ShuffleButton/ShuffleButton';
import Loading from '../Loading';
import PasswordPopup from '../PasswordPopup/PasswordPopup';
import useFetchCharacters from '../../hooks/useFetchCharacters';
import useWebSocket from '../../hooks/useWebSocket';
import { deleteParties, fetchCharacters as fetchCharactersApi, deleteCharacter, shuffleParties, fetchParties as fetchPartiesApi, deleteCharacters } from '../../services/api';
import { Party } from '../../types/Party';
import CreatedCharacter from './CreatedCharacter/CreatedCharacter';
import './EventView.css';
import { useTranslation } from 'react-i18next';
import ClearButton from './ClearButton/ClearButton';

const EventView: React.FC = () => {
    const { characters, loading, error, setCharacters } = useFetchCharacters();
    const [parties, setParties] = useState<Party[]>([]);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const isAdminPage = location.pathname === '/event/admin';
    const { t } = useTranslation();

    useEffect(() => {
        // Récupérer les informations du personnage créé depuis le localStorage
        const characterData = localStorage.getItem('createdCharacter');
        if (characterData) {
            setCreatedCharacter(JSON.parse(characterData));
        }
    }, []);

    useEffect(() => {
        if (isAdminPage && localStorage.getItem('isAdmin') !== 'true') {
            navigate('/event');
        }
    }, [isAdminPage, navigate]);

    // Regrouper les appels API dans des fonctions distinctes
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

    // Gestion des événements
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

    const handleClear = async () => {
        try {
            const ids = characters.map(character => character.id);
            await deleteCharacters(ids);
            fetchCharacters();
        } catch (error) {
            console.error('Error deleting character:', error);
            setErrorState('Failed to delete character');
        }
    };

    const handleClearEvent = async () => {
        try {
            deleteParties();
        } catch (error) {
            console.error('Error deleting parties:', error);
            setErrorState('Failed to delete parties');
        }
    };

    const handleSaveCharacter = (updatedCharacter: any) => {
        setCreatedCharacter(updatedCharacter);
        localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
    };

    const handleCharacterDeletion = (deletedId: number) => {
        setCharacters((prevCharacters) => prevCharacters.filter(character => character.id !== deletedId));
    };

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
                {!isAdminPage && <button onClick={() => setShowPasswordPopup(true)}>Admin</button>}
            </div>

            {/* Utiliser le composant CreatedCharacter */}
            {createdCharacter && (
                <CreatedCharacter
                    character={createdCharacter}
                    onSave={handleSaveCharacter}
                    onDelete={handleCharacterDeletion} // Pass the onDelete prop here
                />
            )}

            <div className="title-container">
                <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                {isAdminPage && <ClearButton onClear={handleClear} />}
            </div>

            {/* Conteneur flex pour les tableaux */}
            <div className="table-container">
                {/* Tableau des Tanks */}
                <div className="table-wrapper">
                    <h2>Tanks ({tanks.length})</h2>
                    <CharacterTable characters={tanks} onDelete={isAdminPage ? handleDelete : undefined} />
                </div>

                {/* Tableau des Heals */}
                <div className="table-wrapper">
                    <h2>Heals ({heals.length})</h2>
                    <CharacterTable characters={heals} onDelete={isAdminPage ? handleDelete : undefined} />
                </div>

                {/* Tableau des DPS */}
                <div className="table-wrapper">
                    <h2>DPS ({dps.length})</h2>
                    <CharacterTable characters={dps} onDelete={isAdminPage ? handleDelete : undefined} />
                </div>
            </div>
            {isAdminPage && <ShuffleButton onShuffle={handleShuffle} />}
            <div className="title-container">
                {parties.length === 0 && !isAdminPage && <p><b>Waiting for the event to launch...</b></p>}
            </div>
            {parties.length > 0 && (
                <div>
                    <div className="title-container">
                        <h2 className="subtitle">Event running... ({parties.reduce((acc, party) => acc + party.members.length, 0)} participants)</h2>
                        {isAdminPage && <ClearButton onClear={handleClearEvent} />}
                    </div>
                    <PartyTable parties={parties} />
                </div>
            )}

            {showPasswordPopup && (
                <PasswordPopup
                    onConfirm={() => {
                        localStorage.setItem('isAdmin', 'true');
                        setShowPasswordPopup(false);
                        navigate('/event/admin');
                    }}
                    onCancel={() => setShowPasswordPopup(false)}
                />
            )}
        </div>
    );
};

export default EventView;
