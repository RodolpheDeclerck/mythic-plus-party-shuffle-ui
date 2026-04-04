'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import apiUrl from '../../config/apiConfig';

const JoinEventForm = () => {
  const { t } = useTranslation();
  const [eventCode, setEventCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const code = eventCode.trim();
    if (!code) {
      setErrorMessage(t('home.errorInvalidCode'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.get(
        `${apiUrl}/api/events?code=${encodeURIComponent(code)}`,
        { withCredentials: true },
      );

      if (response.status === 200) {
        window.location.href = `/event/register?code=${encodeURIComponent(code)}`;
        return;
      }
      setIsSubmitting(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setErrorMessage(t('home.errorNotFound'));
      } else if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(t('home.errorGeneric'));
      } else {
        setErrorMessage(t('home.errorNetwork'));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMessage ? (
        <div
          id="join-event-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="event-code" className="text-sm font-medium text-foreground">
          {t('home.eventCodeLabel')}
        </label>
        <Input
          id="event-code"
          type="text"
          name="eventCode"
          autoComplete="off"
          placeholder={t('home.eventCodePlaceholder')}
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value)}
          disabled={isSubmitting}
          required
          aria-describedby={errorMessage ? 'join-event-error' : undefined}
          className="h-11 border-purple-500/30 bg-[#0a0614]/80 font-mono placeholder:text-muted-foreground focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !eventCode.trim()}
        className="mt-2 h-12 w-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4 text-white" />
            {t('home.joining')}
          </span>
        ) : (
          t('home.joinEvent')
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <span className="text-muted-foreground/80">{t('home.or')}</span>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        {t('home.haveAccount')}{' '}
        <Link
          href="/login"
          className="font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
        >
          {t('home.signIn')}
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        {t('login.noAccount')}{' '}
        <Link
          href="/register"
          className="font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
        >
          {t('login.createAccount')}
        </Link>
      </p>
    </form>
  );
};

export default JoinEventForm;
