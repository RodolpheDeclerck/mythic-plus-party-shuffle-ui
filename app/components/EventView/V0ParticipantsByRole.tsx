'use client';

import { useTranslation } from 'react-i18next';
import { Shield, Heart, Sword, Crosshair, Trash2 } from 'lucide-react';
import type { Character } from '@/types/Character';
import { BloodlustIcon, BattleRezIcon } from './wow-icons';
import { v0ClassNameColor } from './v0ClassColors';
import {
  ITEM_LEVEL_TIER_HIGH,
  ITEM_LEVEL_TIER_MID,
  ITEM_LEVEL_TIER_LOW,
} from '@/constants/itemLevels';

type RoleBlock = {
  key: string;
  label: string;
  icon: typeof Shield;
  iconColor: string;
  list: Character[];
};

type V0ParticipantsByRoleProps = {
  tanks: Character[];
  heals: Character[];
  melees: Character[];
  dist: Character[];
  isAuthenticated: boolean;
  onRowClick: (character: Character) => void;
  onDelete: (id: number) => void;
};

export function V0ParticipantsByRole({
  tanks,
  heals,
  melees,
  dist,
  isAuthenticated,
  onRowClick,
  onDelete,
}: V0ParticipantsByRoleProps) {
  const { t } = useTranslation();

  const roleCategories: RoleBlock[] = [
    {
      key: 'tank',
      label: t('eventPage.roleTank'),
      icon: Shield,
      iconColor: 'text-blue-400',
      list: tanks,
    },
    {
      key: 'healer',
      label: t('eventPage.roleHeal'),
      icon: Heart,
      iconColor: 'text-green-400',
      list: heals,
    },
    {
      key: 'melee',
      label: t('eventPage.roleMelee'),
      icon: Sword,
      iconColor: 'text-red-400',
      list: melees,
    },
    {
      key: 'ranged',
      label: t('eventPage.roleRanged'),
      icon: Crosshair,
      iconColor: 'text-orange-400',
      list: dist,
    },
  ];

  const ilvlColor = (ilvl: number) => {
    if (ilvl >= ITEM_LEVEL_TIER_HIGH) return 'text-purple-400';
    if (ilvl >= ITEM_LEVEL_TIER_MID) return 'text-blue-400';
    if (ilvl >= ITEM_LEVEL_TIER_LOW) return 'text-green-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid gap-6">
      {roleCategories.map(({ key, label, icon: Icon, iconColor, list }) => (
        <div
          key={key}
          className="overflow-hidden rounded-xl border border-border bg-card/50"
        >
          <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <h2 className="font-semibold text-foreground">{label}</h2>
            <span className="text-sm text-muted-foreground">({list.length})</span>
          </div>

          {list.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-border/50 text-sm text-muted-foreground">
                    <th className="w-[20%] px-4 py-2 text-left font-medium">
                      {t('eventPage.colName')}
                    </th>
                    <th className="w-[18%] px-4 py-2 text-left font-medium">
                      {t('eventPage.colClass')}
                    </th>
                    <th className="w-[18%] px-4 py-2 text-left font-medium">
                      {t('eventPage.colSpec')}
                    </th>
                    <th className="w-[12%] px-4 py-2 text-center font-medium">
                      {t('eventPage.v0IlvlShort')}
                    </th>
                    <th className="w-[12%] px-4 py-2 text-center font-medium">
                      {t('eventPage.keyRange')}
                    </th>
                    <th className="w-[10%] px-4 py-2 text-center font-medium">
                      <BloodlustIcon className="inline h-5 w-5 text-orange-400" />
                    </th>
                    <th className="w-[10%] px-4 py-2 text-center font-medium">
                      <BattleRezIcon className="inline h-5 w-5 text-green-400" />
                    </th>
                    {isAuthenticated ? <th className="w-[8%]" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {list.map((participant) => (
                    <tr
                      key={participant.id}
                      className="group cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-secondary/20"
                      onClick={() => onRowClick(participant)}
                    >
                      <td className="truncate px-4 py-2.5 font-medium">
                        {participant.name}
                      </td>
                      <td
                        className={`truncate px-4 py-2.5 ${v0ClassNameColor(participant.characterClass)}`}
                      >
                        {participant.characterClass}
                      </td>
                      <td className="truncate px-4 py-2.5 text-muted-foreground">
                        {t(`specializations.${participant.specialization}`)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={ilvlColor(participant.iLevel)}>
                          {participant.iLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-sm text-cyan-400">
                        {participant.keystoneMinLevel}-{participant.keystoneMaxLevel}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {participant.bloodLust ? (
                          <BloodlustIcon className="inline h-5 w-5 text-orange-400" />
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {participant.battleRez ? (
                          <BattleRezIcon className="inline h-5 w-5 text-green-400" />
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      {isAuthenticated ? (
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void onDelete(participant.id);
                            }}
                            className="rounded p-1 text-red-400/60 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                            title={t('eventPage.remove')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {t('eventPage.v0NoParticipantsRole')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
