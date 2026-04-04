import React from 'react';
import { Character } from '../../../types/Character';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { getCharacterCellClass } from '../../../utils/classNameHelper';
import { v0TableWrap, v0Th } from '../eventUi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CharacterTableProps {
  characters: Character[];
  onDelete?: (id: number) => void;
  onUpdate?: (character: Character) => void;
  highlightedId?: number;
}

const CharacterTable: React.FC<CharacterTableProps> = ({
  characters,
  onDelete,
  onUpdate,
  highlightedId,
}) => {
  const { t } = useTranslation();

  return (
    <div className={v0TableWrap}>
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr>
            <th className={cn(v0Th, 'w-[8%]')}>{t('eventPage.colIndex')}</th>
            <th className={v0Th}>{t('eventPage.colName')}</th>
            <th className={v0Th}>{t('eventPage.colClass')}</th>
            <th className={v0Th}>{t('eventPage.colSpec')}</th>
            <th className={v0Th}>{t('eventPage.colIlvlKeys')}</th>
            <th className={v0Th}>{t('eventPage.colBL')}</th>
            <th className={v0Th}>{t('eventPage.colBR')}</th>
            <th className={v0Th}>{t('eventPage.colActions')}</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((character) => (
            <tr
              key={character.id}
              className={cn(
                'transition-colors hover:bg-muted/40',
                character.id === highlightedId && 'bg-primary/10',
              )}
              onClick={() => onUpdate?.(character)}
            >
              <td className={getCharacterCellClass(character.characterClass)}>
                <span className="font-semibold">{character.id}</span>
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                <span className="font-semibold">{character.name}</span>
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                <span className="font-semibold">{character.characterClass}</span>
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                <span className="font-semibold">
                  {t(`specializations.${character.specialization}`)}
                </span>
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                <span className="font-semibold">{character.iLevel}</span>
                <br />
                <span className="text-xs opacity-90">
                  ({character.keystoneMinLevel}-{character.keystoneMaxLevel})
                </span>
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                {character.bloodLust && (
                  <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} />
                )}
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                {character.battleRez && (
                  <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} />
                )}
              </td>
              <td className={getCharacterCellClass(character.characterClass)}>
                {onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      void onDelete(character.id);
                    }}
                  >
                    {t('eventPage.remove')}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CharacterTable;
