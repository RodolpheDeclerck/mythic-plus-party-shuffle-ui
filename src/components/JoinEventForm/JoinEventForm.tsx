import React, { useState, useEffect } from 'react';
import './JoinEventForm.css';
import axios from 'axios';
import Cookies from 'js-cookie';  // Importation de js-cookie
import apiUrl from '../../config/apiConfig';

const JoinEventForm = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [eventCode, setEventCode] = useState('');

    // Vérifier l'authentification en regardant le cookie JWT
    useEffect(() => {
        const token = Cookies.get('authToken');  // Vérifie si le cookie JWT est présent
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEventCode(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.get(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
            if (response.status === 200) {
                window.location.href = `/event/register?code=${eventCode}`;
            }
        } catch (error: Error | any) {
            if (error.response && error.response.status === 404) {
                alert('Event not found');
            } else {
                console.error('Error fetching event:', error);
            }
        }
    };

    return (
        <div className='container'>
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Event Code :</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Enter event code"
                            name="eventCode"
                            value={eventCode}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit">Join</button>
                </form>
            </div>
        </div>
    );
};

export default JoinEventForm;
