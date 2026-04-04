import React from 'react';
import { Info, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EventInProgressMessageProps {
  isVisible: boolean;
}

const EventInProgressMessage: React.FC<EventInProgressMessageProps> = ({
  isVisible,
}) => {
  const { t } = useTranslation();
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-cyan-500/35 bg-cyan-500/[0.06] p-4 shadow-sm"
      role="status"
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
          <Info className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1.5">
          <h3 className="font-semibold text-foreground">
            {t('eventPage.inProgressTitle')}
          </h3>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="h-4 w-4 shrink-0 text-cyan-500/80" aria-hidden />
            {t('eventPage.inProgressBody')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventInProgressMessage;
