"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Globe } from "lucide-react"
import { setLocaleCookie } from "@/lib/locale"
import type { Locale } from "@/i18n/config"

export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher")
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  const handleChange = (newLocale: Locale) => {
    startTransition(async () => {
      await setLocaleCookie(newLocale)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        disabled={isPending}
        className="bg-transparent text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded cursor-pointer disabled:opacity-50"
        aria-label={t("label")}
      >
        <option value="en" className="bg-[#0a0614] text-foreground">
          {t("en")}
        </option>
        <option value="fr" className="bg-[#0a0614] text-foreground">
          {t("fr")}
        </option>
      </select>
    </div>
  )
}
