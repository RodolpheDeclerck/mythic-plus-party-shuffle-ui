import { useState } from 'react';
import { Party } from '../types/Party';

export const usePartyManagement = (eventCode: string) => {
    const [parties, setParties] = useState<Party[]>([]);
    
    return { 
        parties, 
        setParties 
    };
};
