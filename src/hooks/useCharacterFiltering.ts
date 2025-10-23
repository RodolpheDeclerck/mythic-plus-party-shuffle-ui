import { useMemo } from 'react';
import { Character } from '../types/Character';
import { Party } from '../types/Party';

export const useCharacterFiltering = (characters: Character[], parties: Party[]) => {
    const filteredCharacters = useMemo(() => {
        // Filter characters by role
        const tanks = characters.filter((character) => character.role === 'TANK');
        const heals = characters.filter((character) => character.role === 'HEAL');
        const melees = characters.filter((character) => character.role === 'CAC');
        const dist = characters.filter((character) => character.role === 'DIST');
        
        // Filter pending players (in waiting room but not in any party)
        const pendingPlayers = characters.filter(character => 
            !parties.some(party => 
                party.members.some(member => member.id === character.id)
            )
        );
        
        return {
            tanks,
            heals,
            melees,
            dist,
            pendingPlayers
        };
    }, [characters, parties]);
    
    return filteredCharacters;
};
