"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function EventCodeForm() {
  const t = useTranslations("home")
  const router = useRouter()
  
  const [eventCode, setEventCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!eventCode.trim()) {
      setError(t("errors.invalidCode"))
      return
    }

    setIsLoading(true)

    // Simulate API call to validate event code
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo: accept any code with 3+ characters
    // Redirect to join page for character creation (user is not logged in)
    if (eventCode.trim().length >= 3) {
      router.push(`/event/${eventCode.trim().toUpperCase()}/join`)
    } else {
      setError(t("errors.notFound"))
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Event Code Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="eventCode"
          className="text-sm font-medium text-foreground"
        >
          {t("eventCodeLabel")}
        </label>
        <Input
          id="eventCode"
          type="text"
          placeholder={t("eventCodePlaceholder")}
          value={eventCode}
          onChange={(e) => {
            setEventCode(e.target.value.toUpperCase())
            setError("")
          }}
          disabled={isLoading}
          className="h-12 bg-[#0a0614]/80 border-purple-500/30 placeholder:text-muted-foreground focus-visible:ring-cyan-400 focus-visible:border-cyan-400/50 text-center text-xl font-mono tracking-widest uppercase"
          maxLength={10}
          autoComplete="off"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 text-center" role="alert">
          {error}
        </p>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading || !eventCode.trim()}
        className="h-12 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("joining")}
          </>
        ) : (
          t("joinEvent")
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-500/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0a0614] px-2 text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-400">
        {t("haveAccount")}{" "}
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
