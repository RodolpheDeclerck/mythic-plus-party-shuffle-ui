"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BloodlustIcon, BattleRezIcon } from "@/components/wow-icons"
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

// WoW class data
const wowClasses = [
  "Death Knight", "Demon Hunter", "Druid", "Evoker", "Hunter", "Mage",
  "Monk", "Paladin", "Priest", "Rogue", "Shaman", "Warlock", "Warrior"
]

const classSpecs: Record<string, { name: string; role: "tank" | "healer" | "meleeDps" | "rangedDps" }[]> = {
  "Death Knight": [
    { name: "Blood", role: "tank" },
    { name: "Frost", role: "meleeDps" },
    { name: "Unholy", role: "meleeDps" },
  ],
  "Demon Hunter": [
    { name: "Havoc", role: "meleeDps" },
    { name: "Devourer", role: "rangedDps" },
    { name: "Vengeance", role: "tank" },
  ],
  "Druid": [
    { name: "Balance", role: "rangedDps" },
    { name: "Feral", role: "meleeDps" },
    { name: "Guardian", role: "tank" },
    { name: "Restoration", role: "healer" },
  ],
  "Evoker": [
    { name: "Augmentation", role: "rangedDps" },
    { name: "Devastation", role: "rangedDps" },
    { name: "Preservation", role: "healer" },
  ],
  "Hunter": [
    { name: "Beast Mastery", role: "rangedDps" },
    { name: "Marksmanship", role: "rangedDps" },
    { name: "Survival", role: "meleeDps" },
  ],
  "Mage": [
    { name: "Arcane", role: "rangedDps" },
    { name: "Fire", role: "rangedDps" },
    { name: "Frost", role: "rangedDps" },
  ],
  "Monk": [
    { name: "Brewmaster", role: "tank" },
    { name: "Mistweaver", role: "healer" },
    { name: "Windwalker", role: "meleeDps" },
  ],
  "Paladin": [
    { name: "Holy", role: "healer" },
    { name: "Protection", role: "tank" },
    { name: "Retribution", role: "meleeDps" },
  ],
  "Priest": [
    { name: "Discipline", role: "healer" },
    { name: "Holy", role: "healer" },
    { name: "Shadow", role: "rangedDps" },
  ],
  "Rogue": [
    { name: "Assassination", role: "meleeDps" },
    { name: "Outlaw", role: "meleeDps" },
    { name: "Subtlety", role: "meleeDps" },
  ],
  "Shaman": [
    { name: "Elemental", role: "rangedDps" },
    { name: "Enhancement", role: "meleeDps" },
    { name: "Restoration", role: "healer" },
  ],
  "Warlock": [
    { name: "Affliction", role: "rangedDps" },
    { name: "Demonology", role: "rangedDps" },
    { name: "Destruction", role: "rangedDps" },
  ],
  "Warrior": [
    { name: "Arms", role: "meleeDps" },
    { name: "Fury", role: "meleeDps" },
    { name: "Protection", role: "tank" },
  ],
}

const bloodlustClasses = ["Mage", "Shaman", "Hunter", "Evoker"]
const battleRezClasses = ["Death Knight", "Druid", "Warlock"]

const classColors: Record<string, string> = {
  "Death Knight": "text-[#C41E3A]",
  "Demon Hunter": "text-[#A330C9]",
  "Druid": "text-[#FF7C0A]",
  "Evoker": "text-[#33937F]",
  "Hunter": "text-[#AAD372]",
  "Mage": "text-[#3FC7EB]",
  "Monk": "text-[#00FF98]",
  "Paladin": "text-[#F48CBA]",
  "Priest": "text-[#FFFFFF]",
  "Rogue": "text-[#FFF468]",
  "Shaman": "text-[#0070DD]",
  "Warlock": "text-[#8788EE]",
  "Warrior": "text-[#C69B6D]",
}

