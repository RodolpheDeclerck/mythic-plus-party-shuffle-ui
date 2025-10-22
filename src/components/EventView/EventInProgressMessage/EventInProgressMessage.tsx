import React from 'react';
import './EventInProgressMessage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faUserTie } from '@fortawesome/free-solid-svg-icons';

interface EventInProgressMessageProps {
    isVisible: boolean;
}

const EventInProgressMessage: React.FC<EventInProgressMessageProps> = ({ isVisible }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="event-in-progress-message">
            <div className="message-content">
                <div className="message-icon">
                    <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <div className="message-text">
                    <h3>Event Already in Progress</h3>
                    <p>
                        <FontAwesomeIcon icon={faUserTie} className="admin-icon" />
                        This event has already started. Please contact the organizer to join a group.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventInProgressMessage;
