'use client';

import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

interface DraggableCharacterProps {
  member: { id: number };
  partyIndex: number;
  index: number;
  moveCharacter: (
    fromPartyIndex: number,
    toPartyIndex: number,
    memberId: number,
    toIndex: number,
  ) => void;
  swapCharacters: (
    fromPartyIndex: number,
    toPartyIndex: number,
    sourceId: number,
    targetId: number,
  ) => void;
  children: React.ReactNode;
  isAdmin: boolean;
  sourceType?: 'party' | 'pending';
  moveFromPendingToParty?: (
    fromPartyIndex: number,
    toPartyIndex: number,
    memberId: number,
    toIndex: number,
  ) => void;
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
  member,
  partyIndex,
  index,
  moveCharacter,
  swapCharacters,
  children,
  isAdmin,
  sourceType = 'party',
  moveFromPendingToParty,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'CHARACTER',
    item: {
      fromPartyIndex: partyIndex,
      memberId: member.id,
      sourceType,
      member: sourceType === 'pending' ? member : undefined,
    },
    canDrag: () => isAdmin,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (!isDragging) return;

    let intervalId: NodeJS.Timeout;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseY = e.clientY;
    };

    const autoScroll = () => {
      const scrollZone = 150;
      const maxSpeed = 25;
      const windowHeight = window.innerHeight;
      let scrollAmount = 0;

      if (mouseY < scrollZone) {
        const ratio = 1 - mouseY / scrollZone;
        scrollAmount = -Math.ceil(ratio * maxSpeed);
      } else if (mouseY > windowHeight - scrollZone) {
        const ratio = (mouseY - (windowHeight - scrollZone)) / scrollZone;
        scrollAmount = Math.ceil(ratio * maxSpeed);
      }

      if (scrollAmount !== 0) {
        window.scrollBy(0, scrollAmount);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    intervalId = setInterval(autoScroll, 16);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(intervalId);
    };
  }, [isDragging]);

  const [, drop] = useDrop({
    accept: 'CHARACTER',
    drop: (item: {
      fromPartyIndex: number;
      memberId: number;
      sourceType?: string;
      member?: unknown;
    }) => {
      if (!isAdmin) return;
      if (item.fromPartyIndex === partyIndex && item.memberId === member.id) {
        return;
      }

      if (item.sourceType === 'pending' && item.member && moveFromPendingToParty) {
        moveFromPendingToParty(item.fromPartyIndex, partyIndex, item.memberId, index);
      } else if (item.sourceType !== 'pending') {
        swapCharacters(item.fromPartyIndex, partyIndex, item.memberId, member.id);
      }
    },
    canDrop: () => isAdmin,
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border/60 transition-colors hover:bg-muted/40',
        isDragging && 'opacity-40',
        isAdmin && 'cursor-grab active:cursor-grabbing',
      )}
    >
      {children}
    </tr>
  );
};

export default DraggableCharacter;
