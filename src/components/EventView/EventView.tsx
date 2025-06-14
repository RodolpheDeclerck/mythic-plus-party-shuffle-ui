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
import { Character } from '../../types/Character';

const EventView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const eventCode = new URLSearchParams(location.search).get('code');
    const { isAuthenticated, isAuthChecked } = useAuthCheck();
    const { characters, loading, error, setCharacters } = useFetchCharacters(eventCode || '');
    const [parties, setParties] = useState<Party[]>([]);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true); // État pour suivre la vérification
    const [arePartiesVisible, setArePartiesVisible] = useState(false);
    const [draggedCharacter, setDraggedCharacter] = useState<Character | null>(null);
    const [lastShuffleMaxId, setLastShuffleMaxId] = useState<number | null>(null);

    // Fonction pour vérifier l'existence de l'événement
    const checkEventExistence = async (): Promise<boolean> => {
        if (eventCode) {
            try {
                const response = await axios.get<Event>(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
                const event = response.data;
                if (event) {
                    setArePartiesVisible(event.arePartiesVisible); // Stockez la valeur dans l'état
                }
                setArePartiesVisible(event.arePartiesVisible); // Stockez la valeur dans l'état
                return true; // L'événement existe
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    return false; // L'événement n'existe pas
                } else {
                    console.error('Erreur lors de la vérification de l\'événement:', error);
                }
            }
        }
        return false; // Aucun eventCode ou autre erreur
    };

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

    const fetchParties = async () => {
        if (eventCode) {
            try {
                const updatedParties = await fetchPartiesApi(eventCode);
                setParties([...updatedParties]);
            } catch (error) {
                console.error('Error fetching parties:', error);
                setErrorState('Failed to fetch parties');
            }
        } else {
            console.error('Event code is null');
        }
    };

    const fetchEvent = async () => {
        if (eventCode) {
            try {
                const response = await axios.get<Event>(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
                const event = response.data;
                if (event) {
                    setArePartiesVisible(event.arePartiesVisible); // Stockez la valeur dans l'état
                }
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    console.error('Error fetching event:', error);
                    setErrorState('Failed to fetch event');
                } else {
                    console.error('Error fetching event:', error);
                }
            }
        }
    }


    useWebSocket(fetchCharacters, fetchParties, fetchEvent);

    const handleDelete = async (id: number) => {
        try {
            await deleteCharacter(id);
            fetchCharacters();
        } catch (error) {
            console.error(`Error deleting character with ID ${id}:`, error);
            setErrorState('Failed to delete character');
        }
    };

    const handleUpdate = (character: any) => {
        setCreatedCharacter(character);
        setIsEditing(true);
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
                // Stocker l'ID maximum des personnages présents au moment du mélange
                const maxId = Math.max(...characters.map(char => char.id));
                setLastShuffleMaxId(maxId);

            } catch (error) {
                console.error('Error shuffling parties:', error);
                setErrorState('Failed to shuffle parties');
            }
        } else {
            console.error('Event code is null');
        }
    };

    const handleClear = async () => {
        try {
            const ids = characters.map((character) => character.id);
            await deleteCharacters(ids);
            fetchCharacters();
        } catch (error) {
            console.error('Error deleting characters:', error);
            setErrorState('Failed to delete characters');
        }
    };

    const handleClearEvent = async () => {
        if (eventCode) {
            try {
                await deleteParties(eventCode);
                setParties([]);
            } catch (error) {
                console.error('Error deleting parties:', error);
                setErrorState('Failed to delete parties');
            }
        } else {
            console.error('Event code is null');
        }
    };

    const handleSaveCharacter = (updatedCharacter: any) => {
        setCreatedCharacter({ ...updatedCharacter });
        localStorage.setItem('createdCharacter', JSON.stringify(updatedCharacter));
    };

    const handleCharacterDeletion = (deletedId: number) => {
        setCharacters((prevCharacters) => prevCharacters.filter((character) => character.id !== deletedId));
    };

    const handleEyeButtonClick = async () => {
        if (!eventCode) {
            console.error('Event code is missing.');
            return;
        }

        try {
            // Envoyer une requête PATCH pour mettre à jour la visibilité
            await axios.patch(
                `${apiUrl}/api/events/${eventCode}/setPartiesVisibility`,
                { visible: !arePartiesVisible }, // Corps de la requête
                { withCredentials: true } // Inclure les cookies si nécessaires
            );

        } catch (error) {
            console.error('Failed to update parties visibility:', error);
        }
    };

    const swapCharacters = (fromPartyIndex: number, toPartyIndex: number, sourceId: number, targetId: number) => {
        setParties((prevParties) => {
            const updatedParties = prevParties.map((party) => ({
                ...party,
                members: [...party.members],
            }));

            const sourceParty = updatedParties[fromPartyIndex];
            const targetParty = updatedParties[toPartyIndex];

            // Find the members by their IDs
            const sourceMemberIndex = sourceParty.members.findIndex(m => m.id === sourceId);
            const targetMemberIndex = targetParty.members.findIndex(m => m.id === targetId);

            if (sourceMemberIndex === -1 || targetMemberIndex === -1) {
                console.error("Members not found");
                return prevParties;
            }

            // Perform the swap using the found indices
            [sourceParty.members[sourceMemberIndex], targetParty.members[targetMemberIndex]] =
                [targetParty.members[targetMemberIndex], sourceParty.members[sourceMemberIndex]];

            updatePartiesInBackend(updatedParties);

            return updatedParties;
        });
    };

    const moveCharacter = (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => {
        setParties((prevParties) => {
            const updatedParties = [...prevParties];
            const sourceParty = updatedParties[fromPartyIndex];
            const targetParty = updatedParties[toPartyIndex];

            if (!sourceParty || !targetParty) {
                console.error("Invalid party indices");
                return prevParties;
            }

            // Find the member by ID
            const memberIndex = sourceParty.members.findIndex(m => m.id === memberId);
            if (memberIndex === -1) {
                console.error("Member not found");
                return prevParties;
            }

            // Remove the member from the source party
            const [movedCharacter] = sourceParty.members.splice(memberIndex, 1);

            if (targetParty.members.length < 5) {
                // Insert at the specified target index
                targetParty.members.splice(toIndex, 0, movedCharacter);
            } else {
                console.error("Target party is full. Move not allowed.");
                // Put the character back in the source party
                sourceParty.members.splice(memberIndex, 0, movedCharacter);
            }

            updatePartiesInBackend(updatedParties);

            return updatedParties;
        });
    };

    const updatePartiesInBackend = async (updatedParties: Party[]) => {
        try {
            const response = await fetch(`${apiUrl}/api/events/${eventCode}/parties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedParties),
            });

            if (!response.ok) {
                throw new Error('Failed to update parties');
            }
            console.log('Parties updated in Redis');
        } catch (error) {
            console.error('Error updating parties in Redis:', error);
        }
    };

    useEffect(() => {
        fetchParties();
    }, []);

    // Filtrer les personnages qui ont rejoint après le dernier mélange
    const charactersAfterShuffle = lastShuffleMaxId 
        ? characters.filter(character => character.id > lastShuffleMaxId)
        : [];

    // Utiliser tous les personnages pour la waiting room
    const tanks = characters.filter((character) => character.role === 'TANK');
    const heals = characters.filter((character) => character.role === 'HEAL');
    const melees = characters.filter((character) => character.role === 'CAC');
    const dist = characters.filter((character) => character.role === 'DIST');

    const handleDragStart = (character: Character) => {
        setDraggedCharacter(character);
    };

    const handleDragEnd = () => {
        setDraggedCharacter(null);
    };

    const handleDrop = (partyIndex: number, position: number, character: Character) => {
        setParties(prevParties => {
            const newParties = [...prevParties];
            const targetParty = newParties[partyIndex];
            
            if (targetParty.members.length >= 5) {
                return prevParties; // Le groupe est déjà complet
            }

            // Ajouter le personnage au groupe
            targetParty.members.splice(position, 0, character);
            
            // Mettre à jour le backend
            updatePartiesInBackend(newParties);
            
            return newParties;
        });

        // Mettre à jour lastShuffleMaxId pour que le personnage ne soit plus considéré comme nouveau
        if (lastShuffleMaxId && character.id > lastShuffleMaxId) {
            setLastShuffleMaxId(character.id);
        }
    };

    if (isVerifying || loading || !isAuthChecked) return <Loading />;
    if (error || errorState) return <div>{error || errorState}</div>;

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
            {parties.length > 0 && (isAuthenticated || arePartiesVisible) && (
                <div>
                    <div className="title-container">
                        <h2 className="subtitle">
                            Event running... ({parties.reduce((acc, party) => acc + party.members.length, 0)} participants)
                        </h2>
                        {isAuthenticated && (
                            <div className="party-button-container">
                                <ClearButton onClear={handleClearEvent} />
                                <button className="eye-button" onClick={handleEyeButtonClick}>
                                    {!arePartiesVisible ? <FontAwesomeIcon icon={faEyeSlash}  style={{ color: 'red' }} /> : <FontAwesomeIcon icon={faEye} />}
                                </button>
                            </div>
                        )}
                    </div>

                    {!isAuthenticated && createdCharacter && parties.length > 0 && (
                        <div style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            padding: '20px',
                            margin: '20px auto',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '1.2em',
                            maxWidth: '800px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5em' }}>
                                ⚠️ Groups Have Been Formed!
                            </h3>
                            {!parties.some(party => party.members.some(member => member.id === createdCharacter.id)) ? (
                                <p style={{ margin: '0' }}>
                                    <strong>You are not yet assigned to a group.</strong><br/>
                                    Please wait for the next shuffle to be included in a group.
                                </p>
                            ) : (
                                <p style={{ margin: '0' }}>
                                    <strong>You have been assigned to a group!</strong><br/>
                                    Check the groups below to find your position.
                                </p>
                            )}
                        </div>
                    )}

                    <PartyTable
                        parties={parties}
                        moveCharacter={moveCharacter}
                        swapCharacters={swapCharacters}
                        isAdmin={isAuthenticated as boolean}
                        onDrop={handleDrop}
                    />

                    {charactersAfterShuffle.length > 0 && (
                        <div className="table-container">
                            <div className="table-wrapper">
                                <div className="icon-text-container">
                                    <h2 style={{ color: 'red' }}>⚠️ New Players ({charactersAfterShuffle.length})</h2>
                                    <p style={{ color: 'gray', fontSize: '0.9em' }}>These players joined after the last shuffle and are not in the current groups</p>
                                </div>
                                <CharacterTable
                                    characters={charactersAfterShuffle}
                                    onDelete={isAuthenticated ? handleDelete : undefined}
                                    onUpdate={isAuthenticated ? handleUpdate : undefined}
                                    highlightedId={createdCharacter?.id}
                                    isDraggable={!!isAuthenticated}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDrop={handleDrop}
                                />
                            </div>
                        </div>
                    )}

                </div>
            )}
            <div className="title-container">
                <div className="title-clear-container">
                    <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                    {isAuthenticated && <ClearButton onClear={handleClear} />}
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
                        <FontAwesomeIcon icon={faShield} style={{ color: 'black', marginRight: '8px' }} />
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
                        <FontAwesomeIcon icon={faHeart} style={{ color: 'green', marginRight: '8px' }} />
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
                        <FontAwesomeIcon icon={faGavel} style={{ color: 'red', marginRight: '8px' }} />
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
                        <FontAwesomeIcon icon={faHatWizard} style={{ color: 'blue', marginRight: '8px' }} />
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
