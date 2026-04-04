'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { loginBackgroundImageUrl } from '../../config/loginBackground';
import EventRegisterForm from '../../components/EventRegisterForm/EventRegisterForm';

function EventRegisterPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${loginBackgroundImageUrl.replace(/'/g, '%27')}')`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#0a0614]/60" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 p-px shadow-2xl shadow-cyan-500/20">
          <div className="rounded-2xl bg-[#0a0614]/95 p-8 backdrop-blur-md sm:p-10">
            <div className="mb-6 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">
                {t('eventRegister.heroEyebrow')}
              </p>
              <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-[1.65rem]">
                <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                  {t('common.appName')}
                </span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {t('eventRegister.subtitle')}
              </p>
              {code ? (
                <p className="mt-3 font-mono text-xs tracking-wider text-cyan-300/90">
                  {t('eventRegister.codeLine', { code })}
                </p>
              ) : null}
            </div>

            <EventRegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0614] text-sm text-cyan-400/80">
          Loading…
        </div>
      }
    >
      <EventRegisterPageContent />
    </Suspense>
  );
}
