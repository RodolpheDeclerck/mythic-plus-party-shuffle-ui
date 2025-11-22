import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import PartyTable from '../PartyTable/PartyTable';
import ClearButton from '../ClearButton/ClearButton';
import { Party } from '../../../types/Party';
import './EventHeader.css';
import '../EventView.css';

interface EventHeaderProps {
    parties: Party[];
    arePartiesVisible: boolean;
    isAuthenticated: boolean;
    onToggleVisibility: () => void;
    onClearParties: () => void;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, sourceId: number, targetId: number) => void;
}

const EventHeader: React.FC<EventHeaderProps> = ({
    parties,
    arePartiesVisible,
    isAuthenticated,
    onToggleVisibility,
    onClearParties,
    moveCharacter,
    swapCharacters
}) => {
    if (parties.length === 0) {
        return null;
    }

    const totalParticipants = parties.reduce((acc, party) => acc + party.members.length, 0);

    return (
        <div>
            <div className="title-container">
                <div className="event-header-content">
                    <h2 className="subtitle">
                        Event running... ({totalParticipants} participants)
                    </h2>
                    {isAuthenticated && (
                        <>
                            <ClearButton onClear={onClearParties} />
                            <button className="eye-button" onClick={onToggleVisibility}>
                                {!arePartiesVisible ? (
                                    <FontAwesomeIcon icon={faEyeSlash} className="role-icon-hidden" />
                                ) : (
                                    <FontAwesomeIcon icon={faEye} />
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {(isAuthenticated || arePartiesVisible) && (
                <PartyTable
                    parties={parties}
                    moveCharacter={moveCharacter}
                    swapCharacters={swapCharacters}
                    isAdmin={isAuthenticated}
                />
            )}
        </div>
    );
};

export default EventHeader;
