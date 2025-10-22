import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import useWebSocket from '../../hooks/useWebSocket';
import useAuthCheck from '../../hooks/useAuthCheck';

// Interface definition for events
interface Event {
    id: number;
    name: string;
    code: string;
}

const EventSelectionPage = () => {
    const { isAuthenticated, isAuthChecked, handleLogout } = useAuthCheck(); // Use hook to centralize authentication
    const [events, setEvents] = useState<Event[]>([]); // Explicit Event[] type definition

    // Declare fetchAdminEvents function before its use
    const fetchAdminEvents = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/events/admin-events`, { withCredentials: true });
            setEvents(response.data as Event[]); // Store events in state
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Use useEffect for redirection and event fetching
    useEffect(() => {
        if (isAuthChecked && isAuthenticated !== null) {  // Wait for loading to finish
            if (!isAuthenticated) {
                window.location.href = '/login'; // Redirect if not authenticated
            } else {
                fetchAdminEvents(); // If authenticated, fetch events
            }
        }
    }, [isAuthenticated, isAuthChecked]);

    // Use useWebSocket unconditionally
    useWebSocket(() => { }, () => { }, fetchAdminEvents);

    // Redirect to a specific event
    const handleJoinEvent = (eventCode: string) => {
        window.location.href = `/event?code=${eventCode}`;
    };

    // Function to delete an event
    const handleDeleteEvent = async (eventCode: string) => {
        try {
            await axios.delete(`${apiUrl}/api/events/${eventCode}`, { withCredentials: true });
            console.log(`Event ${eventCode} deleted successfully`);
            fetchAdminEvents(); // Refresh event list after deletion
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (isAuthenticated) {
        // Display content only if user is authenticated
        return (
            <div className="container">
                <div className='wrapper'>
                    <div className='content-box'>
                        <h1>Hello</h1>
                        <button onClick={() => window.location.href = '/event/join'}>Join Existing Event</button>
                        <button onClick={() => window.location.href = '/event/create'}>Create New Event</button>

                        {/* Affiche la liste des événements */}
                        {events.length > 0 ? (
                            <div>
                                <h2>Your Admin Events</h2>
                                <div className="events-list">
                                    <ul>
                                        {events.map(event => (
                                            <li key={event.id}>
                                                <span>{event.name}</span>
                                                <button onClick={() => handleJoinEvent(event.code)}>Open</button>
                                                <button onClick={() => handleDeleteEvent(event.code)}>Delete</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <p>No events available.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default EventSelectionPage;
