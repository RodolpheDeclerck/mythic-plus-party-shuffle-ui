import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PartyTable from './PartyTable/PartyTable';
import ShuffleButton from './ShuffleButton/ShuffleButton';
import Loading from '../Loading';
import useFetchCharacters from '../../hooks/useFetchCharacters';
import useWebSocket from '../../hooks/useWebSocket';
import { fetchCharacters as fetchCharactersApi } from '../../services/api';
import CreatedCharacter from './CreatedCharacter/CreatedCharacterView';
import WaitingRoomHeader from './WaitingRoomHeader/WaitingRoomHeader';
import WaitingRoom from './WaitingRoom/WaitingRoom';
import useAuthCheck from '../../hooks/useAuthCheck';
import { useEventData } from '../../hooks/useEventData';
import { useCharacterManagement } from '../../hooks/useCharacterManagement';
import { usePartyManagement } from '../../hooks/usePartyManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ClearButton from './ClearButton/ClearButton';
import './EventView.css';
import './EventHeader/EventHeader.css';

const EventView: React.FC = () => {
    // Router and navigation
    const location = useLocation();
    const navigate = useNavigate();
    const eventCode = new URLSearchParams(location.search).get('code');
    
    // Authentication
    const { isAuthenticated, isAuthChecked } = useAuthCheck();
    
    // Character data and management
    const { characters, loading, error, setCharacters } = useFetchCharacters(eventCode || '');
    
    // Party management
    const { parties, error: partyError, fetchParties, handleClearEvent, swapCharacters, moveCharacter, handleShuffle } = usePartyManagement(eventCode || '');
    
    // Event data and visibility
    const { arePartiesVisible, isVerifying, setIsVerifying, checkEventExistence, fetchEvent, togglePartiesVisibility } = useEventData(eventCode || '');
    
    // Local state
    const [errorState, setErrorState] = useState<string | null>(null);


    // ===== INITIALIZATION =====
    // Check event existence and handle initial setup
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

    // ===== API FUNCTIONS =====
    const fetchCharacters = useCallback(async () => {
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
    }, [eventCode, setCharacters]);

    // Character management with refetch callback
    const { createdCharacter, setCreatedCharacter, isEditing, setIsEditing, error: characterError, handleSaveCharacter, handleUpdate, handleDelete, handleClear, handleCharacterDeletion } = useCharacterManagement(eventCode || '', fetchCharacters);

    const fetchPartiesWrapper = useCallback(async () => {
        fetchParties();
    }, [fetchParties]);

    const fetchEventWrapper = useCallback(async () => {
        fetchEvent();
    }, [fetchEvent]);

    // ===== WEBSOCKET & EFFECTS =====
    // Initialize WebSocket connection
    useWebSocket(fetchCharacters, fetchPartiesWrapper, fetchEventWrapper);

    // Load parties on component mount
    useEffect(() => {
        fetchPartiesWrapper();
    }, [fetchPartiesWrapper]);

    // ===== HELPER FUNCTIONS =====
    const handleShuffleWrapper = () => {
        handleShuffle(createdCharacter, setCreatedCharacter);
    };

    // ===== DATA PROCESSING =====
    // Filter characters by role
    const tanks = characters.filter((character) => character.role === 'TANK');
    const heals = characters.filter((character) => character.role === 'HEAL');
    const melees = characters.filter((character) => character.role === 'CAC');
    const dist = characters.filter((character) => character.role === 'DIST');

    // ===== LOADING & ERROR STATES =====
    if (isVerifying || loading || !isAuthChecked) return <Loading />;
    if (error || errorState || characterError || partyError) return <div>{error || errorState || characterError || partyError}</div>;

    return (
        <div>
            {/* ===== CHARACTER CREATION ===== */}
            <CreatedCharacter
                character={isAuthenticated && !isEditing ? undefined : createdCharacter}
                onSave={handleSaveCharacter}
                onDelete={handleCharacterDeletion}
                isAdmin={isAuthenticated ?? false}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                eventCode={eventCode ?? ''}
            />
            
            {/* ===== EVENT RUNNING SECTION ===== */}
            {parties.length > 0 && (isAuthenticated || arePartiesVisible) && (
                <div>
                    <div className="title-container">
                        <div className="event-header-content">
                        <h2 className="subtitle">
                            Event running... ({parties.reduce((acc, party) => acc + party.members.length, 0)} participants)
                        </h2>
                        {isAuthenticated && (
                                <div className="button-container">
                                <ClearButton onClear={handleClearEvent} />
                                    <button className="eye-button" onClick={togglePartiesVisibility}>
                                        {!arePartiesVisible ? <FontAwesomeIcon icon={faEyeSlash} className="role-icon-hidden" /> : <FontAwesomeIcon icon={faEye} />}
                                </button>
                            </div>
                        )}
                        </div>
                    </div>

                    <PartyTable
                        parties={parties}
                        moveCharacter={moveCharacter}
                        swapCharacters={swapCharacters}
                        isAdmin={isAuthenticated as boolean}
                    />
                </div>
            )}
            
            {/* ===== WAITING ROOM SECTION ===== */}
            <WaitingRoomHeader
                characters={characters}
                isAuthenticated={isAuthenticated ?? false}
                onClear={handleClear}
            />
            
            {/* ===== WAITING MESSAGE ===== */}
            {parties.length === 0 || !arePartiesVisible &&
                <div className="title-container">
                    <p><b>Waiting for the event to launch...</b></p>
                </div>
            }
            
            {/* ===== SHUFFLE BUTTON ===== */}
            {isAuthenticated &&
                <div className="title-container">
                    <ShuffleButton onShuffle={handleShuffleWrapper} />
                </div>
            }
            
            {/* ===== CHARACTER TABLES BY ROLE ===== */}
            <WaitingRoom
                tanks={tanks}
                heals={heals}
                melees={melees}
                dist={dist}
                isAuthenticated={isAuthenticated ?? false}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                        highlightedId={createdCharacter?.id}
                    />
        </div>
    );
};

export default EventView;
