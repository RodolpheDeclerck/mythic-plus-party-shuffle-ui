'use client';

import { useTranslation } from 'react-i18next';
import { Users, Eye, EyeOff, Trash2, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type V0GeneratedGroupsSectionProps = {
  isAdmin: boolean;
  arePartiesVisible: boolean;
  onToggleVisibility: () => void;
  onClearGroups: () => void;
  onShuffleAgain: () => void;
  children: React.ReactNode;
};

export function V0GeneratedGroupsSection({
  isAdmin,
  arePartiesVisible,
  onToggleVisibility,
  onClearGroups,
  onShuffleAgain,
  children,
}: V0GeneratedGroupsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Users className="h-5 w-5 text-cyan-400" />
          {t('eventPage.generatedGroups')}
        </h2>
        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void onToggleVisibility()}
              className={
                arePartiesVisible
                  ? 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                  : 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
              }
            >
              {arePartiesVisible ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('eventPage.v0GroupsVisible')}
                </>
              ) : (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  {t('eventPage.v0GroupsHidden')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => {
                if (window.confirm(t('eventPage.v0ConfirmClearGroups'))) {
                  onClearGroups();
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('eventPage.v0ClearGroups')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              onClick={onShuffleAgain}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              {t('eventPage.v0ShuffleAgain')}
            </Button>
          </div>
        ) : null}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">{t('eventPage.v0DragHint')}</p>

      {children}
    </div>
  );
}
