import React from 'react';
import { Party } from '../../../types/Party';
import DraggableCharacter from './DraggableCharacter';
import EmptySlot from './EmptySlot/EmptySlot';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Crosshair,
  Heart,
  Shield,
  Swords,
} from 'lucide-react';
import { getCharacterCellClass } from '../../../utils/classNameHelper';
import { v0PartyCard, v0PartyCardHeader, v0TableWrap, v0Th } from '../eventUi';
import { cn } from '@/lib/utils';

interface PartyTableProps {
  parties: Party[];
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
  isAdmin: boolean;
  moveFromPendingToParty?: (
    fromPartyIndex: number,
    toPartyIndex: number,
    memberId: number,
    toIndex: number,
  ) => void;
}

const PartyTable: React.FC<PartyTableProps> = ({
  parties,
  moveCharacter,
  swapCharacters,
  isAdmin,
  moveFromPendingToParty,
}) => {
  const { t } = useTranslation();

  const findMinIlevel = (party: Party) => {
    if (party.members.length === 0) return 0;
    return Math.min(...party.members.map((member) => member.iLevel));
  };

  const findMinKeystoneLevel = (party: Party) => {
    if (party.members.length === 0) return 0;
    return Math.min(...party.members.map((member) => member.keystoneMinLevel));
  };

  const findMaxIlevel = (party: Party) => {
    if (party.members.length === 0) return 0;
    return Math.max(...party.members.map((member) => member.iLevel));
  };

  const findMaxKeystoneLevel = (party: Party) => {
    if (party.members.length === 0) return 0;
    return Math.max(...party.members.map((member) => member.keystoneMaxLevel));
  };

  const getSortedMembers = (party: Party) => {
    const rolePriority: Record<string, number> = { TANK: 1, HEAL: 2, CAC: 3, DIST: 4 };
    return [...party.members].sort((a, b) => {
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {parties.map((party, partyIndex) => (
        <div key={partyIndex} className={v0PartyCard}>
          <div className={v0PartyCardHeader}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <h3 className="truncate text-base font-semibold text-foreground">
                {t('eventPage.partyN', { n: partyIndex + 1 })}{' '}
                <span className="text-muted-foreground">
                  ({party.members.length}/5)
                </span>
              </h3>
              {party.members.length > 0 ? (
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono font-bold text-blue-300">
                    {findMinIlevel(party)}-{findMaxIlevel(party)}
                  </span>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-cyan-300">
                    +{findMinKeystoneLevel(party)}-{findMaxKeystoneLevel(party)}
                  </span>
                </div>
              ) : null}
            </div>
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
                {getSortedMembers(party).map((member) => {
                  const originalIndex = party.members.findIndex((m) => m.id === member.id);
                  return (
                    <DraggableCharacter
                      key={member.id}
                      member={member}
                      partyIndex={partyIndex}
                      index={originalIndex}
                      moveCharacter={moveCharacter}
                      swapCharacters={swapCharacters}
                      isAdmin={isAdmin}
                    >
                      <td className={getCharacterCellClass(member.characterClass)}>
                        <span className="font-bold">{originalIndex + 1}</span>
                      </td>
                      <td className={getCharacterCellClass(member.characterClass)}>
                        <span className="font-bold">{member.name}</span>
                      </td>
                      <td className={getCharacterCellClass(member.characterClass)}>
                        <span className="font-bold">{member.characterClass}</span>
                      </td>
                      <td className={getCharacterCellClass(member.characterClass)}>
                        <span className="font-bold">
                          {t(`specializations.${member.specialization}`)}
                        </span>
                      </td>
                      <td className={getCharacterCellClass(member.characterClass)}>
                        <span className="font-bold">{member.iLevel}</span>
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
                          <Check
                            className="mx-auto h-4 w-4 text-primary"
                            strokeWidth={2.5}
                          />
                        )}
                      </td>
                      <td className={getCharacterCellClass(member.characterClass)}>
                        {member.battleRez && (
                          <Check
                            className="mx-auto h-4 w-4 text-primary"
                            strokeWidth={2.5}
                          />
                        )}
                      </td>
                    </DraggableCharacter>
                  );
                })}
                {party.members.length < 5 && (
                  <EmptySlot
                    partyIndex={partyIndex}
                    moveCharacter={moveCharacter}
                    currentMembersCount={party.members.length}
                    isAdmin={isAdmin}
                    moveFromPendingToParty={moveFromPendingToParty}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartyTable;
