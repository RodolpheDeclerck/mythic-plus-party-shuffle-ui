import React from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';

interface EmptySlotProps {
  partyIndex: number;
  moveCharacter: (
    fromPartyIndex: number,
    toPartyIndex: number,
    memberId: number,
    toIndex: number,
  ) => void;
  currentMembersCount: number;
  isAdmin: boolean;
  moveFromPendingToParty?: (
    fromPartyIndex: number,
    toPartyIndex: number,
    memberId: number,
    toIndex: number,
  ) => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({
  partyIndex,
  moveCharacter,
  currentMembersCount,
  isAdmin,
  moveFromPendingToParty,
}) => {
  const { t } = useTranslation();
  const [, drop] = useDrop({
    accept: 'CHARACTER',
    drop: (item: {
      fromPartyIndex: number;
      memberId: number;
      sourceType?: string;
      member?: unknown;
    }) => {
      if (!isAdmin) return;
      if (item.sourceType === 'pending' && moveFromPendingToParty) {
        moveFromPendingToParty(item.fromPartyIndex, partyIndex, item.memberId, currentMembersCount);
      } else {
        moveCharacter(item.fromPartyIndex, partyIndex, item.memberId, currentMembersCount);
      }
    },
    canDrop: () => isAdmin,
  });

  return (
    <tr ref={drop as unknown as React.Ref<HTMLTableRowElement>}>
      <td
        colSpan={8}
        className="border-b border-dashed border-primary/35 bg-muted/30 px-3 py-4 text-center text-sm text-muted-foreground"
      >
        {t('eventPage.emptySlot')}
      </td>
    </tr>
  );
};

export default EmptySlot;
