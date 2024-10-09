import React from 'react';
import { useDrop } from 'react-dnd';

interface EmptySlotProps {
    partyIndex: number;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    currentMembersCount: number;
    isAdmin: boolean;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ partyIndex, moveCharacter, currentMembersCount, isAdmin }) => {
    const [, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex: number; fromIndex: number }) => {
            if (isAdmin) {
                console.log(`Dropping character from party ${item.fromPartyIndex}, index ${item.fromIndex}, into empty slot at party ${partyIndex}, position ${currentMembersCount}`);
                // Déplacer le personnage dans l'emplacement vide
                moveCharacter(item.fromPartyIndex, partyIndex, item.fromIndex, currentMembersCount);
            }
        },
        canDrop: () => isAdmin, // Seuls les admins peuvent déplacer des personnages
    });

    return (
        <tr ref={drop} className="empty-slot">
            <td colSpan={7}>Empty Slot - Drag here to add</td>
        </tr>
    );
};

export default EmptySlot;
