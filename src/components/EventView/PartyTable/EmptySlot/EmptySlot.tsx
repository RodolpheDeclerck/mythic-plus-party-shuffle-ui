import React from 'react';
import { useDrop } from 'react-dnd';
import './EmptySlot.css';

interface EmptySlotProps {
    partyIndex: number;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    currentMembersCount: number;
    isAdmin: boolean;
    moveFromPendingToParty?: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ partyIndex, moveCharacter, currentMembersCount, isAdmin, moveFromPendingToParty }) => {
    const [, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex: number; memberId: number; sourceType?: string; member?: any }) => {
            if (isAdmin) {
                console.log(`Dropping character ${item.memberId} from ${item.sourceType === 'pending' ? 'pending players' : `party ${item.fromPartyIndex}`} into empty slot at party ${partyIndex}`);
                
                // If dropping from pending players
                if (item.sourceType === 'pending' && moveFromPendingToParty) {
                    moveFromPendingToParty(item.fromPartyIndex, partyIndex, item.memberId, currentMembersCount);
                } else {
                    // Normal party-to-party move
                    moveCharacter(item.fromPartyIndex, partyIndex, item.memberId, currentMembersCount);
                }
            }
        },
        canDrop: () => isAdmin,
    });

    return (
        <tr ref={drop} className="empty-slot">
            <td colSpan={8}>Empty Slot - Drag here to add</td>
        </tr>
    );
};

export default EmptySlot;
