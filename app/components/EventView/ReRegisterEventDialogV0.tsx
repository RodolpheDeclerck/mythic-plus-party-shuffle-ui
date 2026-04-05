'use client';

import { useTranslation } from 'react-i18next';
import type { Character } from '@/types/Character';
import EventRegisterForm from '../EventRegisterForm/EventRegisterForm';

type ReRegisterEventDialogV0Props = {
  open: boolean;
  eventCode: string;
  /** Incrémenter quand la modale s’ouvre pour remonter le formulaire avec les bons defaults */
  formInstanceKey: number;
  initialCharacter: Character;
  onRegisterSuccess: (data: unknown) => void;
  onCancel: () => void;
};

export function ReRegisterEventDialogV0({
  open,
  eventCode,
  formInstanceKey,
  initialCharacter,
  onRegisterSuccess,
  onCancel,
}: ReRegisterEventDialogV0Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={() => onCancel()}
        aria-label={t('eventRegister.later')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="re-register-title"
        className="relative max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 p-[1px] shadow-2xl shadow-cyan-500/20 [color-scheme:dark]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-[#0a0614]/95 p-6 backdrop-blur-md sm:p-8">
          <h2
            id="re-register-title"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            {t('eventRegister.rejoinTitle')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('eventRegister.rejoinBody')}
          </p>
          <div className="mt-6">
            <EventRegisterForm
              key={formInstanceKey}
              variant="embedded"
              eventCodeOverride={eventCode}
              formIdPrefix="re-reg"
              initialCharacter={initialCharacter}
              onRegisterSuccess={onRegisterSuccess}
              onCancel={onCancel}
              hideSignInLink
            />
          </div>
        </div>
      </div>
    </div>
  );
}
