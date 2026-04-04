'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Check, Eye, EyeOff, Shuffle, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ClearButton from './ClearButton/ClearButton';
import { cn } from '@/lib/utils';

type EventPageHeaderProps = {
  eventName: string;
  eventCode: string;
  isAuthenticated: boolean;
  statsSubtitle?: string;
  partiesCount?: number;
  rosterCount?: number;
  onShuffle?: () => void;
  onClearParties?: () => void;
  onTogglePartiesVisibility?: () => void;
  arePartiesVisible?: boolean;
};

export function EventPageHeader({
  eventName,
  eventCode,
  isAuthenticated,
  statsSubtitle,
  partiesCount = 0,
  rosterCount = 0,
  onShuffle,
  onClearParties,
  onTogglePartiesVisibility,
  arePartiesVisible,
}: EventPageHeaderProps) {
  const { t } = useTranslation();
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = () => {
    void navigator.clipboard.writeText(eventCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const showPartyTools =
    isAuthenticated &&
    partiesCount > 0 &&
    onClearParties &&
    onTogglePartiesVisibility;

  return (
    <div className="flex flex-col gap-6 border-b border-border pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {isAuthenticated
              ? t('eventPage.backToDashboard')
              : t('eventPage.backHome')}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {eventName}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs text-foreground">
              {eventCode}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {rosterCount}
            </span>
          </div>
          {statsSubtitle ? (
            <p className="text-sm text-muted-foreground">{statsSubtitle}</p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="h-8 w-fit gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            aria-label={t('eventPage.copyCode')}
          >
            {codeCopied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {t('eventPage.copyCode')}
          </Button>
        </div>

        {isAuthenticated && onShuffle ? (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onShuffle}
              className={cn(
                'gap-2 bg-primary font-semibold text-primary-foreground shadow-md',
                'hover:bg-primary/90',
              )}
            >
              <Shuffle className="h-4 w-4" />
              {t('eventPage.shuffle')}
            </Button>
            {showPartyTools ? (
              <>
                <ClearButton onClear={onClearParties} scope="parties" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    void onTogglePartiesVisibility();
                  }}
                  title={
                    arePartiesVisible
                      ? t('eventPage.toggleHideGroups')
                      : t('eventPage.toggleShowGroups')
                  }
                  aria-label={
                    arePartiesVisible
                      ? t('eventPage.toggleHideGroups')
                      : t('eventPage.toggleShowGroups')
                  }
                >
                  {!arePartiesVisible ? (
                    <EyeOff className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  )}
                </Button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
