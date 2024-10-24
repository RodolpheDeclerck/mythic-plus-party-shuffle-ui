import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthButtons from './Authentication/AuthButtons';
import InputField from './InputFieldProps';
import apiUrl from '../config/apiConfig';

const CreateEventPage: React.FC = () => {
  const [eventName, setEventName] = useState<string>(''); // Nom de l'événement
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // On part du principe que l'utilisateur est authentifié via cookie
  const [isCreating, setIsCreating] = useState<boolean>(false); // État pour savoir si l'événement est en cours de création
  const navigate = useNavigate();

  interface EventResponse {
    code: string;
  }

  // Vérification de l'authentification non nécessaire via localStorage
  useEffect(() => {
    // L'utilisateur est supposé être authentifié si le cookie JWT est présent.
    // Cette partie peut être enrichie en envoyant une requête au serveur pour valider l'authentification si nécessaire.
  }, [navigate]);

  // Fonction pour créer l'événement
  const handleCreateEvent = async () => {
    if (!eventName) return;

    setIsCreating(true); // Définir l'état en mode création

    try {
      // Envoie la requête pour créer un événement avec les cookies inclus
      const response = await axios.post<EventResponse>(
        `${apiUrl}/api/events`,
        { name: eventName }, // Données envoyées dans le corps de la requête
        {
          withCredentials: true, // Envoie automatiquement le cookie `authToken`
        }
      );

      // Rediriger l'utilisateur vers la page de l'événement avec le code de l'événement
      const eventCode = response.data.code; // Récupérer le code de l'événement depuis la réponse
      navigate(`/event?code=${eventCode}`); // Rediriger vers la page de l'événement

    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreating(false); // Fin du processus de création
    }
  };

  return (
    <div className="create-event-container">
      <AuthButtons />
      {isAuthenticated && (
        <div className="wrapper">
          <h1>Create New Event</h1>
          <InputField
            label=""
            type="text"
            placeholder="Enter event name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          {eventName && (
            <button onClick={handleCreateEvent} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Event'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateEventPage;
