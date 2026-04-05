"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BloodlustIcon, BattleRezIcon } from "@/components/wow-icons"
import { Shield, Heart, Sword, Crosshair } from "lucide-react"

interface Participant {
  id: string
  name: string
  class: string
  spec: string
  role: "tank" | "healer" | "meleeDps" | "rangedDps"
  ilvl: number
  hasBloodlust: boolean
  hasBattleRez: boolean
  keyMin: number
  keyMax: number
}

interface JoinEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJoin: (participant: Participant) => void
  existingParticipant?: Participant
}

const wowClasses = [
  "Death Knight", "Demon Hunter", "Druid", "Evoker", "Hunter",
  "Mage", "Monk", "Paladin", "Priest", "Rogue", "Shaman", "Warlock", "Warrior",
]

const specsByClass: Record<string, string[]> = {
  "Death Knight": ["Blood", "Frost", "Unholy"],
  "Demon Hunter": ["Havoc", "Vengeance"],
  "Druid": ["Balance", "Feral", "Guardian", "Restoration"],
  "Evoker": ["Devastation", "Preservation", "Augmentation"],
  "Hunter": ["Beast Mastery", "Marksmanship", "Survival"],
  "Mage": ["Arcane", "Fire", "Frost"],
  "Monk": ["Brewmaster", "Mistweaver", "Windwalker"],
  "Paladin": ["Holy", "Protection", "Retribution"],
  "Priest": ["Discipline", "Holy", "Shadow"],
  "Rogue": ["Assassination", "Outlaw", "Subtlety"],
  "Shaman": ["Elemental", "Enhancement", "Restoration"],
  "Warlock": ["Affliction", "Demonology", "Destruction"],
  "Warrior": ["Arms", "Fury", "Protection"],
}

const bloodlustClasses = ["Shaman", "Mage", "Hunter", "Evoker"]
const battleRezClasses = ["Death Knight", "Druid", "Warlock", "Paladin"]

const specRoles: Record<string, Record<string, "tank" | "healer" | "meleeDps" | "rangedDps">> = {
  "Death Knight": { "Blood": "tank", "Frost": "meleeDps", "Unholy": "meleeDps" },
  "Demon Hunter": { "Havoc": "meleeDps", "Vengeance": "tank" },
  "Druid": { "Balance": "rangedDps", "Feral": "meleeDps", "Guardian": "tank", "Restoration": "healer" },
  "Evoker": { "Devastation": "rangedDps", "Preservation": "healer", "Augmentation": "rangedDps" },
  "Hunter": { "Beast Mastery": "rangedDps", "Marksmanship": "rangedDps", "Survival": "meleeDps" },
  "Mage": { "Arcane": "rangedDps", "Fire": "rangedDps", "Frost": "rangedDps" },
  "Monk": { "Brewmaster": "tank", "Mistweaver": "healer", "Windwalker": "meleeDps" },
  "Paladin": { "Holy": "healer", "Protection": "tank", "Retribution": "meleeDps" },
  "Priest": { "Discipline": "healer", "Holy": "healer", "Shadow": "rangedDps" },
  "Rogue": { "Assassination": "meleeDps", "Outlaw": "meleeDps", "Subtlety": "meleeDps" },
  "Shaman": { "Elemental": "rangedDps", "Enhancement": "meleeDps", "Restoration": "healer" },
  "Warlock": { "Affliction": "rangedDps", "Demonology": "rangedDps", "Destruction": "rangedDps" },
  "Warrior": { "Arms": "meleeDps", "Fury": "meleeDps", "Protection": "tank" },
}

const roleIcons = {
  tank: Shield,
  healer: Heart,
  meleeDps: Sword,
  rangedDps: Crosshair,
}

const roleColors = {
  tank: "text-blue-400",
  healer: "text-green-400",
  meleeDps: "text-red-400",
  rangedDps: "text-orange-400",
}

