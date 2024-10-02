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
import CreatedCharacter from './CreatedCharacter/CreatedCharacterView';
import './EventView.css';
import { useTranslation } from 'react-i18next';
import ClearButton from './ClearButton/ClearButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield, faHeart, faCrosshairs } from '@fortawesome/free-solid-svg-icons';

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
            setParties([...updatedParties]); // Spread to force re-render
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
            let updatedCharacter = null;

            if (createdCharacter) {
                updatedCharacter = shuffledParties
                    .flatMap(party => party.members)
                    .find(member => member.id === createdCharacter.id);
            }

            if (updatedCharacter) {
                setCreatedCharacter({ ...updatedCharacter });
                localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
            } else {
                setCreatedCharacter(null);
                localStorage.removeItem('createdCharacter');
            }

            setParties([...shuffledParties]);

            // Debugging logs
            console.log('Updated shuffled parties:', shuffledParties);
            console.log('Updated createdCharacter:', updatedCharacter);
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
            console.error('Error deleting characters:', error);
            setErrorState('Failed to delete characters');
        }
    };

    const handleClearEvent = async () => {
        try {
            await deleteParties();
            setParties([]); // Clear the parties state
        } catch (error) {
            console.error('Error deleting parties:', error);
            setErrorState('Failed to delete parties');
        }
    };

    const handleSaveCharacter = (updatedCharacter: any) => {
        setCreatedCharacter({ ...updatedCharacter });
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

            {createdCharacter && (
                <CreatedCharacter
                    character={createdCharacter}
                    onSave={handleSaveCharacter}
                    onDelete={handleCharacterDeletion}
                />
            )}

            <div className="title-container">
                <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                {isAdminPage && <ClearButton onClear={handleClear} />}
            </div>

            <div className="table-container">
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faShield} style={{ color: 'blue', marginRight: '8px' }} />
                        <h2>Tanks ({tanks.length})</h2>
                    </div>
                    <CharacterTable characters={tanks} onDelete={isAdminPage ? handleDelete : undefined} highlightedId={createdCharacter?.id} />
                </div>
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faHeart} style={{ color: 'green', marginRight: '8px' }} />
                        <h2>Heals ({heals.length})</h2>
                    </div>
                    <CharacterTable characters={heals} onDelete={isAdminPage ? handleDelete : undefined} highlightedId={createdCharacter?.id} />
                </div>

                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faCrosshairs} style={{ color: 'red', marginRight: '8px' }} />
                        <h2>DPS ({dps.length})</h2>
                    </div>
                    <CharacterTable characters={dps} onDelete={isAdminPage ? handleDelete : undefined} highlightedId={createdCharacter?.id} />
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
                    <PartyTable parties={parties} highlightedId={createdCharacter?.id} />
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
