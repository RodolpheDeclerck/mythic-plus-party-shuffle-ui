import React from 'react';
import { Users, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Party } from '../../../types/Party';

interface EventGroupsMessageProps {
  isVisible: boolean;
  totalParticipants: number;
  numberOfGroups: number;
  parties: Party[];
  currentPlayerId?: number;
}

const EventGroupsMessage: React.FC<EventGroupsMessageProps> = ({
  isVisible,
  totalParticipants,
  numberOfGroups,
  parties,
  currentPlayerId,
}) => {
  const { t } = useTranslation();
  if (!isVisible) {
    return null;
  }

  let playerPartyNumber: number | null = null;
  let playerPartySize = 0;

  if (currentPlayerId) {
    for (let i = 0; i < parties.length; i++) {
      const party = parties[i];
      if (party.members.some((member) => member.id === currentPlayerId)) {
        playerPartyNumber = i + 1;
        playerPartySize = party.members.length;
        break;
      }
    }
  }

  return (
    <div
      className="rounded-lg border border-emerald-500/35 bg-emerald-500/[0.06] p-4 shadow-sm"
      role="status"
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <Users className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h3 className="font-semibold text-foreground">
            {t('eventPage.groupsTitle')}
          </h3>
          <p className="flex flex-wrap items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/80" aria-hidden />
            {t('eventPage.groupsBody', {
              groups: numberOfGroups,
              participants: totalParticipants,
            })}
          </p>
          {playerPartyNumber !== null && (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-foreground">
              {t('eventPage.yourGroup', {
                n: playerPartyNumber,
                size: playerPartySize,
              })}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{t('eventPage.groupsHint')}</p>
        </div>
      </div>
    </div>
  );
};

export default EventGroupsMessage;
