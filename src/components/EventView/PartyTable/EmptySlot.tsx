import React from 'react';
import { useDrop } from 'react-dnd';
import { Character } from '../../../types/Character';

interface EmptySlotProps {
    partyIndex: number;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    currentMembersCount: number;
    isAdmin: boolean;
    onDrop?: (partyIndex: number, position: number, character: Character) => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ partyIndex, moveCharacter, currentMembersCount, isAdmin, onDrop }) => {
    const [{ isOver }, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex?: number; memberId?: number; character?: Character }) => {
            if (isAdmin) {
                if (item.fromPartyIndex !== undefined && item.memberId !== undefined) {
                    // C'est un drag and drop entre groupes
                    moveCharacter(item.fromPartyIndex, partyIndex, item.memberId, currentMembersCount);
                } else if (item.character && onDrop) {
                    // C'est un drag and drop depuis la table des nouveaux joueurs
                    onDrop(partyIndex, currentMembersCount, item.character);
                }
            }
        },
        canDrop: () => isAdmin,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <tr ref={drop} className={`empty-slot ${isOver ? 'drag-over' : ''}`}>
            <td colSpan={8}>Empty Slot - Drag here to add</td>
        </tr>
    );
};

export default EmptySlot; 