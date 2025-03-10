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
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
    member, partyIndex, index, moveCharacter, swapCharacters, children, isAdmin
}) => {
    const ref = useRef<HTMLTableRowElement>(null);

    const [, drag] = useDrag({
        type: 'CHARACTER',
        item: { 
            fromPartyIndex: partyIndex,
            memberId: member.id
        },
        canDrag: () => isAdmin,
    });

    const [, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex: number; memberId: number }) => {
            if (isAdmin) {
                if (item.fromPartyIndex === partyIndex && item.memberId === member.id) {
                    return; // Ne rien faire si on drop sur le même personnage
                }
                // Si on drop sur un autre personnage, échanger les personnages
                swapCharacters(item.fromPartyIndex, partyIndex, item.memberId, member.id);
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
