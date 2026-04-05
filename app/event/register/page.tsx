'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

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

      <div className="absolute left-4 top-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('eventRegister.backNav')}
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 p-[1px] shadow-2xl shadow-cyan-500/20">
          <div className="rounded-2xl bg-[#0a0614]/95 p-8 backdrop-blur-md">
            {code ? (
              <div className="mb-6 text-center">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  {t('eventRegister.eventCodeEyebrow')}: {code}
                </p>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                    {t('eventRegister.joinTitle')}
                  </span>
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  {t('eventRegister.joinSubtitle')}
                </p>
              </div>
            ) : (
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t('eventRegister.missingCodeTitle')}
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  {t('eventRegister.missingCodeBody')}
                </p>
              </div>
            )}

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
