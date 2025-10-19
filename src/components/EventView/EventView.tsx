import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PartyTable from './PartyTable/PartyTable';
import CharacterTable from './CharacterTable/CharacterTable';
import ShuffleButton from './ShuffleButton/ShuffleButton';
import Loading from '../Loading';
import useFetchCharacters from '../../hooks/useFetchCharacters';
import useWebSocket from '../../hooks/useWebSocket';
import {
    deleteParties,
    fetchCharacters as fetchCharactersApi,
    deleteCharacter,
    shuffleParties,
    fetchParties as fetchPartiesApi,
    deleteCharacters,
} from '../../services/api';
import { Party } from '../../types/Party';
import { Event } from '../../types/Event';
import CreatedCharacter from './CreatedCharacter/CreatedCharacterView';
import './EventView.css';
import ClearButton from './ClearButton/ClearButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield, faHeart, faGavel, faHatWizard, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import useAuthCheck from '../../hooks/useAuthCheck';
import apiUrl from '../../config/apiConfig';
import axios from 'axios';
import { useEventData } from '../../hooks/useEventData';
import { useCharacterManagement } from '../../hooks/useCharacterManagement';
import { usePartyManagement } from '../../hooks/usePartyManagement';

const EventView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventCode = new URLSearchParams(location.search).get('code');
    const { isAuthenticated, isAuthChecked } = useAuthCheck();
    const { characters, loading, error, setCharacters } = useFetchCharacters(eventCode || '');
    // Hook personnalisé pour la gestion des groupes
    const { parties, setParties, fetchParties, handleClearEvent, updatePartiesInBackend, swapCharacters, moveCharacter } = usePartyManagement(eventCode || '');
    const [errorState, setErrorState] = useState<string | null>(null);
    // Hook personnalisé pour la gestion des personnages
    const { createdCharacter, setCreatedCharacter, isEditing, setIsEditing, handleSaveCharacter, handleUpdate, handleDelete, handleClear, handleCharacterDeletion } = useCharacterManagement();
    
    // Hook personnalisé pour les données d'événement
    const { arePartiesVisible, setArePartiesVisible, isVerifying, setIsVerifying, checkEventExistence, fetchEvent, togglePartiesVisibility } = useEventData(eventCode || '');


    // useEffect pour vérifier l'existence de l'événement au montage
    useEffect(() => {
        const verifyAndRedirect = async () => {
            const eventExists = await checkEventExistence();
            if (!eventExists) {
                navigate('/'); // Redirection vers la page d'accueil si l'événement n'existe pas
            } else {
                const characterData = localStorage.getItem('createdCharacter');
                if (characterData) {
                    setCreatedCharacter(JSON.parse(characterData));
                } else if (isAuthChecked && !isAuthenticated) {
                    navigate('/event/register?code=' + eventCode);
                }
            }
            setIsVerifying(false); // Fin de la vérification
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
        fetchParties(setErrorState);
    };



    useWebSocket(fetchCharacters, fetchPartiesWrapper, fetchEvent);

    const handleDeleteWrapper = async (id: number) => {
        handleDelete(id, deleteCharacter, fetchCharacters, setErrorState);
    };


    const handleShuffle = async () => {
        if (eventCode) {
            try {
                await axios.patch(
                    `${apiUrl}/api/events/${eventCode}/setPartiesVisibility`,
                    { visible: false },
                    { withCredentials: true }
                );

                const shuffledParties = await shuffleParties(eventCode);
                let updatedCharacter = null;

                if (createdCharacter) {
                    updatedCharacter = shuffledParties
                        .flatMap((party) => party.members)
                        .find((member) => member.id === createdCharacter.id);
                }

                if (updatedCharacter) {
                    setCreatedCharacter({ ...updatedCharacter });
                    localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
                } else {
                    setCreatedCharacter(null);
                    localStorage.removeItem('createdCharacter');
                }

                setParties([...shuffledParties]);

            } catch (error) {
                console.error('Error shuffling parties:', error);
                setErrorState('Failed to shuffle parties');
            }
        } else {
            console.error('Event code is null');
        }
    };

    const handleClearWrapper = async () => {
        handleClear(characters, deleteCharacters, fetchCharacters, setErrorState);
    };

    const handleClearEventWrapper = async () => {
        handleClearEvent(setErrorState);
    };


    const handleCharacterDeletionWrapper = (deletedId: number) => {
        handleCharacterDeletion(deletedId, setCharacters);
    };





    useEffect(() => {
        fetchPartiesWrapper();
    }, []);

    const tanks = characters.filter((character) => character.role === 'TANK');
    const heals = characters.filter((character) => character.role === 'HEAL');
    const melees = characters.filter((character) => character.role === 'CAC');
    const dist = characters.filter((character) => character.role === 'DIST');

    if (isVerifying || loading || !isAuthChecked) return <Loading />;
    if (error || errorState) return <div>{error || errorState}</div>;

    return (
        <div>
            <CreatedCharacter
                character={isAuthenticated && !isEditing ? undefined : createdCharacter}
                onSave={handleSaveCharacter}
                onDelete={handleCharacterDeletionWrapper}
                isAdmin={isAuthenticated ?? false}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                eventCode={eventCode ?? ''}
            />
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
            <div className="title-container">
                <div className="title-clear-container">
                    <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                    {isAuthenticated && <ClearButton onClear={handleClearWrapper} />}
                </div>
            </div>
            {parties.length === 0 || !arePartiesVisible &&
                <div className="title-container">
                    <p><b>Waiting for the event to launch...</b></p>
                </div>
            }
            {isAuthenticated &&
                <div className="title-container">
                    <ShuffleButton onShuffle={handleShuffle} />
                </div>
            }
            <div className="table-container">
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faShield} className="role-icon role-icon-tank" />
                        <h2>Tanks ({tanks.length})</h2>
                    </div>
                    <CharacterTable
                        characters={tanks}
                        onDelete={isAuthenticated ? handleDeleteWrapper : undefined}
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
                        onDelete={isAuthenticated ? handleDeleteWrapper : undefined}
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
                        onDelete={isAuthenticated ? handleDeleteWrapper : undefined}
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
                        onDelete={isAuthenticated ? handleDeleteWrapper : undefined}
                        onUpdate={isAuthenticated ? handleUpdate : undefined}
                        highlightedId={createdCharacter?.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventView;
