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
import { Trash2 } from "lucide-react"

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

interface EditParticipantDialogProps {
  participant: Participant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (participant: Participant) => void
  onDelete: (participantId: string) => void
  mode?: "edit" | "add"
}

const wowClasses = [
  "Death Knight",
  "Demon Hunter",
  "Druid",
  "Evoker",
  "Hunter",
  "Mage",
  "Monk",
  "Paladin",
  "Priest",
  "Rogue",
  "Shaman",
  "Warlock",
  "Warrior",
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

// Classes that provide Bloodlust/Heroism
const bloodlustClasses = ["Shaman", "Mage", "Hunter", "Evoker"]

// Classes that provide Battle Rez
const battleRezClasses = ["Death Knight", "Druid", "Warlock", "Paladin"]

const hasClassBloodlust = (wowClass: string) => bloodlustClasses.includes(wowClass)
const hasClassBattleRez = (wowClass: string) => battleRezClasses.includes(wowClass)

// Spec to role mapping
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

const getSpecRole = (wowClass: string, spec: string): "tank" | "healer" | "meleeDps" | "rangedDps" => {
  return specRoles[wowClass]?.[spec] || "meleeDps"
}

export function EditParticipantDialog({
  participant,
  open,
  onOpenChange,
  onSave,
  onDelete,
  mode = "edit",
}: EditParticipantDialogProps) {
  const t = useTranslations("event")
  
  const [name, setName] = useState("")
  const [wowClass, setWowClass] = useState("")
  const [spec, setSpec] = useState("")
  const [ilvl, setIlvl] = useState(0)
  const [keyMin, setKeyMin] = useState(2)
  const [keyMax, setKeyMax] = useState(30)

  useEffect(() => {
    if (mode === "edit" && participant) {
      setName(participant.name)
      setWowClass(participant.class)
      setSpec(participant.spec)
      setIlvl(participant.ilvl)
      setKeyMin(participant.keyMin ?? 2)
      setKeyMax(participant.keyMax ?? 30)
    } else if (mode === "add") {
      setName("")
      setWowClass("")
      setSpec("")
      setIlvl(0)
      setKeyMin(2)
      setKeyMax(30)
    }
  }, [participant, mode, open])
  
  // Compute role based on class and spec
  const role = getSpecRole(wowClass, spec)
  
  // Compute BL/BR based on class
  const hasBloodlust = hasClassBloodlust(wowClass)
  const hasBattleRez = hasClassBattleRez(wowClass)

  const handleSave = () => {
    if (mode === "edit" && !participant) return
    if (!name || !wowClass || !spec) return
    
    const newParticipant: Participant = {
      id: mode === "add" ? `participant-${Date.now()}` : participant!.id,
      name,
      class: wowClass,
      spec,
      role,
      ilvl,
      hasBloodlust,
      hasBattleRez,
      keyMin,
      keyMax,
    }
    
    onSave(newParticipant)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!participant) return
    onDelete(participant.id)
    onOpenChange(false)
  }

  const availableSpecs = wowClass ? specsByClass[wowClass] || [] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0614] border-purple-500/30 text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {mode === "add" ? t("addParticipantTitle") : t("editParticipant")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "add" 
              ? (wowClass && spec ? `${wowClass} - ${spec}` : "-")
              : `${participant?.name} - ${participant?.class}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              {t("editName")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-purple-900/20 border-purple-500/30 text-foreground"
            />
          </div>

          {/* Class */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {t("editClass")}
            </Label>
            <Select value={wowClass} onValueChange={(value) => {
              setWowClass(value)
              setSpec("")
            }}>
              <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-foreground">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0614] border-purple-500/30">
                {wowClasses.map((c) => (
                  <SelectItem key={c} value={c} className="text-foreground hover:bg-purple-500/20">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Spec */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {t("editSpec")}
            </Label>
            <Select value={spec} onValueChange={setSpec} disabled={!wowClass}>
              <SelectTrigger className="bg-purple-900/20 border-purple-500/30 text-foreground">
                <SelectValue placeholder="Select spec" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0614] border-purple-500/30">
                {availableSpecs.map((s) => (
                  <SelectItem key={s} value={s} className="text-foreground hover:bg-purple-500/20">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role - read only, based on spec */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {t("editRole")}
            </Label>
            <div className="px-3 py-2 bg-purple-900/10 border border-purple-500/20 rounded-md text-foreground/70">
              {spec ? t(`roles.${role}`) : "-"}
            </div>
          </div>

          {/* iLvl */}
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

          {/* Bloodlust & Battle Rez - read only, based on class */}
          <div className="flex items-center gap-6 pt-2 border-t border-purple-500/20">
            <div className={`flex items-center gap-2 ${hasBloodlust ? 'opacity-100' : 'opacity-30'}`}>
              <BloodlustIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-muted-foreground">
                {t("editHasBloodlust")}
              </span>
            </div>
            <div className={`flex items-center gap-2 ${hasBattleRez ? 'opacity-100' : 'opacity-30'}`}>
              <BattleRezIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">
                {t("editHasBattleRez")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center pt-4 border-t border-purple-500/20 ${mode === "add" ? "justify-end" : "justify-between"}`}>
          {mode === "edit" && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("deleteParticipant")}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-purple-500/30 text-muted-foreground hover:bg-purple-500/10"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || !wowClass || !spec}
              className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 disabled:opacity-50"
            >
              {mode === "add" ? t("add") : t("saveChanges")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
