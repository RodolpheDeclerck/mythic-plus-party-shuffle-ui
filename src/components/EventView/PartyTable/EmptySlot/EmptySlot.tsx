import React from 'react';
import { useDrop } from 'react-dnd';
import './EmptySlot.css';

interface EmptySlotProps {
    partyIndex: number;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    currentMembersCount: number;
    isAdmin: boolean;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ partyIndex, moveCharacter, currentMembersCount, isAdmin }) => {
    const [, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex: number; memberId: number }) => {
            if (isAdmin) {
                console.log(`Dropping character ${item.memberId} from party ${item.fromPartyIndex} into empty slot at party ${partyIndex}`);
                moveCharacter(item.fromPartyIndex, partyIndex, item.memberId, currentMembersCount);
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
