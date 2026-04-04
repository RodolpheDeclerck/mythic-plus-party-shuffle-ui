import React from 'react';
import { Character } from '../../../types/Character';
import DraggableCharacter from '../PartyTable/DraggableCharacter';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Crosshair,
  Heart,
  Shield,
  Swords,
} from 'lucide-react';
import { getCharacterCellClass } from '../../../utils/classNameHelper';
import { v0PendingCard, v0TableWrap, v0Th } from '../eventUi';
import { cn } from '@/lib/utils';

interface PendingPlayersTableProps {
  pendingPlayers: Character[];
  moveFromPendingToParty: (
    fromPartyIndex: number,
    toPartyIndex: number,
    memberId: number,
    toIndex: number,
  ) => void;
  isAdmin: boolean;
}

const PendingPlayersTable: React.FC<PendingPlayersTableProps> = ({
  pendingPlayers,
  moveFromPendingToParty,
  isAdmin,
}) => {
  const { t } = useTranslation();

  const getSortedPendingPlayers = () => {
    const rolePriority: Record<string, number> = { TANK: 1, HEAL: 2, CAC: 3, DIST: 4 };
    return [...pendingPlayers].sort((a, b) => {
      const priorityA = rolePriority[a.role] || 5;
      const priorityB = rolePriority[b.role] || 5;
      return priorityA - priorityB;
    });
  };

  const roleIcon = (role: string) => {
    const common = 'mx-auto h-4 w-4';
    if (role === 'TANK')
      return <Shield className={cn(common, 'text-cyan-400')} strokeWidth={2} />;
    if (role === 'HEAL')
      return <Heart className={cn(common, 'text-pink-400')} strokeWidth={2} />;
    if (role === 'CAC')
      return <Swords className={cn(common, 'text-orange-400')} strokeWidth={2} />;
    if (role === 'DIST')
      return <Crosshair className={cn(common, 'text-violet-400')} strokeWidth={2} />;
    return role;
  };

  if (pendingPlayers.length === 0) {
    return null;
  }

  return (
    <div className={v0PendingCard}>
      <div className="mb-4 border-b border-amber-500/25 pb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t('eventPage.pendingPlayers')}{' '}
          <span className="text-muted-foreground">({pendingPlayers.length})</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('eventPage.pendingSubtitle')}
        </p>
      </div>
      <div className={v0TableWrap}>
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={v0Th}>{t('eventPage.colIndex')}</th>
              <th className={v0Th}>{t('eventPage.colName')}</th>
              <th className={v0Th}>{t('eventPage.colClass')}</th>
              <th className={v0Th}>{t('eventPage.colSpec')}</th>
              <th className={cn(v0Th, 'min-w-[7rem]')}>
                {t('eventPage.colIlvlKeys')}
              </th>
              <th className={v0Th}>{t('eventPage.colRole')}</th>
              <th className={v0Th}>{t('eventPage.colBL')}</th>
              <th className={v0Th}>{t('eventPage.colBR')}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedPendingPlayers().map((member, index) => (
              <DraggableCharacter
                key={member.id}
                member={member}
                partyIndex={-1}
                index={index}
                moveCharacter={() => {}}
                swapCharacters={() => {}}
                isAdmin={isAdmin}
                sourceType="pending"
                moveFromPendingToParty={moveFromPendingToParty}
              >
                <td className={getCharacterCellClass(member.characterClass)}>
                  <span className="font-semibold">{index + 1}</span>
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  <span className="font-semibold">{member.name}</span>
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  <span className="font-semibold">{member.characterClass}</span>
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  <span className="font-semibold">
                    {t(`specializations.${member.specialization}`)}
                  </span>
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  <span className="font-semibold">{member.iLevel}</span>
                  <br />
                  <span className="text-xs opacity-90">
                    ({member.keystoneMinLevel}-{member.keystoneMaxLevel})
                  </span>
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  {roleIcon(member.role)}
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  {member.bloodLust && (
                    <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} />
                  )}
                </td>
                <td className={getCharacterCellClass(member.characterClass)}>
                  {member.battleRez && (
                    <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} />
                  )}
                </td>
              </DraggableCharacter>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingPlayersTable;