export function JoinEventDialog({ open, onOpenChange, onJoin, existingParticipant }: JoinEventDialogProps) {
  const t = useTranslations("event")
  const isEditing = !!existingParticipant

  const [name, setName] = useState("")
  const [wowClass, setWowClass] = useState("")
  const [spec, setSpec] = useState("")
  const [ilvl, setIlvl] = useState(0)
  const [keyMin, setKeyMin] = useState(2)
  const [keyMax, setKeyMax] = useState(15)

  useEffect(() => {
    if (open) {
      if (existingParticipant) {
        setName(existingParticipant.name)
        setWowClass(existingParticipant.class)
        setSpec(existingParticipant.spec)
        setIlvl(existingParticipant.ilvl)
        setKeyMin(existingParticipant.keyMin)
        setKeyMax(existingParticipant.keyMax)
      } else {
        setName("")
        setWowClass("")
        setSpec("")
        setIlvl(0)
        setKeyMin(2)
        setKeyMax(15)
      }
    }
  }, [open, existingParticipant])

  const role = specRoles[wowClass]?.[spec] || "meleeDps"
  const hasBloodlust = bloodlustClasses.includes(wowClass)
  const hasBattleRez = battleRezClasses.includes(wowClass)
  const availableSpecs = wowClass ? specsByClass[wowClass] || [] : []

  const RoleIcon = spec ? roleIcons[role] : null
  const roleColor = spec ? roleColors[role] : ""

  const handleJoin = () => {
    if (!name || !wowClass || !spec) return
    onJoin({
      id: existingParticipant?.id ?? `participant-${Date.now()}`,
      name,
      class: wowClass,
      spec,
      role,
      ilvl,
      hasBloodlust,
      hasBattleRez,
      keyMin,
      keyMax,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0614] border-purple-500/30 text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? t("editCharacterTitle") : t("joinEventTitle")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? t("editCharacterSubtitle") : t("joinEventSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="join-name" className="text-sm text-muted-foreground">
              {t("editName")}
            </Label>
            <Input
              id="join-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arthas"
              className="bg-purple-900/20 border-purple-500/30 text-foreground"
            />
          </div>

          {/* Class + Spec side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">{t("editClass")}</Label>
              <Select value={wowClass} onValueChange={(v) => { setWowClass(v); setSpec("") }}>
                <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-foreground">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0614] border-purple-500/30">
                  {wowClasses.map((c) => (
                    <SelectItem key={c} value={c} className="text-foreground hover:bg-purple-500/20">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">{t("editSpec")}</Label>
              <Select value={spec} onValueChange={setSpec} disabled={!wowClass}>
                <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-foreground">
                  <SelectValue placeholder="Spec" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0614] border-purple-500/30">
                  {availableSpecs.map((s) => (
                    <SelectItem key={s} value={s} className="text-foreground hover:bg-purple-500/20">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role preview */}
          {spec && RoleIcon && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/10 border border-purple-500/20 rounded-md">
              <RoleIcon className={`w-4 h-4 ${roleColor}`} />
              <span className={`text-sm font-medium ${roleColor}`}>{t(`roles.${role}`)}</span>
              <div className="ml-auto flex items-center gap-3">
                <span className={`flex items-center gap-1 text-sm ${hasBloodlust ? "opacity-100" : "opacity-25"}`}>
                  <BloodlustIcon className="w-4 h-4 text-orange-400" />
                </span>
                <span className={`flex items-center gap-1 text-sm ${hasBattleRez ? "opacity-100" : "opacity-25"}`}>
                  <BattleRezIcon className="w-4 h-4 text-green-400" />
                </span>
              </div>
            </div>
          )}

          {/* iLvl */}
          <div className="space-y-2">
            <Label htmlFor="join-ilvl" className="text-sm text-muted-foreground">
              {t("editIlvl")}
            </Label>
            <Input
              id="join-ilvl"
              type="number"
              value={ilvl}
              onChange={(e) => setIlvl(parseInt(e.target.value) || 0)}
              className="bg-purple-900/20 border-purple-500/30 text-foreground"
              min={0}
              max={999}
            />
          </div>

          {/* Key Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="join-keyMin" className="text-sm text-muted-foreground">
                {t("editKeyMin")}
              </Label>
              <Input
                id="join-keyMin"
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
              <Label htmlFor="join-keyMax" className="text-sm text-muted-foreground">
                {t("editKeyMax")}
              </Label>
              <Input
                id="join-keyMax"
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-purple-500/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-purple-500/30 text-muted-foreground hover:bg-purple-500/10"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleJoin}
            disabled={!name || !wowClass || !spec}
            className="bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 disabled:opacity-50"
          >
            {isEditing ? t("saveChanges") : t("joinEvent")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
