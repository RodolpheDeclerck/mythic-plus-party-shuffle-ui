import React from 'react';
import { Crosshair, Heart, Shield, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RoleSection from '../RoleSection/RoleSection';
import { Character } from '../../../types/Character';
import ClearButton from '../ClearButton/ClearButton';
import { v0SectionTitle } from '../eventUi';
import { cn } from '@/lib/utils';

interface WaitingRoomProps {
  characters: Character[];
  tanks: Character[];
  heals: Character[];
  melees: Character[];
  dist: Character[];
  isAuthenticated: boolean;
  onClear: (characters: Character[]) => void;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (character: Character) => void;
  highlightedId: number | undefined;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  characters,
  tanks,
  heals,
  melees,
  dist,
  isAuthenticated,
  onClear,
  onDelete,
  onUpdate,
  highlightedId,
}) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={cn(v0SectionTitle)}>{t('eventPage.participantsByRole')}</h2>
        {isAuthenticated && (
          <ClearButton scope="waiting" onClear={() => onClear(characters)} />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {t('eventPage.waitingRoomLine', { count: characters.length })}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <RoleSection
          icon={Shield}
          iconClassName="text-cyan-400"
          title={t('eventPage.roleTank')}
          characters={tanks}
          onDelete={isAuthenticated ? onDelete : undefined}
          onUpdate={isAuthenticated ? onUpdate : undefined}
          highlightedId={highlightedId}
        />
        <RoleSection
          icon={Heart}
          iconClassName="text-pink-400"
          title={t('eventPage.roleHeal')}
          characters={heals}
          onDelete={isAuthenticated ? onDelete : undefined}
          onUpdate={isAuthenticated ? onUpdate : undefined}
          highlightedId={highlightedId}
        />
        <RoleSection
          icon={Swords}
          iconClassName="text-orange-400"
          title={t('eventPage.roleMelee')}
          characters={melees}
          onDelete={isAuthenticated ? onDelete : undefined}
          onUpdate={isAuthenticated ? onUpdate : undefined}
          highlightedId={highlightedId}
        />
        <RoleSection
          icon={Crosshair}
          iconClassName="text-violet-400"
          title={t('eventPage.roleRanged')}
          characters={dist}
          onDelete={isAuthenticated ? onDelete : undefined}
          onUpdate={isAuthenticated ? onUpdate : undefined}
          highlightedId={highlightedId}
        />
      </div>
    </section>
  );
};

export default WaitingRoom;
