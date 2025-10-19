import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import apiUrl from '../config/apiConfig';

const useWebSocket = (onCharacterUpdated: () => void,
    onPartiesShuffled: () => void,
    onEventsUpdated: () => void  = () => {}): Socket | null => {
    useEffect(() => {
        const socket = io(apiUrl, {
            transports: ['websocket'], // Forcer le transport WebSocket
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.warn('WebSocket disconnected:', reason);
        });

        // Store callbacks in refs to avoid dependency issues
        const handleCharacterUpdated = () => {
            console.log('WebSocket: character-updated event received');
            onCharacterUpdated();
        };
        
        const handlePartiesShuffled = () => {
            console.log('WebSocket: parties-updated event received');
            onPartiesShuffled();
        };
        
        const handleEventsUpdated = () => {
            console.log('WebSocket: event-updated event received');
            onEventsUpdated();
        };

        socket.on('character-updated', handleCharacterUpdated);
        socket.on('parties-updated', handlePartiesShuffled);
        socket.on('event-updated', handleEventsUpdated);

        return () => {
            socket.disconnect();
        };
    }, []); // Empty dependency array to prevent reconnections

    return null; // Vous pouvez retourner le socket si vous avez besoin de l'utiliser ailleurs
};

export default useWebSocket;
