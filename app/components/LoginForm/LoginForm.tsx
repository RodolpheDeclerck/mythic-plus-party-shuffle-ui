'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios, { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import apiUrl from '../../config/apiConfig';

interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: { id?: number; email?: string; username?: string };
  message?: string;
}

function parseLoginBody(raw: unknown): LoginResponse | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }
  if (typeof raw === 'object') return raw as LoginResponse;
  return null;
}

function messageFromAxiosError(err: unknown): string | null {
  if (!isAxiosError(err) || err.response?.data == null) return null;
  const d = err.response.data as Record<string, unknown>;
  if (typeof d.message === 'string') return d.message;
  if (Array.isArray(d.message)) return (d.message as string[]).join(', ');
  if (Array.isArray(d.errors)) return (d.errors as string[]).join(', ');
  return null;
}

const LoginForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    axios
      .post<LoginResponse>(
        `${apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .then((response) => {
        if (response.status !== 200) {
          setIsSubmitting(false);
          return;
        }

        const data = parseLoginBody(response.data);
        const token =
          data?.token && typeof data.token === 'string'
            ? data.token
            : data?.accessToken && typeof data.accessToken === 'string'
              ? data.accessToken
              : null;

        if (token) {
          localStorage.setItem('authToken', token);
        } else if (data?.user && (data.user.email || data.user.id != null)) {
          // Older API: JWT only in httpOnly cookie. Session must work via /api/be + Cookie on shared parent domain.
          localStorage.removeItem('authToken');
        } else {
          // eslint-disable-next-line no-console
          console.error('Login 200 but unusable body — redeploy API with token in JSON or fix cookie DOMAIN:', response.data);
          setErrorMessage(t('login.errorMissingToken'));
          setIsSubmitting(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem('loginRememberMe', '1');
        } else {
          localStorage.removeItem('loginRememberMe');
        }

        let redirectUrl =
          localStorage.getItem('redirectAfterLogin') || '/dashboard';

        if (!redirectUrl || redirectUrl === '/' || redirectUrl === '/login') {
          redirectUrl = '/dashboard';
        }

        localStorage.removeItem('redirectAfterLogin');

        setIsSubmitting(false);
        setTimeout(() => {
          window.location.replace(redirectUrl);
        }, 500);
      })
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Login request failed', err);
        const serverMsg = messageFromAxiosError(err);
        setErrorMessage(
          serverMsg ?? t('login.errorInvalidCredentials'),
        );
        setIsSubmitting(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMessage ? (
        <div
          id="login-form-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t('login.email')}
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          aria-describedby={errorMessage ? 'login-form-error' : undefined}
          className="h-11 border-purple-500/30 bg-[#0a0614]/80 placeholder:text-muted-foreground focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            {t('login.password')}
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
            className="h-11 border-purple-500/30 bg-[#0a0614]/80 pr-11 placeholder:text-muted-foreground focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
            aria-label={
              showPassword ? t('login.hidePassword') : t('login.showPassword')
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          className="border-purple-500/50 data-[state=checked]:border-cyan-500 data-[state=checked]:bg-cyan-500"
        />
        <label
          htmlFor="remember"
          className="cursor-pointer select-none text-sm text-muted-foreground"
        >
          {t('login.rememberMe')}
        </label>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="mt-2 h-12 w-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4 text-white" />
            {t('login.signingIn')}
          </span>
        ) : (
          t('login.signIn')
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('login.noAccount')}{' '}
        <Link
          href="/register"
          className="font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
        >
          {t('login.createAccount')}
        </Link>
      </p>

      <p className="mt-2 text-center text-xs text-muted-foreground/70">
        {t('login.agreementText')}{' '}
        <Link
          href="/terms"
          className="text-muted-foreground underline-offset-4 hover:text-cyan-400 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {t('common.termsOfService')}
        </Link>{' '}
        {t('common.and')}{' '}
        <Link
          href="/privacy"
          className="text-muted-foreground underline-offset-4 hover:text-cyan-400 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {t('common.privacyPolicy')}
        </Link>
      </p>

      <div className="mt-4 border-t border-purple-500/20 pt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-cyan-400 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('login.joinWithCode')}
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
