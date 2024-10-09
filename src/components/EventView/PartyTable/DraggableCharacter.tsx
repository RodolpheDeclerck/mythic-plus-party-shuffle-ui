import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableCharacterProps {
    member: any;
    partyIndex: number;
    index: number;
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    children: React.ReactNode;
    isAdmin: boolean;
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
    member, partyIndex, index, moveCharacter, swapCharacters, children, isAdmin
}) => {
    const ref = useRef<HTMLTableRowElement>(null); // Utilisation de useRef pour cibler l'élément DOM natif

    const [, drag] = useDrag({
        type: 'CHARACTER',
        item: { fromPartyIndex: partyIndex, fromIndex: index },
        canDrag: () => isAdmin, // Autoriser le drag uniquement pour l'admin
    });

    const [, drop] = useDrop({
        accept: 'CHARACTER',
        drop: (item: { fromPartyIndex: number; fromIndex: number }) => {
            if (isAdmin) {
                if (item.fromPartyIndex === partyIndex && item.fromIndex === index) {
                    return; // Ne rien faire si on drop sur le même personnage
                }
                if (item.fromPartyIndex !== partyIndex || item.fromIndex !== index) {
                    // Si on drop sur un autre personnage, échanger les personnages
                    swapCharacters(item.fromPartyIndex, partyIndex, item.fromIndex, index);
                }
            }
        },
        canDrop: () => isAdmin, // Autoriser le drop uniquement pour l'admin
    });

    drag(drop(ref)); // Associer drag et drop au ref natif

    return (
        <tr ref={ref} className="draggable-character">
            {children}
        </tr>
    );
};

export default DraggableCharacter;
