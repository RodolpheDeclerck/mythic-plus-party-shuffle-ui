import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PartyTable from './PartyTable/PartyTable';
import CharacterTable from './CharacterTable/CharacterTable';
import ShuffleButton from './ShuffleButton/ShuffleButton';
import Loading from '../Loading';
import useFetchCharacters from '../../hooks/useFetchCharacters';
import useWebSocket from '../../hooks/useWebSocket';
import {
    fetchCharacters as fetchCharactersApi,
} from '../../services/api';
import CreatedCharacter from './CreatedCharacter/CreatedCharacterView';
import './EventView.css';
import ClearButton from './ClearButton/ClearButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield, faHeart, faGavel, faHatWizard, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import useAuthCheck from '../../hooks/useAuthCheck';
import { useEventData } from '../../hooks/useEventData';
import { useCharacterManagement } from '../../hooks/useCharacterManagement';
import { usePartyManagement } from '../../hooks/usePartyManagement';

const EventView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventCode = new URLSearchParams(location.search).get('code');
    const { isAuthenticated, isAuthChecked } = useAuthCheck();
    const { characters, loading, error, setCharacters } = useFetchCharacters(eventCode || '');
    // Custom hook for party management
    const { parties, error: partyError, fetchParties, handleClearEvent, swapCharacters, moveCharacter, handleShuffle } = usePartyManagement(eventCode || '');
    const [errorState, setErrorState] = useState<string | null>(null);
    
    // Custom hook for character management
    const { createdCharacter, setCreatedCharacter, isEditing, setIsEditing, error: characterError, handleSaveCharacter, handleUpdate, handleDelete, handleClear, handleCharacterDeletion } = useCharacterManagement(eventCode || '');
    
    // Custom hook for event data
    const { arePartiesVisible, isVerifying, setIsVerifying, checkEventExistence, fetchEvent, togglePartiesVisibility } = useEventData(eventCode || '');


    // Check event existence on component mount
    useEffect(() => {
        const verifyAndRedirect = async () => {
            const eventExists = await checkEventExistence();
            if (!eventExists) {
                navigate('/'); // Redirect to home if event doesn't exist
            } else {
                const characterData = localStorage.getItem('createdCharacter');
                if (characterData) {
                    setCreatedCharacter(JSON.parse(characterData));
                } else if (isAuthChecked && !isAuthenticated) {
                    navigate('/event/register?code=' + eventCode);
                }
            }
            setIsVerifying(false); // End verification
        };

        verifyAndRedirect();
    }, [eventCode, isAuthChecked, isAuthenticated, navigate]);

    const fetchCharacters = async () => {
        if (eventCode) {
            try {
                const updatedCharacters = await fetchCharactersApi(eventCode);
                setCharacters(updatedCharacters);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setErrorState('Failed to fetch characters');
            }
        } else {
            console.error('Event code is null');
        }
    };

    const fetchPartiesWrapper = async () => {
        fetchParties();
    };

    // Initialize WebSocket connection
    useWebSocket(fetchCharacters, fetchPartiesWrapper, fetchEvent);

    // Wrapper functions to pass dependencies to hooks
    const handleShuffleWrapper = async () => {
        handleShuffle(createdCharacter, setCreatedCharacter);
    };

    const handleClearEventWrapper = async () => {
        handleClearEvent();
    };

    // Load parties on component mount
    useEffect(() => {
        fetchPartiesWrapper();
    }, []);

    // Filter characters by role
    const tanks = characters.filter((character) => character.role === 'TANK');
    const heals = characters.filter((character) => character.role === 'HEAL');
    const melees = characters.filter((character) => character.role === 'CAC');
    const dist = characters.filter((character) => character.role === 'DIST');

    if (isVerifying || loading || !isAuthChecked) return <Loading />;
    if (error || errorState || characterError || partyError) return <div>{error || errorState || characterError || partyError}</div>;

    return (
        <div>
            <CreatedCharacter
                character={isAuthenticated && !isEditing ? undefined : createdCharacter}
                onSave={handleSaveCharacter}
                onDelete={handleCharacterDeletion}
                isAdmin={isAuthenticated ?? false}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                eventCode={eventCode ?? ''}
            />
            {/* Event running section - shows parties when event is active */}
            {parties.length > 0 && (isAuthenticated || arePartiesVisible) && (
                <div>
                    <div className="title-container">
                        <h2 className="subtitle">
                            Event running... ({parties.reduce((acc, party) => acc + party.members.length, 0)} participants)
                        </h2>
                        {isAuthenticated && (
                            <div className="party-button-container">
                                <ClearButton onClear={handleClearEventWrapper} />
                                <button className="eye-button" onClick={togglePartiesVisibility}>
                                    {!arePartiesVisible ? <FontAwesomeIcon icon={faEyeSlash} className="role-icon-hidden" /> : <FontAwesomeIcon icon={faEye} />}
                                </button>
                            </div>
                        )}
                    </div>

                    <PartyTable
                        parties={parties}
                        moveCharacter={moveCharacter}
                        swapCharacters={swapCharacters}
                        isAdmin={isAuthenticated as boolean}
                    />
                </div>
            )}
            {/* Waiting room section */}
            <div className="title-container">
                <div className="title-clear-container">
                    <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                    {isAuthenticated && <ClearButton onClear={() => handleClear(characters)} />}
                </div>
            </div>
            
            {/* Waiting message when no parties or parties not visible */}
            {parties.length === 0 || !arePartiesVisible &&
                <div className="title-container">
                    <p><b>Waiting for the event to launch...</b></p>
                </div>
            }
            
            {/* Shuffle button for authenticated users */}
            {isAuthenticated &&
                <div className="title-container">
                    <ShuffleButton onShuffle={handleShuffleWrapper} />
                </div>
            }
            
            {/* Character tables by role */}
            <div className="table-container">
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faShield} className="role-icon role-icon-tank" />
                        <h2>Tanks ({tanks.length})</h2>
                    </div>
                    <CharacterTable
                        characters={tanks}
                        onDelete={isAuthenticated ? handleDelete : undefined}
                        onUpdate={isAuthenticated ? handleUpdate : undefined}
                        highlightedId={createdCharacter?.id}
                    />
                </div>
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faHeart} className="role-icon role-icon-heal" />
                        <h2>Heals ({heals.length})</h2>
                    </div>
                    <CharacterTable
                        characters={heals}
                        onDelete={isAuthenticated ? handleDelete : undefined}
                        onUpdate={isAuthenticated ? handleUpdate : undefined}
                        highlightedId={createdCharacter?.id}
                    />
                </div>
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faGavel} className="role-icon role-icon-melee" />
                        <h2>Melees ({melees.length})</h2>
                    </div>
                    <CharacterTable
                        characters={melees}
                        onDelete={isAuthenticated ? handleDelete : undefined}
                        onUpdate={isAuthenticated ? handleUpdate : undefined}
                        highlightedId={createdCharacter?.id}
                    />
                </div>
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faHatWizard} className="role-icon role-icon-dist" />
                        <h2>Dist ({dist.length})</h2>
                    </div>
                    <CharacterTable
                        characters={dist}
                        onDelete={isAuthenticated ? handleDelete : undefined}
                        onUpdate={isAuthenticated ? handleUpdate : undefined}
                        highlightedId={createdCharacter?.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventView;
