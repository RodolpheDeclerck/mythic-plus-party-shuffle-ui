import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import useWebSocket from '../../hooks/useWebSocket';
import useAuthCheck from '../../hooks/useAuthCheck';

// Définition de l'interface pour les événements
interface Event {
    id: number;
    name: string;
    code: string;
}

const EventSelectionPage = () => {
    const { isAuthenticated, isAuthChecked, handleLogout } = useAuthCheck(); // Utilisation du hook pour centraliser l'authentification
    const [events, setEvents] = useState<Event[]>([]); // Définition explicite du type Event[]

    // Déclare la fonction fetchAdminEvents avant son utilisation
    const fetchAdminEvents = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/events/admin-events`, { withCredentials: true });
            setEvents(response.data as Event[]); // Stocke les événements dans l'état
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Utiliser useEffect pour la redirection et la récupération des événements
    useEffect(() => {
        if (isAuthChecked && isAuthenticated !== null) {  // Attendre la fin du chargement
            if (!isAuthenticated) {
                window.location.href = '/login'; // Redirection si non authentifié
            } else {
                fetchAdminEvents(); // Si authentifié, récupère les événements
            }
        }
    }, [isAuthenticated, isAuthChecked]);

    // Utiliser useWebSocket inconditionnellement
    useWebSocket(() => { }, () => { }, fetchAdminEvents);

    // Redirection vers un événement spécifique
    const handleJoinEvent = (eventCode: string) => {
        window.location.href = `/event?code=${eventCode}`;
    };

    // Fonction pour supprimer un événement
    const handleDeleteEvent = async (eventCode: string) => {
        try {
            await axios.delete(`${apiUrl}/api/events/${eventCode}`, { withCredentials: true });
            console.log(`Event ${eventCode} deleted successfully`);
            fetchAdminEvents(); // Actualise la liste des événements après suppression
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (isAuthenticated) {
        // Afficher le contenu uniquement si l'utilisateur est authentifié
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
