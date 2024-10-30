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
import CreatedCharacter from './CreatedCharacter/CreatedCharacterView';
import './EventView.css';
import ClearButton from './ClearButton/ClearButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield, faHeart, faGavel, faHatWizard } from '@fortawesome/free-solid-svg-icons';
import useAuthCheck from '../../hooks/useAuthCheck';
import apiUrl from '../../config/apiConfig';

const EventView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const eventCode = new URLSearchParams(location.search).get('code'); // Extraire le code depuis location.search
    const { isAuthenticated, isAuthChecked } = useAuthCheck(); // Utilisation de useAuthCheck pour gérer l'authentification
    const { characters, loading, error, setCharacters } = useFetchCharacters(eventCode || '');
    const [parties, setParties] = useState<Party[]>([]);
    const [errorState, setErrorState] = useState<string | null>(null);
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);

    // Charger le personnage créé depuis le localStorage
    useEffect(() => {
        const characterData = localStorage.getItem('createdCharacter');
        if (characterData) {
            setCreatedCharacter(JSON.parse(characterData));
        }
    }, []);

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
                setParties([...updatedParties]); // Spread pour forcer le re-render
            } catch (error) {
                console.error('Error fetching parties:', error);
                setErrorState('Failed to fetch parties');
            }
        } else {
            console.error('Event code is null');
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
        if (eventCode) {
            try {
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
                setParties([]); // Clear the parties state
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

    const swapCharacters = (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => {
        setParties((prevParties) => {
            const updatedParties = prevParties.map((party) => ({
                ...party,
                members: [...party.members],
            }));

            const sourceParty = updatedParties[fromPartyIndex];
            const targetParty = updatedParties[toPartyIndex];

            // Swap des personnages
            [sourceParty.members[fromIndex], targetParty.members[toIndex]] =
                [targetParty.members[toIndex], sourceParty.members[fromIndex]];

            updatePartiesInBackend(updatedParties);

            return updatedParties;
        });
    };

    const moveCharacter = (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => {
        setParties((prevParties) => {
            const updatedParties = [...prevParties];

            const sourceParty = updatedParties[fromPartyIndex];
            const targetParty = updatedParties[toPartyIndex];

            if (!sourceParty || !targetParty || !sourceParty.members[fromIndex]) {
                console.error("Invalid indices or no character to move");
                return updatedParties;
            }

            const [movedCharacter] = sourceParty.members.splice(fromIndex, 1);

            if (targetParty.members.length < 5) {
                targetParty.members.splice(toIndex, 0, movedCharacter);
            } else {
                console.error("Target party is full. Move not allowed.");
                sourceParty.members.splice(fromIndex, 0, movedCharacter);
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

    const tanks = characters.filter((character) => character.role === 'TANK');
    const heals = characters.filter((character) => character.role === 'HEAL');
    const melees = characters.filter((character) => character.role === 'CAC');
    const dist = characters.filter((character) => character.role === 'DIST');

    if (loading || !isAuthChecked) return <Loading />;
    if (error || errorState) return <div>{error || errorState}</div>;

    return (
        <div>
            <CreatedCharacter
                character={createdCharacter}
                onSave={handleSaveCharacter}
                onDelete={handleCharacterDeletion}
            />

            <div className="title-container">
                <div className="title-clear-container">
                    <h1 className="title">Waiting Room ({characters.length} participants)</h1>
                    {isAuthenticated && <ClearButton onClear={handleClear} />}
                </div>
            </div>

            <div className="table-container">
                <div className="table-wrapper">
                    <div className="icon-text-container">
                        <FontAwesomeIcon icon={faShield} style={{ color: 'black', marginRight: '8px' }} />
                        <h2>Tanks ({tanks.length})</h2>
                    </div>
                    <CharacterTable
                        characters={tanks}
                        onDelete={isAuthenticated ? handleDelete : undefined}
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
                        highlightedId={createdCharacter?.id}
                    />
                </div>
            </div>


            {isAuthenticated &&
                <div className="title-container">
                    <ShuffleButton onShuffle={handleShuffle} />
                </div>
            }

            {parties.length === 0 &&
                <div className="title-container">
                    <p><b>Waiting for the event to launch...</b></p>
                </div>
            }
            {parties.length > 0 && (
                <div>
                    <div className="title-container">
                        <h2 className="subtitle">
                            Event running... ({parties.reduce((acc, party) => acc + party.members.length, 0)} participants)
                        </h2>
                        {isAuthenticated && <ClearButton onClear={handleClearEvent} />}
                    </div>
                    <PartyTable
                        parties={parties}
                        moveCharacter={moveCharacter}
                        swapCharacters={swapCharacters}
                        isAdmin={isAuthenticated as boolean}
                    />
                </div>
            )}
        </div>
    );
};

export default EventView;
