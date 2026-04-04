'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Plus,
  Shuffle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type V0EventHeaderProps = {
  eventName: string;
  eventCode: string;
  isAuthenticated: boolean;
  participantCount: number;
  canShuffle: boolean;
  onShuffle: () => void;
  onClearParticipants: () => void;
  onAddParticipant: () => void;
};

export function V0EventHeader({
  eventName,
  eventCode,
  isAuthenticated,
  participantCount,
  canShuffle,
  onShuffle,
  onClearParticipants,
  onAddParticipant,
}: V0EventHeaderProps) {
  const { t } = useTranslation();
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = () => {
    void navigator.clipboard.writeText(eventCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          {isAuthenticated
            ? t('eventPage.backToDashboard')
            : t('eventPage.backHome')}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{eventName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{t('eventPage.eventCode')}:</span>
            <code className="rounded bg-purple-500/20 px-2 py-0.5 font-mono text-cyan-400">
              {eventCode}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-6 w-6 p-0"
              aria-label={t('eventPage.copyCode')}
            >
              {codeCopied ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <span>
            {t('eventPage.v0TotalParticipants')}: {participantCount}
          </span>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            disabled={participantCount === 0}
            onClick={() => {
              if (window.confirm(t('eventPage.v0ConfirmClearParticipants'))) {
                onClearParticipants();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('eventPage.v0ClearParticipants')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            onClick={onAddParticipant}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('eventPage.v0AddParticipant')}
          </Button>
          <Button
            type="button"
            disabled={!canShuffle}
            onClick={onShuffle}
            className="border border-cyan-400/50 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            {t('eventPage.shuffle')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