export default function JoinEventPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("event")
  const tCommon = useTranslations("common")
  const eventId = params.id as string

  const [name, setName] = useState("")
  const [wowClass, setWowClass] = useState("")
  const [spec, setSpec] = useState("")
  const [ilvl, setIlvl] = useState(480)
  const [keyMin, setKeyMin] = useState(2)
  const [keyMax, setKeyMax] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const availableSpecs = wowClass ? classSpecs[wowClass] || [] : []
  const selectedSpec = availableSpecs.find(s => s.name === spec)
  const role = selectedSpec?.role || "meleeDps"
  const hasBloodlust = bloodlustClasses.includes(wowClass)
  const hasBattleRez = battleRezClasses.includes(wowClass)

  // Reset spec when class changes
  useEffect(() => {
    setSpec("")
  }, [wowClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !wowClass || !spec) return

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSuccess(true)

    // Redirect to event page after success
    setTimeout(() => {
      router.push(`/event/${eventId}`)
    }, 2000)
  }

  const canSubmit = name.trim() && wowClass && spec

  if (isSuccess) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#0a0614]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40" />

        <div className="relative text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("joinEventSuccess")}</h1>
          <p className="text-muted-foreground">Redirecting to event...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="absolute inset-0 bg-[#0a0614]/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50" />

      {/* Language Switcher now in GlobalHeader */}

      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 shadow-2xl shadow-cyan-500/20">
          <div className="rounded-2xl bg-[#0a0614]/95 backdrop-blur-md p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
                {t("eventCode")}: {eventId}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                  {t("joinEventTitle")}
                </span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {t("joinEventSubtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Character Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-muted-foreground">
                  {t("editName")}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your character name"
                  className="bg-purple-900/20 border-purple-500/30 text-foreground placeholder:text-muted-foreground/50"
                  maxLength={20}
                />
              </div>

              {/* Class & Spec */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t("editClass")}</Label>
                  <Select value={wowClass} onValueChange={setWowClass}>
                    <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-foreground">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                      {wowClasses.map((cls) => (
                        <SelectItem key={cls} value={cls} className={classColors[cls]}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t("editSpec")}</Label>
                  <Select value={spec} onValueChange={setSpec} disabled={!wowClass}>
                    <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-foreground">
                      <SelectValue placeholder="Select spec" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0a2e] border-purple-500/30">
                      {availableSpecs.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Item Level */}
              <div className="space-y-2">
                <Label htmlFor="ilvl" className="text-sm text-muted-foreground">
                  {t("editIlvl")}
                </Label>
                <Input
                  id="ilvl"
                  type="number"
                  value={ilvl}
                  onChange={(e) => setIlvl(parseInt(e.target.value) || 0)}
                  className="bg-purple-900/20 border-purple-500/30 text-foreground"
                  min={0}
                  max={999}
                />
              </div>

              {/* Key Level Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyMin" className="text-sm text-muted-foreground">
                    {t("editKeyMin")}
                  </Label>
                  <Input
                    id="keyMin"
                    type="number"
                    value={keyMin}
                    onChange={(e) => {
                      const val = Math.max(2, Math.min(30, parseInt(e.target.value) || 2))
                      setKeyMin(val)
                      if (val > keyMax) setKeyMax(val)
                    }}
                    className="bg-purple-900/20 border-purple-500/30 text-foreground"
                    min={2}
                    max={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyMax" className="text-sm text-muted-foreground">
                    {t("editKeyMax")}
                  </Label>
                  <Input
                    id="keyMax"
                    type="number"
                    value={keyMax}
                    onChange={(e) => {
                      const val = Math.max(2, Math.min(30, parseInt(e.target.value) || 30))
                      setKeyMax(val)
                      if (val < keyMin) setKeyMin(val)
                    }}
                    className="bg-purple-900/20 border-purple-500/30 text-foreground"
                    min={2}
                    max={30}
                  />
                </div>
              </div>

              {/* Preview */}
              {wowClass && spec && (
                <div className="p-4 rounded-lg bg-purple-900/30 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("editRole")}</p>
                      <p className="font-medium text-foreground capitalize">
                        {t(`roles.${role}`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <BloodlustIcon className={`w-6 h-6 ${hasBloodlust ? "text-orange-400" : "text-muted-foreground/30"}`} />
                        <span className="text-xs text-muted-foreground">{hasBloodlust ? t("yes") : t("no")}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <BattleRezIcon className={`w-6 h-6 ${hasBattleRez ? "text-green-400" : "text-muted-foreground/30"}`} />
                        <span className="text-xs text-muted-foreground">{hasBattleRez ? t("yes") : t("no")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
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

              {/* Login link */}
              <p className="text-center text-sm text-gray-400 mt-4">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
