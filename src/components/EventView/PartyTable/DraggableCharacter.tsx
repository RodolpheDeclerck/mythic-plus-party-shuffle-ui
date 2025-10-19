import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableCharacterProps {
    member: any;
    partyIndex: number;
    index: number;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, sourceId: number, targetId: number) => void;
    children: React.ReactNode;
    isAdmin: boolean;
    sourceType?: 'party' | 'pending'; // Optional: default is 'party'
    moveFromPendingToParty?: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void; // Optional function for pending players
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
    member, partyIndex, index, moveCharacter, swapCharacters, children, isAdmin, sourceType = 'party', moveFromPendingToParty
}) => {
    const ref = useRef<HTMLTableRowElement>(null);

    const [, drag] = useDrag({
        type: 'CHARACTER',
        item: { 
            fromPartyIndex: partyIndex,
            memberId: member.id,
            sourceType: sourceType,
            member: sourceType === 'pending' ? member : undefined // Pass full member if from pending
        },
        canDrag: () => isAdmin,
    });

    const [, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex: number; memberId: number; sourceType?: string; member?: any }) => {
            if (isAdmin) {
                if (item.fromPartyIndex === partyIndex && item.memberId === member.id) {
                    return; // Do nothing if dropping on the same character
                }
                
                // If dropping from pending players
                if (item.sourceType === 'pending' && item.member && moveFromPendingToParty) {
                    // Move from pending to this party position (insert at current position)
                    moveFromPendingToParty(item.fromPartyIndex, partyIndex, item.memberId, index);
                } else {
                    // Normal party-to-party swap (only if both are from parties)
                    if (item.sourceType !== 'pending') {
                        swapCharacters(item.fromPartyIndex, partyIndex, item.memberId, member.id);
                    }
                }
            }
        },
        canDrop: () => isAdmin,
    });

    drag(drop(ref));

    return (
        <tr ref={ref} className="draggable-character">
            {children}
        </tr>
    );
};

export default DraggableCharacter;
