'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { loginBackgroundImageUrl } from '../config/loginBackground';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${loginBackgroundImageUrl.replace(/'/g, '%27')}')`,
        }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-[#0a0614]/60" aria-hidden />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 p-px shadow-2xl shadow-cyan-500/20">
          <div className="rounded-2xl bg-[#0a0614]/95 p-8 backdrop-blur-md sm:p-10">
            <h1 className="mb-3 text-center text-xl font-bold text-[var(--rift-text)]">
              {t('forgotPasswordPage.title')}
            </h1>
            <p className="mb-6 text-center text-sm text-gray-400">
              {t('forgotPasswordPage.body')}
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
            >
              {t('forgotPasswordPage.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
