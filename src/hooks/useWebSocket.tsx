import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import apiUrl from '../config/apiConfig';

const useWebSocket = (onCharacterUpdated: () => void, onPartiesShuffled: () => void): Socket | null => {
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

        socket.on('character-updated', onCharacterUpdated);
        socket.on('parties-updated', onPartiesShuffled);

        return () => {
            socket.disconnect();
        };
    }, [onCharacterUpdated, onPartiesShuffled]);

    return null; // Vous pouvez retourner le socket si vous avez besoin de l'utiliser ailleurs
};

export default useWebSocket;
