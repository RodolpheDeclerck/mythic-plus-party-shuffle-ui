"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Shield, Heart, Sword, Crosshair, Users, Shuffle, ArrowLeft, Pencil, LogOut } from "lucide-react"
import { BloodlustIcon, BattleRezIcon } from "@/components/wow-icons"
import { Button } from "@/components/ui/button"
import { JoinEventDialog } from "@/components/join-event-dialog"
import { LeaveEventDialog } from "@/components/leave-event-dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"

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

interface PartyGroup {
  id: string
  tank: Participant | null
  healer: Participant | null
  dps: Participant[]
}

interface EventParticipantViewProps {
  eventId: string
  eventName: string
  eventCode: string
  participants: Participant[]
  groups: PartyGroup[]
  groupsVisible: boolean
  myParticipantId?: string
  onUpdateParticipant?: (participant: Participant) => void
  onLeaveEvent?: () => void
}

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

const roleIcons: Record<string, { icon: React.ElementType; color: string }> = {
  tank: { icon: Shield, color: "text-blue-400" },
  healer: { icon: Heart, color: "text-green-400" },
  meleeDps: { icon: Sword, color: "text-red-400" },
  rangedDps: { icon: Crosshair, color: "text-orange-400" },
}

function ParticipantRow({ participant, isMe, showRole }: { participant: Participant; isMe: boolean; showRole?: boolean }) {
  const t = useTranslations("event")
  const RoleIcon = roleIcons[participant.role]?.icon
  const roleColor = roleIcons[participant.role]?.color || "text-muted-foreground"
  
  return (
    <tr className={`border-b border-border/30 last:border-0 transition-colors ${isMe ? "bg-cyan-500/10" : "hover:bg-secondary/20"}`}>
      {showRole && (
        <td className="px-3 py-2.5 text-center w-10">
          {RoleIcon && <RoleIcon className={`w-4 h-4 inline ${roleColor}`} />}
        </td>
      )}
      <td className={`px-4 py-2.5 font-medium truncate ${isMe ? "text-cyan-300 font-bold" : ""}`}>
        {participant.name}
        {isMe && <span className="ml-2 text-xs text-cyan-400 font-normal">({t("you")})</span>}
      </td>
      <td className={`px-4 py-2.5 truncate ${classColors[participant.class] || "text-foreground"}`}>
        {participant.class}
      </td>
      <td className="px-4 py-2.5 text-muted-foreground truncate">{participant.spec}</td>
      <td className="px-4 py-2.5 text-center">
        <span className={`inline-block font-bold font-mono text-sm px-2 py-0.5 rounded ${
          participant.ilvl >= 490 ? "bg-purple-500/20 text-purple-300" :
          participant.ilvl >= 480 ? "bg-blue-500/20 text-blue-300" :
          participant.ilvl >= 470 ? "bg-green-500/20 text-green-300" :
          "bg-muted/20 text-muted-foreground"
        }`}>
          {participant.ilvl}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="text-cyan-400 font-mono text-sm">{participant.keyMin}-{participant.keyMax}</span>
      </td>
      <td className="px-4 py-2.5 text-center">
        {participant.hasBloodlust ? <BloodlustIcon className="w-5 h-5 inline text-orange-400" /> : <span className="text-muted-foreground/30">-</span>}
      </td>
      <td className="px-4 py-2.5 text-center">
        {participant.hasBattleRez ? <BattleRezIcon className="w-5 h-5 inline text-green-400" /> : <span className="text-muted-foreground/30">-</span>}
      </td>
    </tr>
  )
}

