'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import InputField from './InputFieldProps';
import apiUrl from '../config/apiConfig';
import './CreateEventPage.css';

const CreateEventPage: React.FC = () => {
  const [eventName, setEventName] = useState<string>(''); // Event name
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Assume user is authenticated via cookie
  const [isCreating, setIsCreating] = useState<boolean>(false); // State to know if event is being created
  const router = useRouter();

  interface EventResponse {
    code: string;
  }

  // Authentication verification not necessary via localStorage
  // User is assumed to be authenticated if JWT cookie is present.
  // This part can be enhanced by sending a request to the server to validate authentication if necessary.

  // Function to create the event
  const handleCreateEvent = async () => {
    if (!eventName) return;

    setIsCreating(true); // Set state to creation mode

    try {
      // Send request to create event with cookies included
      const response = await axios.post<EventResponse>(
        `${apiUrl}/api/events`,
        { name: eventName }, // Data sent in request body
        {
          withCredentials: true, // Automatically sends `authToken` cookie
        }
      );

      // Redirect user to event page with event code
      const eventCode = response.data.code; // Get event code from response
      router.push(`/event?code=${eventCode}`); // Redirect to event page

    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreating(false); // End creation process
    }
  };

  return (
    <div className="create-event-container">
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
