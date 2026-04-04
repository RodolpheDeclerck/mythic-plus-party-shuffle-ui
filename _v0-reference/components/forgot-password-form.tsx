"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch {
      setError(t("errors.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          {t("successTitle")}
        </h2>
        <p className="text-muted-foreground">
          {t("successMessage")} <span className="text-cyan-400">{email}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          {t("noEmail")}{" "}
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline focus:outline-none disabled:opacity-50"
          >
            {isLoading ? t("sending") : t("resend")}
          </button>
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Email field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("emailLabel")}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="h-11 pl-10 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50"
          />
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading || !email}
        className="h-12 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-5 w-5" />
            {t("sending")}
          </>
        ) : (
          t("sendResetLink")
        )}
      </Button>

      {/* Back to login link */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToLogin")}
        </Link>
      </div>
    </form>
  );
}
