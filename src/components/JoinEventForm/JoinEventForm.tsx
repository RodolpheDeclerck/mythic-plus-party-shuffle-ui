import React, { useState, useEffect } from 'react';
import './JoinEventForm.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import apiUrl from '../../config/apiConfig';

const JoinEventForm = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [eventCode, setEventCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to manage error message

    // Check authentication by looking at JWT cookie
    useEffect(() => {
        const token = Cookies.get('authToken');
        setIsAuthenticated(!!token);
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEventCode(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        try {
            const response = await axios.get(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
            
            if (response.status === 200) {
                window.location.href = `/event/register?code=${eventCode}`;
            }
        } catch (error: any) {
            console.error('Error fetching event:', error);  // Add this log to check the error
    
            if (error.response) {
                if (error.response.status === 404) {
                    setErrorMessage('Event not found');
                } else {
                    setErrorMessage('An error occurred. Please try again later.');
                }
            } else {
                setErrorMessage('Network error. Please try again.');
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
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Affichage du message d'erreur */}
                </form>
            </div>
        </div>
    );
};

export default JoinEventForm;
