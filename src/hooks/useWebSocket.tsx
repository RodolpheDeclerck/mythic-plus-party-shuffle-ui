import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import apiUrl from '../config/apiConfig';

const useWebSocket = (onCharacterUpdated: () => void, onPartiesShuffled: () => void): Socket | null => {
    useEffect(() => {
        const socket = io(apiUrl);

        socket.on('character-updated', onCharacterUpdated);
        socket.on('parties-shuffled', onPartiesShuffled);

        return () => {
            socket.disconnect();
        };
    }, [onCharacterUpdated, onPartiesShuffled]);

    return null; // Vous pouvez retourner le socket si vous avez besoin de l'utiliser ailleurs
};

export default useWebSocket;
