import React from 'react';
import './EventGroupsMessage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface EventGroupsMessageProps {
    isVisible: boolean;
    totalParticipants: number;
    numberOfGroups: number;
    parties: any[];
    currentPlayerId?: number;
}

const EventGroupsMessage: React.FC<EventGroupsMessageProps> = ({ 
    isVisible, 
    totalParticipants, 
    numberOfGroups,
    parties,
    currentPlayerId 
}) => {
    if (!isVisible) {
        return null;
    }

    // Find which party the current player is in
    let playerPartyNumber = null;
    let playerPartySize = 0;
    
    if (currentPlayerId) {
        for (let i = 0; i < parties.length; i++) {
            const party = parties[i];
            if (party.members.some((member: any) => member.id === currentPlayerId)) {
                playerPartyNumber = i + 1;
                playerPartySize = party.members.length;
                break;
            }
        }
    }

    return (
        <div className="event-groups-message">
            <div className="message-content">
                <div className="message-icon">
                    <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="message-text">
                    <h3>Groups Have Been Formed!</h3>
                    <p>
                        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
                        The event has been shuffled into {numberOfGroups} group{numberOfGroups > 1 ? 's' : ''} with {totalParticipants} participant{totalParticipants > 1 ? 's' : ''}.
                    </p>
                    {playerPartyNumber && (
                        <div className="party-info">
                            🎯 You are in Party {playerPartyNumber} ({playerPartySize} members)
                        </div>
                    )}
                    <p className="instruction">
                        Check the groups below to see your team!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventGroupsMessage;
