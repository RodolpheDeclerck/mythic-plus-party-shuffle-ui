"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import axios from "axios"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { apiUrl } from "@/config/apiConfig"

// Password strength calculation
function usePasswordStrength(password: string, t: ReturnType<typeof useTranslations<"register">>) {
  return useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 1) return { score, label: t("passwordStrength.weak"), color: "bg-red-500" }
    if (score <= 2) return { score, label: t("passwordStrength.fair"), color: "bg-orange-500" }
    if (score <= 3) return { score, label: t("passwordStrength.good"), color: "bg-yellow-500" }
    if (score <= 4) return { score, label: t("passwordStrength.strong"), color: "bg-cyan-500" }
    return { score, label: t("passwordStrength.veryStrong"), color: "bg-green-500" }
  }, [password, t])
}

// Password requirements check
function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  }
}

export function RegisterForm() {
  const t = useTranslations("register")
  const tCommon = useTranslations("common")
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email validation
  const isEmailValid = useMemo(() => {
    if (!email) return true // Don't show error when empty
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [email])

  // Password strength and requirements
  const passwordStrength = usePasswordStrength(password, t)
  const passwordRequirements = useMemo(() => checkPasswordRequirements(password), [password])

  // Password match check
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate before submit
    if (!isEmailValid) {
      setError(t("errors.invalidEmail"))
      return
    }
    if (!passwordRequirements.minLength) {
      setError(t("errors.passwordTooShort"))
      return
    }
    if (!passwordsMatch) {
      setError(t("errors.passwordsDoNotMatch"))
      return
    }
    if (!acceptTerms) {
      setError(t("errors.mustAcceptTerms"))
      return
    }

    setIsLoading(true)

    try {
      await axios.post(`${apiUrl}/auth/register`, {
        email,
        password,
        username,
      })
      router.replace("/")
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t("errors.registrationFailed"))
      }
      setIsLoading(false)
    }
  }

  const isFormValid =
    email.trim() !== "" &&
    isEmailValid &&
    username.trim() !== "" &&
    password.trim() !== "" &&
    passwordRequirements.minLength &&
    passwordsMatch &&
    confirmPassword.trim() !== "" &&
    acceptTerms

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Email */}
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
          aria-invalid={!isEmailValid}
          className={`h-11 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50 ${
            email && !isEmailValid ? "border-red-500/50" : ""
          }`}
        />
        {email && !isEmailValid && (
          <p className="text-xs text-red-400">{t("emailInvalid")}</p>
        )}
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium text-foreground">
          {t("usernameLabel")}
        </label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder={t("usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          required
          className="h-11 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm p-1"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${passwordStrength.color.replace("bg-", "text-")}`}>
                {passwordStrength.label}
              </span>
            </div>

            {/* Password Requirements */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <li className={`flex items-center gap-1 ${passwordRequirements.minLength ? "text-cyan-400" : "text-muted-foreground"}`}>
                {passwordRequirements.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {t("passwordRequirements.minLength")}
              </li>
              <li className={`flex items-center gap-1 ${passwordRequirements.hasUppercase ? "text-cyan-400" : "text-muted-foreground"}`}>
                {passwordRequirements.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {t("passwordRequirements.uppercase")}
              </li>
              <li className={`flex items-center gap-1 ${passwordRequirements.hasLowercase ? "text-cyan-400" : "text-muted-foreground"}`}>
                {passwordRequirements.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {t("passwordRequirements.lowercase")}
              </li>
              <li className={`flex items-center gap-1 ${passwordRequirements.hasNumber ? "text-cyan-400" : "text-muted-foreground"}`}>
                {passwordRequirements.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {t("passwordRequirements.number")}
              </li>
              <li className={`flex items-center gap-1 ${passwordRequirements.hasSpecial ? "text-cyan-400" : "text-muted-foreground"}`}>
                {passwordRequirements.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {t("passwordRequirements.specialChar")}
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={confirmPassword !== "" && !passwordsMatch}
            className={`h-11 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50 pr-11 ${
              confirmPassword && !passwordsMatch ? "border-red-500/50" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm p-1"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-400">{t("passwordsDoNotMatch")}</p>
        )}
        {confirmPassword && passwordsMatch && password && (
          <p className="text-xs text-cyan-400 flex items-center gap-1">
            <Check className="h-3 w-3" /> {t("passwordsMatch")}
          </p>
        )}
      </div>

      {/* Accept Terms Checkbox */}
      <div className="flex items-start gap-3 mt-1">
        <Checkbox
          id="acceptTerms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked === true)}
          disabled={isLoading}
          className="mt-0.5 border-purple-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
        />
        <label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-tight">
          {t("acceptTerms")}{" "}
          <Link
            href="/terms"
            className="text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
          >
            {tCommon("termsOfService")}
          </Link>{" "}
          {tCommon("and")}{" "}
          <Link
            href="/privacy"
            className="text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
          >
            {tCommon("privacyPolicy")}
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="mt-2 h-12 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4" />
            {t("creatingAccount")}
          </span>
        ) : (
          t("createAccount")
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614] rounded-sm"
        >
          {t("signIn")}
        </Link>
      </p>
    </form>
  )
}
