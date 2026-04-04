"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { ArrowLeft, Copy, Check, Shield, Heart, Sword, Crosshair, Shuffle, Users, GripVertical, Plus, Trash2, AlertTriangle, CheckCircle, Eye, EyeOff, Pencil, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BloodlustIcon, BattleRezIcon } from "./wow-icons"
import { EditParticipantDialogV0 } from "./EditParticipantDialogV0"
import { ClearConfirmDialogV0 } from "./ClearConfirmDialogV0"
import type { Character } from "@/types/Character"
import type { Party } from "@/types/Party"
import {
  type ParticipantV0 as Participant,
  type PartyGroupV0 as PartyGroup,
  characterToParticipantV0,
  partiesToPartyGroupsV0,
  partyGroupsV0ToParties,
  participantToCharacterForUpsert,
} from "./v0/v0PartyBridge"
import { v0ClassColors as classColors } from "./v0ClassColors"
import {
  ITEM_LEVEL_TIER_HIGH,
  ITEM_LEVEL_TIER_MID,
  ITEM_LEVEL_TIER_LOW,
} from "@/constants/itemLevels"

export type EventDetailV0Props = {
  eventCode: string
  eventName: string
  eventCreatedAt?: string
  homeHref: string
  isAdmin: boolean
  characters: Character[]
  parties: Party[]
  arePartiesVisible: boolean
  shufflePending: boolean
  onShuffle: () => void | Promise<void>
  onClearParties: () => void | Promise<void>
  onToggleVisibility: () => void | Promise<void>
  onPartiesUpdate: (parties: Party[]) => void | Promise<void>
  onClearAllCharacters: () => void | Promise<void>
  onSaveParticipant: (c: Character & { eventCode: string }) => Promise<void>
  onDeleteParticipant: (id: number) => Promise<void>
  /** When set and user is not admin, only this player’s party is shown once groups are visible. */
  viewerCharacterId?: number | null
  /** Player removes their character and leaves the event (after confirmation). */
  onViewerLeaveEvent?: () => void | Promise<void>
}

function partyGroupContainsCharacterId(group: PartyGroup, id: number): boolean {
  const sid = String(id)
  return (
    group.tank?.id === sid ||
    group.healer?.id === sid ||
    group.dps.some((d) => d.id === sid)
  )
}

/** Aligné sur `PartyTable` : ilvl moyen (min–max) et plus petite / plus grande clé du groupe. */
function getPartyGroupAggregateStats(group: PartyGroup): {
  avgIlvl: string
  minIlvl: number
  maxIlvl: number
  minKey: number
  maxKey: number
} | null {
  const members = [group.tank, group.healer, ...group.dps].filter(
    (m): m is Participant => m != null,
  )
  if (members.length === 0) return null
  const ilvls = members.map((m) => m.ilvl)
  const sum = ilvls.reduce((a, b) => a + b, 0)
  return {
    avgIlvl: (sum / ilvls.length).toFixed(2),
    minIlvl: Math.min(...ilvls),
    maxIlvl: Math.max(...ilvls),
    minKey: Math.min(...members.map((m) => m.keyMin)),
    maxKey: Math.max(...members.map((m) => m.keyMax)),
  }
}

