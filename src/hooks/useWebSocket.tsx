import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import apiUrl from '../config/apiConfig';

const useWebSocket = (onCharacterUpdated: () => void,
    onPartiesShuffled: () => void,
    onEventsUpdated: () => void  = () => {}): Socket | null => {
    
    // Use refs to store the latest callbacks without causing reconnections
    const onCharacterUpdatedRef = useRef(onCharacterUpdated);
    const onPartiesShuffledRef = useRef(onPartiesShuffled);
    const onEventsUpdatedRef = useRef(onEventsUpdated);

    // Update refs when callbacks change
    useEffect(() => {
        onCharacterUpdatedRef.current = onCharacterUpdated;
    }, [onCharacterUpdated]);

    useEffect(() => {
        onPartiesShuffledRef.current = onPartiesShuffled;
    }, [onPartiesShuffled]);

    useEffect(() => {
        onEventsUpdatedRef.current = onEventsUpdated;
    }, [onEventsUpdated]);

    useEffect(() => {
        const socket = io(apiUrl, {
            transports: ['websocket'], // Force WebSocket transport
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

        // Use refs to avoid dependency issues
        const handleCharacterUpdated = () => {
            console.log('WebSocket: character-updated event received');
            onCharacterUpdatedRef.current();
        };
        
        const handlePartiesShuffled = () => {
            console.log('WebSocket: parties-updated event received');
            onPartiesShuffledRef.current();
        };
        
        const handleEventsUpdated = () => {
            console.log('WebSocket: event-updated event received');
            onEventsUpdatedRef.current();
        };

        socket.on('character-updated', handleCharacterUpdated);
        socket.on('parties-updated', handlePartiesShuffled);
        socket.on('event-updated', handleEventsUpdated);

        return () => {
            socket.disconnect();
        };
    }, []); // Empty dependency array to prevent reconnections

    return null; // You can return the socket if you need to use it elsewhere
};

export default useWebSocket;
