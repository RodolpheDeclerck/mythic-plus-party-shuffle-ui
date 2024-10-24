import './Dashboard.css';
import Logout from "../Authentication/Logout";
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import useWebSocket from '../../hooks/useWebSocket';

// Définition de l'interface pour les événements
interface Event {
    id: number;
    name: string;
    code: string;
}

const EventSelectionPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Nouvel état pour le chargement
    const [events, setEvents] = useState<Event[]>([]); // Définition explicite du type Event[]

    // Vérifier l'authentification en regardant le cookie JWT
    useEffect(() => {
        const token = Cookies.get('authToken'); // Récupérer le cookie JWT
        if (token) {
            setIsAuthenticated(true);
            fetchAdminEvents(); // Si authentifié, récupère les événements
        } else {
            setIsAuthenticated(false);
            window.location.href = '/login'; // Redirection si non authentifié
        }
        setLoading(false); // Fin du chargement après vérification
    }, []);

    // Fonction pour récupérer les événements administrés par l'utilisateur
    const fetchAdminEvents = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/events/admin-events`, { withCredentials: true });
            setEvents(response.data as Event[]); // Stocke les événements dans l'état
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Redirection vers un événement spécifique
    const handleJoinEvent = (eventCode: string) => {
        window.location.href = `/event?code=${eventCode}`;
    };

    const handleDeleteEvent = async (eventCode: string) => {
        try {
            // Requête DELETE pour supprimer l'événement avec l'eventCode
            await axios.delete(`${apiUrl}/api/events/${eventCode}`, { withCredentials: true });
            console.log(`Event ${eventCode} deleted successfully`);
            fetchAdminEvents(); // Actualise la liste des événements après suppression
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    useWebSocket(() => { }, () => { }, fetchAdminEvents);

    // Si la vérification de l'authentification est en cours, afficher un indicateur de chargement
    if (loading) {
        return <div>Loading...</div>;
    }

    // Si l'utilisateur n'est pas authentifié, ne rien afficher (redirigé vers /login)
    if (!isAuthenticated) {
        return null;
    }

    // Afficher le contenu uniquement si l'utilisateur est authentifié
    return (
        <div className="container">
            <div className="auth-buttons">
                {isAuthenticated && <Logout />}
            </div>
            <div className='wrapper'>
                <div className='content-box'>
                    <h1>Hello</h1>
                    <button onClick={() => window.location.href = '/event/join'}>Join Existing Event</button>
                    <button onClick={() => window.location.href = '/event/create'}>Create New Event</button>

                    {/* Affiche la liste des événements */}
                    {isAuthenticated && events.length > 0 && (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventSelectionPage;
