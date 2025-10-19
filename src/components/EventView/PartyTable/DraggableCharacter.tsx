import React, { useRef, useEffect } from 'react';
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

    const [{ isDragging }, drag] = useDrag({
        type: 'CHARACTER',
        item: { 
            fromPartyIndex: partyIndex,
            memberId: member.id,
            sourceType: sourceType,
            member: sourceType === 'pending' ? member : undefined // Pass full member if from pending
        },
        canDrag: () => isAdmin,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    // Auto-scroll effect during drag
    useEffect(() => {
        if (!isDragging) return;

        let intervalId: NodeJS.Timeout;
        let mouseY = window.innerHeight / 2; // Default to center

        const handleMouseMove = (e: MouseEvent) => {
            mouseY = e.clientY;
        };

        const autoScroll = () => {
            const scrollZone = 150; // 150px from edges (more sensitive)
            const maxSpeed = 25; // Faster scroll speed
            const windowHeight = window.innerHeight;
            
            let scrollAmount = 0;
            
            // Scroll up if mouse is near top
            if (mouseY < scrollZone) {
                const ratio = 1 - (mouseY / scrollZone);
                scrollAmount = -Math.ceil(ratio * maxSpeed);
            }
            // Scroll down if mouse is near bottom
            else if (mouseY > windowHeight - scrollZone) {
                const ratio = (mouseY - (windowHeight - scrollZone)) / scrollZone;
                scrollAmount = Math.ceil(ratio * maxSpeed);
            }
            
            if (scrollAmount !== 0) {
                window.scrollBy(0, scrollAmount);
            }
        };

        // Add event listener for mouse movement
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        intervalId = setInterval(autoScroll, 16); // ~60fps

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            clearInterval(intervalId);
        };
    }, [isDragging]);

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
