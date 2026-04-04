"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { BloodlustIcon, BattleRezIcon } from "./wow-icons"
import { Trash2 } from "lucide-react"
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from "@/constants/itemLevels"

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

interface EditParticipantDialogV0Props {
  participant: Participant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (participant: Participant) => void | Promise<void>
  onDelete: (participantId: string) => void | Promise<void>
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

export function EditParticipantDialogV0({
  participant,
  open,
  onOpenChange,
  onSave,
  onDelete,
  mode = "edit",
}: EditParticipantDialogV0Props) {
  const { t } = useTranslation()
  const tEv = (key: string) => t(`eventV0.${key}`)
  
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
      setIlvl(ITEM_LEVEL_MIN)
      setKeyMin(2)
      setKeyMax(30)
    }
  }, [participant, mode, open])
  
  // Compute role based on class and spec
  const role = getSpecRole(wowClass, spec)
  
  // Compute BL/BR based on class
  const hasBloodlust = hasClassBloodlust(wowClass)
  const hasBattleRez = hasClassBattleRez(wowClass)

  const handleSave = async () => {
    if (mode === "edit" && !participant) return
    if (!name || !wowClass || !spec) return
    
    const newParticipant: Participant = {
      id: mode === "add" ? `participant-${Date.now()}` : participant!.id,
      name,
      class: wowClass,
      spec,
      role,
      ilvl: Math.max(ITEM_LEVEL_MIN, Math.min(ilvl, ITEM_LEVEL_MAX)),
      hasBloodlust,
      hasBattleRez,
      keyMin,
      keyMax,
    }
    
    await onSave(newParticipant)
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!participant) return
    await onDelete(participant.id)
    onOpenChange(false)
  }

  const availableSpecs = wowClass ? specsByClass[wowClass] || [] : []

  const optionClass = 'bg-[#0a0614] text-neutral-100'
  const selectClass =
    'h-9 w-full rounded-md border border-purple-500/30 bg-[#120a1f] px-3 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 disabled:opacity-50 [color-scheme:dark]'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-label={tEv('cancel')}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-purple-500/30 bg-[#0a0614] p-6 text-foreground shadow-xl [color-scheme:dark]">
        <h2 className="text-xl font-bold text-foreground">
          {mode === "add" ? tEv("addParticipantTitle") : tEv("editParticipant")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "add"
            ? wowClass && spec
              ? `${wowClass} - ${spec}`
              : "—"
            : `${participant?.name} - ${participant?.class}`}
        </p>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="v0-participant-name" className="text-sm text-muted-foreground">
              {tEv("editName")}
            </label>
            <Input
              id="v0-participant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-purple-900/20 border-purple-500/30 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="v0-participant-class" className="text-sm text-muted-foreground">
              {tEv("editClass")}
            </label>
            <select
              id="v0-participant-class"
              value={wowClass}
              onChange={(e) => {
                setWowClass(e.target.value)
                setSpec("")
              }}
              className={selectClass}
            >
              <option value="" className={optionClass}>
                —
              </option>
              {wowClasses.map((c) => (
                <option key={c} value={c} className={optionClass}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="v0-participant-spec" className="text-sm text-muted-foreground">
              {tEv("editSpec")}
            </label>
            <select
              id="v0-participant-spec"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              disabled={!wowClass}
              className={selectClass}
            >
              <option value="" className={optionClass}>
                —
              </option>
              {availableSpecs.map((s) => (
                <option key={s} value={s} className={optionClass}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">{tEv("editRole")}</span>
            <div className="rounded-md border border-purple-500/20 bg-purple-900/10 px-3 py-2 text-foreground/70">
              {spec ? t(`eventV0.roles.${role}`) : "—"}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="v0-participant-ilvl" className="text-sm text-muted-foreground">
              {tEv("editIlvl")}
            </label>
            <Input
              id="v0-participant-ilvl"
              type="number"
              value={ilvl}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                setIlvl(Number.isFinite(n) ? n : ITEM_LEVEL_MIN)
              }}
              className="bg-purple-900/20 border-purple-500/30 text-foreground"
              min={ITEM_LEVEL_MIN}
              max={ITEM_LEVEL_MAX}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="v0-key-min" className="text-sm text-muted-foreground">
                {tEv("editKeyMin")}
              </label>
              <Input
                id="v0-key-min"
                type="number"
                value={keyMin}
                onChange={(e) => {
                  const val = Math.max(2, Math.min(30, parseInt(e.target.value, 10) || 2))
                  setKeyMin(val)
                  if (val > keyMax) setKeyMax(val)
                }}
                className="bg-purple-900/20 border-purple-500/30 text-foreground"
                min={2}
                max={30}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="v0-key-max" className="text-sm text-muted-foreground">
                {tEv("editKeyMax")}
              </label>
              <Input
                id="v0-key-max"
                type="number"
                value={keyMax}
                onChange={(e) => {
                  const val = Math.max(2, Math.min(30, parseInt(e.target.value, 10) || 30))
                  setKeyMax(val)
                  if (val < keyMin) setKeyMin(val)
                }}
                className="bg-purple-900/20 border-purple-500/30 text-foreground"
                min={2}
                max={30}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-purple-500/20 pt-2">
            <div className={`flex items-center gap-2 ${hasBloodlust ? 'opacity-100' : 'opacity-30'}`}>
              <BloodlustIcon className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-muted-foreground">{tEv("editHasBloodlust")}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasBattleRez ? 'opacity-100' : 'opacity-30'}`}>
              <BattleRezIcon className="h-5 w-5 text-green-400" />
              <span className="text-sm text-muted-foreground">{tEv("editHasBattleRez")}</span>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center border-t border-purple-500/20 pt-4 ${mode === "add" ? "justify-end" : "justify-between"}`}
        >
          {mode === "edit" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleDelete()}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tEv("deleteParticipant")}
            </Button>
          ) : null}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-purple-500/30 text-muted-foreground hover:bg-purple-500/10"
            >
              {tEv("cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!name || !wowClass || !spec}
              className="border border-cyan-500/50 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
            >
              {mode === "add" ? tEv("add") : tEv("saveChanges")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