function PlayerRosterTableRow({
  participant,
  isViewer,
  classColors,
  tEv,
}: {
  participant: Participant
  isViewer: boolean
  classColors: Record<string, string>
  tEv: (key: string) => string
}) {
  return (
    <tr
      className={cn(
        "border-b border-border/30 transition-colors last:border-0",
        isViewer ? "bg-cyan-500/10" : "hover:bg-secondary/20",
      )}
    >
      <td
        className={cn(
          "truncate px-4 py-2.5 font-medium",
          isViewer ? "font-bold text-cyan-300" : "",
        )}
      >
        {participant.name}
        {isViewer ? (
          <span className="ml-2 text-xs font-normal text-cyan-400">
            ({tEv("you")})
          </span>
        ) : null}
      </td>
      <td
        className={cn(
          "truncate px-4 py-2.5",
          classColors[participant.class] || "text-foreground",
        )}
      >
        {participant.class}
      </td>
      <td className="truncate px-4 py-2.5 text-muted-foreground">
        {participant.spec}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span
          className={cn(
            "inline-block rounded px-2 py-0.5 font-mono text-sm font-bold",
            participant.ilvl >= ITEM_LEVEL_TIER_HIGH
              ? "bg-purple-500/20 text-purple-300"
              : participant.ilvl >= ITEM_LEVEL_TIER_MID
                ? "bg-blue-500/20 text-blue-300"
                : participant.ilvl >= ITEM_LEVEL_TIER_LOW
                  ? "bg-green-500/20 text-green-300"
                  : "bg-muted/20 text-muted-foreground",
          )}
        >
          {participant.ilvl}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="font-mono text-sm text-cyan-400">
          {participant.keyMin}-{participant.keyMax}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        {participant.hasBloodlust ? (
          <BloodlustIcon className="inline h-5 w-5 text-orange-400" />
        ) : (
          <span className="text-muted-foreground/30">-</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-center">
        {participant.hasBattleRez ? (
          <BattleRezIcon className="inline h-5 w-5 text-green-400" />
        ) : (
          <span className="text-muted-foreground/30">-</span>
        )}
      </td>
    </tr>
  )
}

export function EventDetailV0({
  eventCode,
  eventName,
  eventCreatedAt,
  homeHref,
  isAdmin,
  characters,
  parties,
  arePartiesVisible,
  shufflePending,
  onShuffle,
  onClearParties,
  onToggleVisibility,
  onPartiesUpdate,
  onClearAllCharacters,
  onSaveParticipant,
  onDeleteParticipant,
  viewerCharacterId = null,
  onViewerLeaveEvent,
}: EventDetailV0Props) {
  const { t } = useTranslation()
  const tEv = (key: string) => t(`eventV0.${key}`)

  const specLabel = useCallback(
    (c: Character) => t(`specializations.${c.specialization}`),
    [t],
  )

  const participants = useMemo(
    () => characters.map((c) => characterToParticipantV0(c, specLabel(c))),
    [characters, specLabel],
  )

  const [shuffledGroups, setShuffledGroupsFromServer] = useState<PartyGroup[]>([])

  useEffect(() => {
    setShuffledGroupsFromServer(partiesToPartyGroupsV0(parties, specLabel))
  }, [parties, specLabel])

  const setShuffledGroups = useCallback(
    (updater: React.SetStateAction<PartyGroup[]>) => {
      setShuffledGroupsFromServer((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: PartyGroup[]) => PartyGroup[])(prev)
            : updater
        if (isAdmin) {
          void onPartiesUpdate(partyGroupsV0ToParties(next, characters))
        }
        return next
      })
    },
    [characters, onPartiesUpdate, isAdmin],
  )

  const groupsToRender = useMemo(() => {
    if (isAdmin) return shuffledGroups
    if (!arePartiesVisible) return shuffledGroups
    if (viewerCharacterId == null) return []
    return shuffledGroups.filter((g) =>
      partyGroupContainsCharacterId(g, viewerCharacterId),
    )
  }, [isAdmin, arePartiesVisible, shuffledGroups, viewerCharacterId])

  const participantGroupNumber = useMemo(() => {
    if (isAdmin || !arePartiesVisible || viewerCharacterId == null) return null
    const g = shuffledGroups.find((x) =>
      partyGroupContainsCharacterId(x, viewerCharacterId),
    )
    if (!g) return null
    const idx = shuffledGroups.findIndex((x) => x.id === g.id)
    return idx >= 0 ? idx + 1 : null
  }, [isAdmin, arePartiesVisible, viewerCharacterId, shuffledGroups])

  const [codeCopied, setCodeCopied] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{participant: Participant, fromGroupId: string | 'unassigned', slot: 'tank' | 'healer' | 'dps'} | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)
  const [dragOverParticipant, setDragOverParticipant] = useState<string | null>(null)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"edit" | "add">("edit")
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [clearParticipantsOpen, setClearParticipantsOpen] = useState(false)
  const [clearGroupsOpen, setClearGroupsOpen] = useState(false)

  const tanks = participants.filter(p => p.role === "tank")
  const healers = participants.filter(p => p.role === "healer")
  const meleeDps = participants.filter(p => p.role === "meleeDps")
  const rangedDps = participants.filter(p => p.role === "rangedDps")
  const allDps = [...meleeDps, ...rangedDps]

  const handleShuffle = () => {
    void onShuffle()
  }

  const copyCode = () => {
    void navigator.clipboard.writeText(eventCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, participant: Participant, fromGroupId: string, slot: 'tank' | 'healer' | 'dps') => {
    setDraggedItem({ participant, fromGroupId, slot })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', participant.id)
  }

  const handleDragOver = (e: React.DragEvent, groupId: string, participantId?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverGroup(groupId)
    setDragOverParticipant(participantId || null)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the element entirely (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverGroup(null)
      setDragOverParticipant(null)
    }
  }

  // Calculate group size
  const getGroupSize = (group: PartyGroup): number => {
    return (group.tank ? 1 : 0) + (group.healer ? 1 : 0) + group.dps.length
  }

  const handleDrop = (e: React.DragEvent, toGroupId: string, toSlot: 'tank' | 'healer' | 'dps', targetParticipantId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverGroup(null)
    setDragOverParticipant(null)
    
    if (!draggedItem) return
    
    const { participant, fromGroupId, slot: fromSlot } = draggedItem
    
    // Only allow same role swaps (tank with tank, healer with healer, dps with dps)
    if (fromSlot !== toSlot) {
      setDraggedItem(null)
      return
    }
    
    // Same group and same participant, no action needed
    if (fromGroupId === toGroupId && !targetParticipantId) {
      setDraggedItem(null)
      return
    }
    
    setShuffledGroups(prevGroups => {
      const newGroups = prevGroups.map(g => ({
        ...g,
        dps: [...g.dps]
      }))
      
      const toGroup = newGroups.find(g => g.id === toGroupId)
      if (!toGroup) return prevGroups
      
      // Handle drop from unassigned area
      if (fromGroupId === 'unassigned') {
        if (toSlot === 'tank') {
          // If dropping on existing tank, swap them
          if (toGroup.tank && targetParticipantId === toGroup.tank.id) {
            // The tank will become unassigned (handled by unassigned list recalculation)
            toGroup.tank = participant
          } else if (!toGroup.tank) {
            toGroup.tank = participant
          } else {
            return prevGroups // Already has tank, no swap target
          }
        } else if (toSlot === 'healer') {
          // If dropping on existing healer, swap them
          if (toGroup.healer && targetParticipantId === toGroup.healer.id) {
            toGroup.healer = participant
          } else if (!toGroup.healer) {
            toGroup.healer = participant
          } else {
            return prevGroups
          }
        } else if (toSlot === 'dps') {
          // If dropping on existing DPS, swap them
          if (targetParticipantId) {
            const targetIndex = toGroup.dps.findIndex(d => d.id === targetParticipantId)
            if (targetIndex !== -1) {
              toGroup.dps[targetIndex] = participant
              return newGroups
            }
          }
          // Otherwise add if room
          const toGroupSize = getGroupSize(toGroup)
          if (toGroupSize >= 5) return prevGroups
          toGroup.dps.push(participant)
        }
        return newGroups
      }
      
      // Handle drop from another group
      const fromGroup = newGroups.find(g => g.id === fromGroupId)
      if (!fromGroup) return prevGroups
      
      if (fromSlot === 'tank') {
        // Swap tanks
        const temp = toGroup.tank
        toGroup.tank = fromGroup.tank
        fromGroup.tank = temp
      } else if (fromSlot === 'healer') {
        // Swap healers
        const temp = toGroup.healer
        toGroup.healer = fromGroup.healer
        fromGroup.healer = temp
      } else if (fromSlot === 'dps') {
        const fromIndex = fromGroup.dps.findIndex(d => d.id === participant.id)
        if (fromIndex === -1) return prevGroups
        
        // If dropping on another DPS, swap them
        if (targetParticipantId) {
          const toIndex = toGroup.dps.findIndex(d => d.id === targetParticipantId)
          if (toIndex !== -1) {
            // Swap the two DPS
            const temp = toGroup.dps[toIndex]
            toGroup.dps[toIndex] = fromGroup.dps[fromIndex]
            fromGroup.dps[fromIndex] = temp
            return newGroups
          }
        }
        
        // If not swapping, check if target group has room (max 5 total: 1 tank + 1 healer + 3 dps)
        const toGroupSize = getGroupSize(toGroup)
        if (toGroupSize >= 5) {
          // Group is full, can't add more
          return prevGroups
        }
        
        // Remove from source and add to target
        const [movedDps] = fromGroup.dps.splice(fromIndex, 1)
        toGroup.dps.push(movedDps)
      }
      
      return newGroups
    })
    
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverGroup(null)
    setDragOverParticipant(null)
  }

  // Handle drop to unassigned area (remove from group)
  const handleDropToUnassigned = (e: React.DragEvent, targetParticipantId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverGroup(null)
    setDragOverParticipant(null)
    
    if (!draggedItem) return
    if (draggedItem.fromGroupId === 'unassigned') {
      setDraggedItem(null)
      return // Already unassigned
    }
    
    const { participant, fromGroupId, slot: fromSlot } = draggedItem
    
    setShuffledGroups(prevGroups => {
      const newGroups = prevGroups.map(g => ({
        ...g,
        dps: [...g.dps]
      }))
      
      const fromGroup = newGroups.find(g => g.id === fromGroupId)
      if (!fromGroup) return prevGroups
      
      // If swapping with an unassigned participant
      if (targetParticipantId) {
        const targetParticipant = participants.find(p => p.id === targetParticipantId && !getAssignedParticipantIds().has(p.id))
        if (targetParticipant) {
          // Check if roles match for swap
          const targetSlot = targetParticipant.role === 'tank' ? 'tank' : targetParticipant.role === 'healer' ? 'healer' : 'dps'
          if (targetSlot !== fromSlot) {
            return prevGroups // Can't swap different roles
          }
          
          // Put target participant in the group
          if (fromSlot === 'tank') {
            fromGroup.tank = targetParticipant
          } else if (fromSlot === 'healer') {
            fromGroup.healer = targetParticipant
          } else {
            const idx = fromGroup.dps.findIndex(d => d.id === participant.id)
            if (idx !== -1) {
              fromGroup.dps[idx] = targetParticipant
            }
          }
          return newGroups
        }
      }
      
      // Just remove from group (becomes unassigned)
      if (fromSlot === 'tank') {
        fromGroup.tank = null
      } else if (fromSlot === 'healer') {
        fromGroup.healer = null
      } else {
        const idx = fromGroup.dps.findIndex(d => d.id === participant.id)
        if (idx !== -1) {
          fromGroup.dps.splice(idx, 1)
        }
      }
      
      return newGroups
    })
    
    setDraggedItem(null)
  }

  // Add empty group
  const handleAddGroup = () => {
    const newGroup: PartyGroup = {
      id: `group-${Date.now()}`,
      tank: null,
      healer: null,
      dps: []
    }
    setShuffledGroups(prev => [...prev, newGroup])
  }

  // Delete empty group
  const handleDeleteGroup = (groupId: string) => {
    setShuffledGroups(prev => prev.filter(g => g.id !== groupId))
  }

  // Check if group is empty
  const isGroupEmpty = (group: PartyGroup): boolean => {
    return !group.tank && !group.healer && group.dps.length === 0
  }

  // Edit participant
  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setDialogMode("edit")
    setEditDialogOpen(true)
  }

  // Add participant
  const handleAddParticipant = () => {
    setEditingParticipant(null)
    setDialogMode("add")
    setEditDialogOpen(true)
  }

  const handleSaveParticipant = async (updatedParticipant: Participant) => {
    await onSaveParticipant(
      participantToCharacterForUpsert(updatedParticipant, eventCode),
    )
  }

  const handleDeleteParticipantFromDialog = async (participantId: string) => {
    const id = Number.parseInt(participantId, 10)
    if (!Number.isFinite(id)) return
    await onDeleteParticipant(id)
  }




  const roleCategories = [
    { key: "tank", label: tEv("roles.tank"), icon: Shield, color: "text-blue-400", participants: tanks },
    { key: "healer", label: tEv("roles.healer"), icon: Heart, color: "text-green-400", participants: healers },
    { key: "meleeDps", label: tEv("roles.meleeDps"), icon: Sword, color: "text-red-400", participants: meleeDps },
    { key: "rangedDps", label: tEv("roles.rangedDps"), icon: Crosshair, color: "text-orange-400", participants: rangedDps },
  ]

  const viewerSid =
    viewerCharacterId != null ? String(viewerCharacterId) : null

  const viewerParticipant = useMemo(() => {
    if (viewerSid == null) return null
    return participants.find((p) => p.id === viewerSid) ?? null
  }, [participants, viewerSid])

  // Get participants assigned to groups
  const getAssignedParticipantIds = (): Set<string> => {
    const ids = new Set<string>()
    shuffledGroups.forEach(group => {
      if (group.tank) ids.add(group.tank.id)
      if (group.healer) ids.add(group.healer.id)
      group.dps.forEach(d => ids.add(d.id))
    })
    return ids
  }

  // Get unassigned participants (only when groups exist)
  const unassignedParticipants = shuffledGroups.length > 0 
    ? participants.filter(p => !getAssignedParticipantIds().has(p.id))
    : []

  // Helper to check group utilities
  const groupHasBL = (group: PartyGroup): boolean => {
    if (group.tank?.hasBloodlust || group.healer?.hasBloodlust) return true
    return group.dps.some(d => d.hasBloodlust)
  }
  
  const groupHasRez = (group: PartyGroup): boolean => {
    if (group.tank?.hasBattleRez || group.healer?.hasBattleRez) return true
    return group.dps.some(d => d.hasBattleRez)
  }

  // Render a participant row for groups (with drag)
  const renderGroupParticipant = (
    participant: Participant | null, 
    groupId: string, 
    slot: 'tank' | 'healer' | 'dps', 
    icon: React.ElementType, 
    iconColor: string,
    emptyText: string
  ) => {
    const SlotIcon = icon // Icon for empty slot
    const isDragging = draggedItem?.participant.id === participant?.id
    const isDropTarget = dragOverParticipant === participant?.id && draggedItem?.participant.id !== participant?.id
    const canSwap = draggedItem && draggedItem.slot === slot && draggedItem.participant.id !== participant?.id
    
    // Get icon based on participant's actual role
    const getParticipantIcon = (p: Participant) => {
      if (p.role === 'tank') return { Icon: Shield, color: 'text-blue-400' }
      if (p.role === 'healer') return { Icon: Heart, color: 'text-green-400' }
      if (p.role === 'meleeDps') return { Icon: Sword, color: 'text-red-400' }
      return { Icon: Crosshair, color: 'text-orange-400' } // rangedDps
    }
    
    if (!participant) {
      return (
        <div 
          className="flex items-center gap-2 p-1.5 rounded border border-dashed border-purple-500/20 opacity-50"
          onDragOver={(e) => handleDragOver(e, groupId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, groupId, slot)}
        >
          <SlotIcon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
          <span className="text-muted-foreground/50 italic text-sm">{emptyText}</span>
        </div>
      )
    }
    
    const { Icon: ParticipantIcon, color: participantIconColor } = getParticipantIcon(participant)
    
    return (
      <div
        draggable={isAdmin}
        onDragStart={(e) => handleDragStart(e, participant, groupId, slot)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          e.stopPropagation()
          handleDragOver(e, groupId, participant.id)
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, groupId, slot, participant.id)}
        className={`flex items-center gap-2 p-1.5 rounded transition-all ${
          isAdmin ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        } ${
          isDragging 
            ? 'opacity-50 scale-95' 
            : isDropTarget && canSwap
              ? 'bg-cyan-500/30 ring-2 ring-cyan-400 scale-105'
              : isAdmin ? 'hover:bg-purple-500/10' : ''
        }`}
      >
        {isAdmin ? (
          <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
        ) : null}
        <ParticipantIcon className={`w-4 h-4 ${participantIconColor} flex-shrink-0`} />
        <span className={`font-medium min-w-0 flex-1 truncate ${classColors[participant.class] || "text-foreground"}`}>
          {participant.name}
        </span>
        <span className="text-muted-foreground/60 text-xs font-mono w-8 flex-shrink-0 text-right">
          {participant.ilvl}
        </span>
        <span className="text-cyan-400/70 text-xs font-mono w-12 text-center hidden lg:block" title={tEv("keyRange")}>
          {participant.keyMin}-{participant.keyMax}
        </span>
        <div className="flex items-center gap-1 w-10 justify-end">
          {participant.hasBloodlust && <BloodlustIcon className="w-4 h-4 text-orange-400" />}
          {participant.hasBattleRez && <BattleRezIcon className="w-4 h-4 text-green-400" />}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* En-tête : maquette v0 participant (simple) vs admin (carte néon) */}
      {isAdmin ? (
      <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 p-px shadow-2xl shadow-cyan-500/20">
        <div className="rounded-2xl bg-[#0a0614]/95 p-6 backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <Link
                href={homeHref}
                className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400"
              >
                <ArrowLeft className="h-4 w-4" />
                {tEv("backToDashboard")}
              </Link>
              <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                  {eventName}
                </span>
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{tEv("eventCode")}</span>
                  <code className="rounded bg-purple-500/20 px-2 py-0.5 font-mono text-cyan-400">
                    {eventCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCode}
                    className="h-7 w-7 p-0"
                    aria-label={tEv("copyCode")}
                  >
                    {codeCopied ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                {eventCreatedAt ? (
                  <span>
                    {tEv("createdOn")}: {eventCreatedAt}
                  </span>
                ) : null}
                <span>
                  {tEv("totalParticipants")}: {participants.length}
                </span>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 md:max-w-[50%]">
          <Button
            onClick={() => setClearParticipantsOpen(true)}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            disabled={participants.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {tEv("clearParticipants")}
          </Button>
          <Button
            onClick={handleAddParticipant}
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            {tEv("addParticipant")}
          </Button>
          <Button
            onClick={handleShuffle}
            disabled={shufflePending || participants.length === 0}
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            {shufflePending ? tEv("shuffling") : tEv("shuffleParties")}
          </Button>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Link
              href={homeHref}
              className="mt-1 text-muted-foreground transition-colors hover:text-cyan-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{eventName}</h1>
              <p className="font-mono text-sm text-muted-foreground">{eventCode}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {tEv("totalParticipants")}: {participants.length}
              </p>
            </div>
          </div>
          {viewerParticipant ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleEditParticipant(viewerParticipant)}
                className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Pencil className="mr-2 h-4 w-4" />
                {tEv("editCharacter")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLeaveConfirmOpen(true)}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {tEv("leaveEvent")}
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Joueurs : groupes masqués (style v0 participant) */}
      {!isAdmin && shuffledGroups.length > 0 && !arePartiesVisible ? (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Shuffle className="h-5 w-5 text-cyan-400" />
            {tEv("generatedGroups")}
          </h2>
          <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 py-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-cyan-300">{tEv("waitingGroupsTitle")}</p>
            <p className="mt-2 px-4 text-sm leading-relaxed text-muted-foreground">
              {tEv("waitingGroupsBody")}
            </p>
          </div>
        </div>
      ) : null}

      {/* Shuffled Groups Display — admin uniquement (drag & outils) */}
      {isAdmin && shuffledGroups.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-cyan-400" />
              {tEv("generatedGroups")}
            </h2>
            {isAdmin ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => void onToggleVisibility()}
                variant="outline"
                size="sm"
                className={arePartiesVisible 
                  ? "border-green-500/50 text-green-400 hover:bg-green-500/10" 
                  : "border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                }
              >
                {arePartiesVisible ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {tEv("groupsVisibleToParticipants")}
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    {tEv("groupsHiddenFromParticipants")}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setClearGroupsOpen(true)}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {tEv("clearGroups")}
              </Button>
              <Button
                onClick={handleAddGroup}
                variant="outline"
                size="sm"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                {tEv("addGroup")}
              </Button>
              <Button
                onClick={handleShuffle}
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                {tEv("shuffleAgain")}
              </Button>
            </div>
            ) : null}
          </div>
          
          {isAdmin ? (
            <p className="mb-4 text-xs text-muted-foreground">{tEv("dragHint")}</p>
          ) : null}

          {groupsToRender.length === 0 && !isAdmin && arePartiesVisible ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {viewerCharacterId == null
                ? tEv("needCharacterToViewGroup")
                : tEv("notInAGroupYet")}
            </p>
          ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupsToRender.map((group, index) => {
              const groupNumberRaw = shuffledGroups.findIndex(
                (x) => x.id === group.id,
              )
              const groupNumber =
                groupNumberRaw >= 0 ? groupNumberRaw + 1 : index + 1
              const hasBL = groupHasBL(group)
              const hasRez = groupHasRez(group)
              const hasTank = !!group.tank
              const hasHealer = !!group.healer
              const hasEnoughDps = group.dps.length >= 3
              const isOver = dragOverGroup === group.id
              
              // Check what's missing
              const missingItems: React.ReactNode[] = []
              if (!hasTank) missingItems.push(<Shield key="tank" className="w-4 h-4 text-blue-400" />)
              if (!hasHealer) missingItems.push(<Heart key="healer" className="w-4 h-4 text-green-400" />)
              if (!hasEnoughDps) missingItems.push(<Sword key="dps" className="w-4 h-4 text-red-400" />)
              if (!hasBL) missingItems.push(<BloodlustIcon key="bl" className="w-4 h-4 text-orange-400" />)
              if (!hasRez) missingItems.push(<BattleRezIcon key="rez" className="w-4 h-4 text-green-400" />)
              
              const hasWarning = missingItems.length > 0
              
              return (
                <div 
                  key={group.id}
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id, draggedItem?.slot || 'dps')}
                  className={`bg-[#0a0614]/80 rounded-xl border overflow-hidden transition-all ${
                    isOver 
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' 
                      : hasWarning
                        ? 'border-yellow-500/40'
                        : 'border-green-500/40'
                  }`}
                >
                  <div className="px-4 py-2 bg-purple-900/30 border-b border-purple-500/20 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      {!isAdmin && arePartiesVisible
                        ? `${tEv("yourGroupCardTitle")} · ${tEv("group")} ${groupNumber}`
                        : `${tEv("group")} ${groupNumber}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isAdmin && isGroupEmpty(group) ? (
                        <Button
                          onClick={() => handleDeleteGroup(group.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title={tEv("deleteGroup")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Status banner - warning for missing elements or green for complete */}
                  {hasWarning ? (
                    <div className="px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-yellow-500/80">{tEv("missing")}</span>
                      <div className="flex items-center gap-1.5">
                        {missingItems}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="text-green-500/80">{tEv("complete")}</span>
                    </div>
                  )}
                  <div className="p-3 space-y-1 text-sm">
                    {renderGroupParticipant(group.tank, group.id, 'tank', Shield, 'text-blue-400', tEv("noTank"))}
                    {renderGroupParticipant(group.healer, group.id, 'healer', Heart, 'text-green-400', tEv("noHealer"))}
                    {/* DPS slots - show 3 slots (max 5 per group: 1 tank + 1 healer + 3 dps) */}
                    {(() => {
                      const groupSize = getGroupSize(group)
                      const maxDpsSlots = Math.min(3, 5 - (group.tank ? 1 : 0) - (group.healer ? 1 : 0))
                      const slotsToShow = Math.max(3, Math.min(group.dps.length, maxDpsSlots))
                      
                      return Array.from({ length: slotsToShow }, (_, slotIndex) => {
                        const dps = group.dps[slotIndex]
                        if (!dps) {
                          // Don't show empty slot if group is at max size
                          if (groupSize >= 5) return null
                          return (
                            <div 
                              key={`empty-dps-${slotIndex}`}
                              className="flex items-center gap-2 p-1.5 rounded border border-dashed border-purple-500/20 opacity-50"
                              onDragOver={(e) => handleDragOver(e, group.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, group.id, 'dps')}
                            >
                              <Sword className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                              <span className="text-muted-foreground/50 italic text-sm">DPS {slotIndex + 1}</span>
                            </div>
                          )
                        }
                        const isDpsDragging = draggedItem?.participant.id === dps.id
                        const isDpsDropTarget = dragOverParticipant === dps.id && draggedItem?.participant.id !== dps.id
                        const canDpsSwap = draggedItem && draggedItem.slot === 'dps' && draggedItem.participant.id !== dps.id
                        
                        return (
                          <div
                            key={dps.id}
                            draggable={isAdmin}
                            onDragStart={(e) => handleDragStart(e, dps, group.id, 'dps')}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              e.stopPropagation()
                              handleDragOver(e, group.id, dps.id)
                            }}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, group.id, 'dps', dps.id)}
                            className={`flex items-center gap-2 p-1.5 rounded transition-all ${
                              isAdmin ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                            } ${
                              isDpsDragging 
                                ? 'opacity-50 scale-95' 
                                : isDpsDropTarget && canDpsSwap
                                  ? 'bg-cyan-500/30 ring-2 ring-cyan-400 scale-105'
                                  : isAdmin ? 'hover:bg-purple-500/10' : ''
                            }`}
                          >
                            {isAdmin ? (
                              <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                            ) : null}
                            {dps.role === "tank" ? (
                              <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            ) : dps.role === "healer" ? (
                              <Heart className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : dps.role === "meleeDps" ? (
                              <Sword className="w-4 h-4 text-red-400 flex-shrink-0" />
                            ) : (
                              <Crosshair className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            )}
                            <span className={`font-medium min-w-0 flex-1 truncate ${classColors[dps.class] || "text-foreground"}`}>
                              {dps.name}
                            </span>
                            <span className="text-muted-foreground/60 text-xs font-mono w-8 flex-shrink-0 text-right">
                              {dps.ilvl}
                            </span>
                            <span className="text-cyan-400/70 text-xs font-mono w-12 text-center hidden lg:block" title={tEv("keyRange")}>
                              {dps.keyMin}-{dps.keyMax}
                            </span>
                            <div className="flex items-center gap-1 w-10 justify-end">
                              {dps.hasBloodlust && <BloodlustIcon className="w-4 h-4 text-orange-400" />}
                              {dps.hasBattleRez && <BattleRezIcon className="w-4 h-4 text-green-400" />}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  {(() => {
                    const stats = getPartyGroupAggregateStats(group)
                    if (!stats) return null
                    return (
                      <div className="flex flex-col gap-1 border-t border-purple-500/20 bg-purple-950/40 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                        <p>
                          <span className="font-medium text-foreground">
                            {t('eventPage.avgIlvl')}
                          </span>{' '}
                          {stats.avgIlvl} ({stats.minIlvl} – {stats.maxIlvl})
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            {t('eventPage.keyRange')}
                          </span>{' '}
                          {stats.minKey} – {stats.maxKey}
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
          )}

          {isAdmin ? (
          <div 
            className={`mt-6 p-4 bg-[#0a0614]/60 rounded-xl border transition-all ${
              dragOverGroup === 'unassigned' 
                ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' 
                : 'border-orange-500/30'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverGroup('unassigned')
            }}
            onDragLeave={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement
              if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                setDragOverGroup(null)
              }
            }}
            onDrop={(e) => handleDropToUnassigned(e)}
          >
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              {tEv("unassignedParticipants")} ({unassignedParticipants.length})
            </h3>
            {unassignedParticipants.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {unassignedParticipants.map(participant => {
                  const isDragging = draggedItem?.participant.id === participant.id
                  const isDropTarget = dragOverParticipant === participant.id && draggedItem?.participant.id !== participant.id
                  const getRoleSlot = (role: string): 'tank' | 'healer' | 'dps' => {
                    if (role === 'tank') return 'tank'
                    if (role === 'healer') return 'healer'
                    return 'dps'
                  }
                  const slot = getRoleSlot(participant.role)
                  const canSwap = draggedItem && draggedItem.slot === slot && draggedItem.participant.id !== participant.id
                  const RoleIcon = participant.role === 'tank' ? Shield 
                    : participant.role === 'healer' ? Heart 
                    : participant.role === 'meleeDps' ? Sword 
                    : Crosshair
                  const roleColor = participant.role === 'tank' ? 'text-blue-400'
                    : participant.role === 'healer' ? 'text-green-400'
                    : participant.role === 'meleeDps' ? 'text-red-400'
                    : 'text-orange-400'
                  
                  return (
                    <div
                      key={participant.id}
                      draggable={isAdmin}
                      onDragStart={(e) => handleDragStart(e, participant, 'unassigned', slot)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setDragOverGroup('unassigned')
                        setDragOverParticipant(participant.id)
                      }}
                      onDrop={(e) => handleDropToUnassigned(e, participant.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg bg-purple-900/20 border border-purple-500/20 cursor-grab active:cursor-grabbing transition-all ${
                        isDragging 
                          ? 'opacity-50 scale-95' 
                          : isDropTarget && canSwap
                            ? 'bg-cyan-500/30 ring-2 ring-cyan-400 scale-105'
                            : 'hover:bg-purple-500/10 hover:border-purple-500/40'
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                      <RoleIcon className={`w-4 h-4 ${roleColor} flex-shrink-0`} />
                      <span className={`min-w-0 flex-1 font-medium truncate ${classColors[participant.class] || "text-foreground"}`}>
                        {participant.name}
                      </span>
                      <span className="flex-shrink-0 text-muted-foreground/60 text-xs font-mono">
                        {participant.ilvl}
                      </span>
                      <span className="text-cyan-400/70 text-xs font-mono ml-auto" title={tEv("keyRange")}>
                        {participant.keyMin}-{participant.keyMax}
                      </span>
                      <div className="flex items-center gap-1">
                        {participant.hasBloodlust && <BloodlustIcon className="w-4 h-4 text-orange-400" />}
                        {participant.hasBattleRez && <BattleRezIcon className="w-4 h-4 text-green-400" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground/50 italic border-2 border-dashed border-purple-500/20 rounded-lg">
                {tEv("noUnassigned")}
              </div>
            )}
          </div>
          ) : null}
        </div>
      )}

      {/* Groupes — vue joueur (cartes type v0 / event-participant-view) */}
      {!isAdmin && shuffledGroups.length > 0 && arePartiesVisible ? (
        <div className="w-full space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Shuffle className="h-5 w-5 text-cyan-400" />
            {participantGroupNumber != null
              ? `${tEv("yourGroupSection")} · ${tEv("group")} ${participantGroupNumber}`
              : tEv("yourGroupSection")}
          </h2>
          {groupsToRender.length === 0 ? (
            <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 py-10 text-center">
              <Shuffle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {viewerSid == null
                  ? tEv("needCharacterToViewGroup")
                  : tEv("notInAGroupYet")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groupsToRender.map((group) => {
                const groupNumberRaw = shuffledGroups.findIndex(
                  (x) => x.id === group.id,
                )
                const groupNumber =
                  groupNumberRaw >= 0 ? groupNumberRaw + 1 : 1
                const highlighted =
                  viewerCharacterId != null &&
                  partyGroupContainsCharacterId(group, viewerCharacterId)
                const stats = getPartyGroupAggregateStats(group)
                return (
                  <div
                    key={group.id}
                    className={cn(
                      "overflow-hidden rounded-xl border",
                      highlighted
                        ? "border-cyan-400/40"
                        : "border-purple-500/20",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-2",
                        highlighted ? "bg-cyan-900/20" : "bg-purple-900/20",
                      )}
                    >
                      <span className="font-semibold text-foreground">
                        {tEv("group")} {groupNumber}
                      </span>
                      {stats ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono font-bold text-blue-300"
                            title={t('eventPage.avgIlvl')}
                          >
                            {stats.avgIlvl}{' '}
                            <span className="font-normal opacity-90">
                              ({stats.minIlvl}–{stats.maxIlvl})
                            </span>
                          </span>
                          <span
                            className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-cyan-300"
                            title={t('eventPage.keyRange')}
                          >
                            {stats.minKey}–{stats.maxKey}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col className="w-[22%]" />
                          <col className="w-[18%]" />
                          <col className="w-[18%]" />
                          <col className="w-[12%]" />
                          <col className="w-[12%]" />
                          <col className="w-[9%]" />
                          <col className="w-[9%]" />
                        </colgroup>
                        <tbody>
                          {group.tank ? (
                            <PlayerRosterTableRow
                              key={`t-${group.tank.id}`}
                              participant={group.tank}
                              isViewer={group.tank.id === viewerSid}
                              classColors={classColors}
                              tEv={tEv}
                            />
                          ) : null}
                          {group.healer ? (
                            <PlayerRosterTableRow
                              key={`h-${group.healer.id}`}
                              participant={group.healer}
                              isViewer={group.healer.id === viewerSid}
                              classColors={classColors}
                              tEv={tEv}
                            />
                          ) : null}
                          {group.dps.map((dps) => (
                            <PlayerRosterTableRow
                              key={dps.id}
                              participant={dps}
                              isViewer={dps.id === viewerSid}
                              classColors={classColors}
                              tEv={tEv}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}

      {!isAdmin && shuffledGroups.length === 0 ? (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Shuffle className="h-5 w-5 text-cyan-400" />
            {tEv("generatedGroups")}
          </h2>
          <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 py-10 text-center">
            <Shuffle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">{tEv("noGroupsYetPlayer")}</p>
          </div>
        </div>
      ) : null}

      {/* Participants by role — aligné v0 (event-detail / event-participant-view) */}
      <div className="space-y-4">
        {!isAdmin && participants.length > 0 ? (
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Users className="h-5 w-5 text-purple-400" />
            {tEv("rosterSectionTitle")}
            <span className="text-muted-foreground">
              ({participants.length})
            </span>
          </h2>
        ) : null}
        <div
          className={cn(
            "grid",
            !isAdmin && participants.length > 0 ? "gap-4" : "gap-6",
          )}
        >
          {(isAdmin
            ? roleCategories
            : roleCategories.filter((c) => c.participants.length > 0)
          ).map(({ key, label, icon: Icon, color, participants: roleParticipants }) => (
            <div
              key={key}
              className="overflow-hidden rounded-xl border border-border bg-card/50"
            >
              <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
                <Icon className={`h-5 w-5 ${color}`} />
                {!isAdmin ? (
                  <h3 className="font-semibold text-foreground">{label}</h3>
                ) : (
                  <h2 className="font-semibold text-foreground">{label}</h2>
                )}
                <span className="text-sm text-muted-foreground">
                  ({roleParticipants.length})
                </span>
              </div>

              {roleParticipants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-border/50 text-sm text-muted-foreground">
                        <th className="w-[22%] px-4 py-2 text-left font-medium">
                          {tEv("columns.name")}
                        </th>
                        <th className="w-[18%] px-4 py-2 text-left font-medium">
                          {tEv("columns.class")}
                        </th>
                        <th className="w-[18%] px-4 py-2 text-left font-medium">
                          {tEv("columns.spec")}
                        </th>
                        <th className="w-[12%] px-4 py-2 text-center font-medium">
                          {tEv("columns.ilvl")}
                        </th>
                        <th className="w-[12%] px-4 py-2 text-center font-medium">
                          {tEv("keyRange")}
                        </th>
                        <th className="w-[9%] px-4 py-2 text-center font-medium">
                          <BloodlustIcon className="inline h-5 w-5 text-orange-400" />
                        </th>
                        <th className="w-[9%] px-4 py-2 text-center font-medium">
                          <BattleRezIcon className="inline h-5 w-5 text-green-400" />
                        </th>
                        {isAdmin ? <th className="w-[8%]" /> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {isAdmin
                        ? roleParticipants.map((participant) => (
                            <tr
                              key={participant.id}
                              className="group cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-secondary/20"
                              onClick={() => {
                                handleEditParticipant(participant)
                              }}
                            >
                              <td className="truncate px-4 py-2.5 font-medium">
                                {participant.name}
                              </td>
                              <td
                                className={`truncate px-4 py-2.5 ${classColors[participant.class] || "text-foreground"}`}
                              >
                                {participant.class}
                              </td>
                              <td className="truncate px-4 py-2.5 text-muted-foreground">
                                {participant.spec}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span
                                  className={cn(
                                    "inline-block rounded px-2 py-0.5 font-mono text-sm font-bold",
                                    participant.ilvl >= ITEM_LEVEL_TIER_HIGH
                                      ? "bg-purple-500/20 text-purple-300"
                                      : participant.ilvl >= ITEM_LEVEL_TIER_MID
                                        ? "bg-blue-500/20 text-blue-300"
                                        : participant.ilvl >= ITEM_LEVEL_TIER_LOW
                                          ? "bg-green-500/20 text-green-300"
                                          : "bg-muted/20 text-muted-foreground",
                                  )}
                                >
                                  {participant.ilvl}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className="font-mono text-sm text-cyan-400">
                                  {participant.keyMin}-{participant.keyMax}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {participant.hasBloodlust ? (
                                  <BloodlustIcon className="inline h-5 w-5 text-orange-400" />
                                ) : (
                                  <span className="text-muted-foreground/30">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {participant.hasBattleRez ? (
                                  <BattleRezIcon className="inline h-5 w-5 text-green-400" />
                                ) : (
                                  <span className="text-muted-foreground/30">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    void handleDeleteParticipantFromDialog(
                                      participant.id,
                                    )
                                  }}
                                  className="rounded p-1 text-red-400/60 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                                  title={tEv("deleteParticipant")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        : roleParticipants.map((participant) => (
                            <PlayerRosterTableRow
                              key={participant.id}
                              participant={participant}
                              isViewer={participant.id === viewerSid}
                              classColors={classColors}
                              tEv={tEv}
                            />
                          ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  {tEv("noParticipants")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ClearConfirmDialogV0
        open={clearParticipantsOpen}
        onOpenChange={setClearParticipantsOpen}
        type="participants"
        onConfirm={() => void onClearAllCharacters()}
      />
      <ClearConfirmDialogV0
        open={clearGroupsOpen}
        onOpenChange={setClearGroupsOpen}
        type="groups"
        onConfirm={() => void onClearParties()}
      />

      {/* Edit/Add Participant Dialog */}
      <EditParticipantDialogV0
        participant={editingParticipant}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={(p) => void handleSaveParticipant(p)}
        onDelete={(id) => void handleDeleteParticipantFromDialog(id)}
        mode={dialogMode}
      />

      {leaveConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => setLeaveConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-confirm-title"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="leave-confirm-title"
              className="text-lg font-semibold text-foreground"
            >
              {tEv("leaveConfirmTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {tEv("leaveConfirmBody")}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLeaveConfirmOpen(false)}
              >
                {tEv("leaveCancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setLeaveConfirmOpen(false)
                  void onViewerLeaveEvent?.()
                }}
              >
                {tEv("leaveConfirmAction")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
