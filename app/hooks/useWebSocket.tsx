import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '../config/apiConfig';

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
        let isMounted = true;
        const socket = io(getSocketUrl(), {
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            if (isMounted) {
                console.log('WebSocket connected');
            }
        });

        socket.on('connect_error', (error) => {
            if (isMounted) {
                console.warn('WebSocket connection error (will retry):', error.message);
            }
            // Don't throw error, just log it - the app should work without WebSocket
        });

        socket.on('disconnect', (reason) => {
            if (isMounted) {
                console.warn('WebSocket disconnected:', reason);
            }
        });

        // Use refs to avoid dependency issues
        const handleCharacterUpdated = () => {
            if (isMounted) {
                console.log('WebSocket: character-updated event received');
                onCharacterUpdatedRef.current();
            }
        };
        
        const handlePartiesShuffled = () => {
            if (isMounted) {
                console.log('WebSocket: parties-updated event received');
                onPartiesShuffledRef.current();
            }
        };
        
        const handleEventsUpdated = () => {
            if (isMounted) {
                console.log('WebSocket: event-updated event received');
                onEventsUpdatedRef.current();
            }
        };

        socket.on('character-updated', handleCharacterUpdated);
        socket.on('parties-updated', handlePartiesShuffled);
        socket.on('event-updated', handleEventsUpdated);

        return () => {
            isMounted = false;
            
            // Remove all event listeners first to prevent warnings
            socket.removeAllListeners();
            
            // Only disconnect if connected to avoid warnings in StrictMode
            // In StrictMode, the component may unmount before connection is established
            // Socket.io will handle cleanup automatically if not connected
            if (socket.connected) {
                socket.disconnect();
            }
            // If not connected, don't call disconnect() - this prevents the browser warning
            // Socket.io will clean up the connection attempt automatically
        };
    }, []); // Empty dependency array to prevent reconnections

    return null; // You can return the socket if you need to use it elsewhere
};

export default useWebSocket;
