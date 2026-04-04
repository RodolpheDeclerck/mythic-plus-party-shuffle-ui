import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterFormFieldProps {
  label: string;
  value?: string | number;
  isEditing: boolean;
  children?: React.ReactNode;
}

const CharacterFormField: React.FC<CharacterFormFieldProps> = ({
  label,
  value,
  isEditing,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-purple-500/25 bg-purple-950/35 px-3 py-2 text-sm text-foreground',
        isEditing && 'min-h-[2.75rem] min-w-[140px]',
      )}
    >
      <span className="shrink-0 font-semibold text-muted-foreground">{label}</span>
      {isEditing ? (
        <div className="min-w-0 flex-1">{children}</div>
      ) : (
        <span className="font-medium">{value ?? '—'}</span>
      )}
    </div>
  );
};

export default CharacterFormField;
