"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/auth-context"

export function LoginForm() {
  const t = useTranslations("login")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { login } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Simulated login - replace with actual auth logic
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Demo validation
    if (email !== "demo@example.com" || password !== "password") {
      setError(t("invalidCredentials"))
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    // On success, store auth and redirect to dashboard
    login(email, email.split("@")[0])
    router.push("/dashboard")
  }

  const isFormValid = email.trim() !== "" && password.trim() !== ""

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Email field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("emailLabel")}
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          className="h-11 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50"
        />
      </div>

      {/* Password field with show/hide toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            {t("passwordLabel")}
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className="h-11 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm p-1"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember me checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          className="border-purple-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
        />
        <label
          htmlFor="remember"
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          {t("rememberMe")}
        </label>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="mt-2 h-12 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4" />
            {t("signingIn")}
          </span>
        ) : (
          t("signIn")
        )}
      </Button>

      {/* Create account link */}
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm"
        >
          {t("createAccount")}
        </Link>
      </p>

      {/* Terms and Privacy links */}
      <p className="text-center text-xs text-muted-foreground/70 mt-2">
        {t("agreementText")}{" "}
        <Link
          href="/terms"
          className="text-muted-foreground hover:text-cyan-400 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
        >
          {tCommon("termsOfService")}
        </Link>{" "}
        {tCommon("and")}{" "}
        <Link
          href="/privacy"
          className="text-muted-foreground hover:text-cyan-400 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
        >
          {tCommon("privacyPolicy")}
        </Link>
      </p>

      {/* Back to event code */}
      <div className="text-center mt-4 pt-4 border-t border-purple-500/20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-cyan-400 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("joinWithCode")}
        </Link>
      </div>
    </form>
  )
}
