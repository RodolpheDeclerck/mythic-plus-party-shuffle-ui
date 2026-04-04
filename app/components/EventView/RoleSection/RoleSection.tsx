import React from 'react';
import type { LucideIcon } from 'lucide-react';
import CharacterTable from '../CharacterTable/CharacterTable';
import { Character } from '../../../types/Character';
import { v0RoleCard, v0RoleCardHeader } from '../eventUi';
import { cn } from '@/lib/utils';

interface RoleSectionProps {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  characters: Character[];
  onDelete?: (id: number) => void;
  onUpdate?: (character: Character) => void;
  highlightedId?: number;
}

const RoleSection: React.FC<RoleSectionProps> = ({
  icon: Icon,
  iconClassName,
  title,
  characters,
  onDelete,
  onUpdate,
  highlightedId,
}) => {
  return (
    <div className={v0RoleCard}>
      <div className={v0RoleCardHeader}>
        <Icon className={cn('h-5 w-5 shrink-0', iconClassName)} aria-hidden />
        <h3 className="text-base font-semibold text-foreground">
          {title}{' '}
          <span className="font-normal text-muted-foreground">
            ({characters.length})
          </span>
        </h3>
      </div>
      <CharacterTable
        characters={characters}
        onDelete={onDelete}
        onUpdate={onUpdate}
        highlightedId={highlightedId}
      />
    </div>
  );
};

export default RoleSection;
