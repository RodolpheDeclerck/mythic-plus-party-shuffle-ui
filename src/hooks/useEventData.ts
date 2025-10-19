import { useState } from 'react';
import axios from 'axios';
import apiUrl from '../config/apiConfig';
import { Event } from '../types/Event';

export const useEventData = (eventCode: string) => {
    const [arePartiesVisible, setArePartiesVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    
    const checkEventExistence = async (): Promise<boolean> => {
        if (eventCode) {
            try {
                const response = await axios.get<Event>(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
                const event = response.data;
                if (event) {
                    setArePartiesVisible(event.arePartiesVisible);
                }
                return true;
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    return false;
                } else {
                    console.error('Error checking event existence:', error);
                }
            }
        }
        return false;
    };

    const fetchEvent = async () => {
        if (eventCode) {
            try {
                const response = await axios.get<Event>(`${apiUrl}/api/events?code=${eventCode}`, { withCredentials: true });
                const event = response.data;
                if (event) {
                    setArePartiesVisible(event.arePartiesVisible);
                }
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    console.error('Error fetching event:', error);
                } else {
                    console.error('Error fetching event:', error);
                }
            }
        }
    };

    const togglePartiesVisibility = async () => {
        if (!eventCode) {
            console.error('Event code is missing.');
            return;
        }

        try {
            await axios.patch(
                `${apiUrl}/api/events/${eventCode}/setPartiesVisibility`,
                { visible: !arePartiesVisible },
                { withCredentials: true }
            );

        } catch (error) {
            console.error('Failed to update parties visibility:', error);
        }
    };
    
    return { 
        arePartiesVisible, 
        setArePartiesVisible,
        isVerifying,
        setIsVerifying,
        checkEventExistence,
        fetchEvent,
        togglePartiesVisibility
    };
};