function RoleTable({ icon: Icon, color, label, participants, myParticipantId }: {
  icon: React.ElementType
  color: string
  label: string
  participants: Participant[]
  myParticipantId?: string
}) {
  const t = useTranslations("event")
  if (participants.length === 0) return null
  return (
    <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-semibold text-foreground">{label}</h3>
        <span className="text-sm text-muted-foreground">({participants.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border/50 text-sm text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium w-[22%]">{t("columns.name")}</th>
              <th className="px-4 py-2 text-left font-medium w-[18%]">{t("columns.class")}</th>
              <th className="px-4 py-2 text-left font-medium w-[18%]">{t("columns.spec")}</th>
              <th className="px-4 py-2 text-center font-medium w-[12%]">{t("columns.ilvl")}</th>
              <th className="px-4 py-2 text-center font-medium w-[12%]">{t("keyRange")}</th>
              <th className="px-4 py-2 font-medium text-center w-[9%]">
                <BloodlustIcon className="w-5 h-5 inline text-orange-400" />
              </th>
              <th className="px-4 py-2 font-medium text-center w-[9%]">
                <BattleRezIcon className="w-5 h-5 inline text-green-400" />
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <ParticipantRow key={p.id} participant={p} isMe={p.id === myParticipantId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GroupCard({ group, index, myParticipantId, highlighted }: {
  group: PartyGroup
  index: number
  myParticipantId?: string
  highlighted: boolean
}) {
  const t = useTranslations("event")
  const members = [group.tank, group.healer, ...(group.dps || [])].filter(Boolean) as Participant[]
  const ilvls = members.map(m => m.ilvl)
  const keys = members.map(m => ({ min: m.keyMin, max: m.keyMax }))
  const minIlvl = members.length ? Math.min(...ilvls) : 0
  const maxIlvl = members.length ? Math.max(...ilvls) : 0
  const avgIlvl = members.length ? Math.round(ilvls.reduce((a, b) => a + b, 0) / ilvls.length) : 0
  const minKey = members.length ? Math.min(...keys.map(k => k.min)) : 0
  const maxKey = members.length ? Math.max(...keys.map(k => k.max)) : 0

  // Check what's missing
  const missingTank = !group.tank
  const missingHealer = !group.healer
  const dpsCount = (group.dps || []).filter(Boolean).length
  const missingDps = 3 - dpsCount
  const hasBloodlust = members.some(m => m.hasBloodlust)
  const hasBattleRez = members.some(m => m.hasBattleRez)

  const hasMissing = missingTank || missingHealer || missingDps > 0 || !hasBloodlust || !hasBattleRez

  return (
    <div className={`rounded-xl border overflow-hidden ${highlighted ? "border-cyan-400/40" : "border-purple-500/20"}`}>
      <div className={`px-4 py-2 flex items-center gap-3 ${highlighted ? "bg-cyan-900/20" : "bg-purple-900/20"}`}>
        <span className="font-semibold text-foreground">{t("group")} {index + 1}</span>
        {members.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">{minIlvl}-{maxIlvl}</span>
            <span className="font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">~{avgIlvl}</span>
            <span className="font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">+{minKey}-{maxKey}</span>
          </div>
        )}
      </div>

      {/* Missing elements warning or complete status */}
      {hasMissing ? (
        <div className="px-4 py-2 bg-amber-900/20 border-b border-amber-500/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-amber-400 font-medium">{t("missing")}:</span>
          {missingTank && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              <Shield className="w-3 h-3" /> Tank
            </span>
          )}
          {missingHealer && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/20 text-green-300">
              <Heart className="w-3 h-3" /> Healer
            </span>
          )}
          {missingDps > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300">
              <Sword className="w-3 h-3" /> {missingDps} DPS
            </span>
          )}
          {!hasBloodlust && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
              <BloodlustIcon className="w-3 h-3" /> BL
            </span>
          )}
          {!hasBattleRez && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
              <BattleRezIcon className="w-3 h-3" /> BR
            </span>
          )}
        </div>
      ) : (
        <div className="px-4 py-2 bg-green-900/20 border-b border-green-500/20 flex items-center gap-2 text-xs">
          <span className="text-green-400 font-medium">{t("complete")}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <tbody>
            {group.tank && <ParticipantRow participant={group.tank} isMe={group.tank.id === myParticipantId} showRole />}
            {group.healer && <ParticipantRow participant={group.healer} isMe={group.healer.id === myParticipantId} showRole />}
            {group.dps?.map(dps => dps && (
              <ParticipantRow key={dps.id} participant={dps} isMe={dps.id === myParticipantId} showRole />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function EventParticipantView({
  eventId,
  eventName,
  eventCode,
  participants,
  groups,
  groupsVisible,
  myParticipantId,
  onUpdateParticipant,
  onLeaveEvent,
}: EventParticipantViewProps) {
  const t = useTranslations("event")
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const myParticipant = participants.find(p => p.id === myParticipantId)

  const handleLeave = () => {
    onLeaveEvent?.()
    router.push("/")
  }

  const tanks = participants.filter(p => p.role === "tank")
  const healers = participants.filter(p => p.role === "healer")
  const melee = participants.filter(p => p.role === "meleeDps")
  const ranged = participants.filter(p => p.role === "rangedDps")

  const myGroupIndex = groups.findIndex(g =>
    g.tank?.id === myParticipantId ||
    g.healer?.id === myParticipantId ||
    g.dps?.some(d => d?.id === myParticipantId)
  )

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{eventName}</h1>
          <p className="text-sm text-muted-foreground font-mono">{eventCode}</p>
        </div>
        {myParticipant && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setEditOpen(true)}
              variant="outline"
              size="sm"
              className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Pencil className="w-4 h-4 mr-2" />
              {t("editCharacter")}
            </Button>
            <Button
              onClick={() => setLeaveOpen(true)}
              variant="outline"
              size="sm"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("leaveEvent")}
            </Button>
          </div>
        )}
      </div>

      {/* Edit character dialog */}
      {myParticipant && (
        <JoinEventDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          existingParticipant={myParticipant}
          onJoin={(updatedParticipant) => {
            onUpdateParticipant?.(updatedParticipant)
            setEditOpen(false)
          }}
        />
      )}

      {/* Leave event dialog */}
      <LeaveEventDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={handleLeave}
      />

      {/* Groups section - Only show my group */}
      {myGroupIndex !== -1 && groupsVisible ? (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-cyan-400" />
            {t("yourGroup")}
          </h2>
          <GroupCard group={groups[myGroupIndex]} index={myGroupIndex} myParticipantId={myParticipantId} highlighted />
        </div>
      ) : groups.length > 0 && !groupsVisible ? (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-cyan-400" />
            {t("generatedGroups")}
          </h2>
          <div className="text-center py-10 rounded-xl border border-purple-500/20 bg-purple-900/10">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("groupsHiddenByAdmin")}</p>
          </div>
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-cyan-400" />
            {t("generatedGroups")}
          </h2>
          <div className="text-center py-10 rounded-xl border border-purple-500/20 bg-purple-900/10">
            <Shuffle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("notAssignedToGroup")}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-cyan-400" />
            {t("generatedGroups")}
          </h2>
          <div className="text-center py-10 rounded-xl border border-purple-500/20 bg-purple-900/10">
            <Shuffle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("noGroupsYet")}</p>
          </div>
        </div>
      )}

      {/* Registered participants - same table as admin view */}
      {participants.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            {t("participants")} ({participants.length})
          </h2>
          <div className="grid gap-4">
            <RoleTable icon={Shield} color="text-blue-400" label="Tanks" participants={tanks} myParticipantId={myParticipantId} />
            <RoleTable icon={Heart} color="text-green-400" label="Healers" participants={healers} myParticipantId={myParticipantId} />
            <RoleTable icon={Sword} color="text-red-400" label="Melee DPS" participants={melee} myParticipantId={myParticipantId} />
            <RoleTable icon={Crosshair} color="text-orange-400" label="Ranged DPS" participants={ranged} myParticipantId={myParticipantId} />
          </div>
        </div>
      )}
    </div>
  )
}
