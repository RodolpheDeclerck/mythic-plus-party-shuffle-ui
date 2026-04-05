'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import apiUrl from '@/config/apiConfig';
import useAuthCheck from '@/hooks/useAuthCheck';
import { cn } from '@/lib/utils';
import { riftVoidFill80 } from '@/lib/riftUi';

interface EventResponse {
  code: string;
}

const CreateEventPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isAuthChecked } = useAuthCheck();
  const [eventName, setEventName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthChecked && isAuthenticated === false) {
      window.location.href = '/login';
    }
  }, [isAuthChecked, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = eventName.trim();
    if (!name) return;

    setErrorMessage(null);
    setIsCreating(true);

    try {
      const response = await axios.post<EventResponse>(
        `${apiUrl}/api/events`,
        { name },
        { withCredentials: true },
      );

      const eventCode = response.data.code;
      router.push(`/event?code=${encodeURIComponent(eventCode)}`);
    } catch (error) {
      console.error('Error creating event:', error);
      setErrorMessage(t('createEvent.errorGeneric'));
      setIsCreating(false);
    }
  };

  if (!isAuthChecked || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Spinner className="h-8 w-8 text-cyan-400" />
        <p className="text-sm text-muted-foreground">
          {t('createEvent.checkingAuth')}
        </p>
      </div>
    );
  }

  const isFormValid = eventName.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMessage ? (
        <div
          id="create-event-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="event-name"
          className="text-sm font-medium text-foreground"
        >
          {t('createEvent.nameLabel')}
        </label>
        <Input
          id="event-name"
          type="text"
          name="name"
          autoComplete="off"
          placeholder={t('createEvent.namePlaceholder')}
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          disabled={isCreating}
          required
          aria-describedby={errorMessage ? 'create-event-error' : undefined}
          className={cn(
            'h-11 border-purple-500/30 placeholder:text-muted-foreground focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400',
            riftVoidFill80,
          )}
        />
      </div>

      <Button
        type="submit"
        variant="portal"
        disabled={!isFormValid || isCreating}
        className="mt-2 h-12 w-full"
      >
        {isCreating ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4 text-white" />
            {t('createEvent.creating')}
          </span>
        ) : (
          t('createEvent.submit')
        )}
      </Button>

      <div className="mt-4 border-t border-purple-500/20 pt-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-cyan-400 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rift-void)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('createEvent.backDashboard')}
        </Link>
      </div>
    </form>
  );
};

export default CreateEventPage;
