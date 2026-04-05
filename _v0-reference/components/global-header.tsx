"use client"

import { useTranslations } from "next-intl"
import { LogOut, User, LogIn, Home } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function GlobalHeader() {
  const t = useTranslations("common")
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <>
      {/* Home button - top left */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10"
        >
          <Link href={isAuthenticated ? "/dashboard" : "/"}>
            <Home className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Auth and language - top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      <LanguageSwitcher />
      {isAuthenticated && user ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-purple-900/30 border border-purple-500/20 rounded-lg px-3 py-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{user.name}</span>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            {t("logout")}
          </Button>
        </div>
      ) : (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
        >
          <Link href="/login">
            <LogIn className="w-4 h-4 mr-1.5" />
            {t("login")}
          </Link>
        </Button>
      )}
      </div>
    </>
  )
}
