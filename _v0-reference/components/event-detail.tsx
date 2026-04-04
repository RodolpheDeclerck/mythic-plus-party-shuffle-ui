"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft, Copy, Check, Shield, Heart, Sword, Crosshair, Shuffle, Users, GripVertical, Plus, Trash2, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BloodlustIcon, BattleRezIcon } from "@/components/wow-icons"
import { EditParticipantDialog } from "@/components/edit-participant-dialog"
import { JoinEventDialog } from "@/components/join-event-dialog"
import { ClearConfirmDialog } from "@/components/clear-confirm-dialog"

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

interface EventDetailProps {
  eventId: string
  isAdmin?: boolean
}

// Class colors matching WoW
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

// Mock event data
const mockEvent = {
  id: "1",
  name: "Weekly M+ Push",
  code: "ABC123",
  createdAt: "2024-01-15",
  participants: [
    { id: "1", name: "Tankmaster", class: "Warrior", spec: "Protection", role: "tank" as const, ilvl: 489, hasBloodlust: false, hasBattleRez: false, keyMin: 10, keyMax: 15 },
    { id: "2", name: "Shieldbearer", class: "Paladin", spec: "Protection", role: "tank" as const, ilvl: 485, hasBloodlust: false, hasBattleRez: false, keyMin: 8, keyMax: 12 },
    { id: "3", name: "Bearform", class: "Druid", spec: "Guardian", role: "tank" as const, ilvl: 482, hasBloodlust: false, hasBattleRez: true, keyMin: 6, keyMax: 10 },
    { id: "4", name: "Holylights", class: "Paladin", spec: "Holy", role: "healer" as const, ilvl: 487, hasBloodlust: false, hasBattleRez: false, keyMin: 10, keyMax: 14 },
    { id: "5", name: "Natureheal", class: "Druid", spec: "Restoration", role: "healer" as const, ilvl: 484, hasBloodlust: false, hasBattleRez: true, keyMin: 8, keyMax: 12 },
    { id: "6", name: "Mistweaver", class: "Monk", spec: "Mistweaver", role: "healer" as const, ilvl: 481, hasBloodlust: false, hasBattleRez: false, keyMin: 5, keyMax: 10 },
    { id: "7", name: "Bladestorm", class: "Warrior", spec: "Fury", role: "meleeDps" as const, ilvl: 491, hasBloodlust: false, hasBattleRez: false, keyMin: 12, keyMax: 18 },
    { id: "8", name: "Shadowstrike", class: "Rogue", spec: "Subtlety", role: "meleeDps" as const, ilvl: 488, hasBloodlust: false, hasBattleRez: false, keyMin: 10, keyMax: 15 },
    { id: "9", name: "Frostmourne", class: "Death Knight", spec: "Frost", role: "meleeDps" as const, ilvl: 486, hasBloodlust: false, hasBattleRez: true, keyMin: 8, keyMax: 13 },
    { id: "10", name: "Retribution", class: "Paladin", spec: "Retribution", role: "meleeDps" as const, ilvl: 483, hasBloodlust: false, hasBattleRez: false, keyMin: 6, keyMax: 11 },
    { id: "11", name: "Windwalker", class: "Monk", spec: "Windwalker", role: "meleeDps" as const, ilvl: 480, hasBloodlust: false, hasBattleRez: false, keyMin: 5, keyMax: 10 },
    { id: "12", name: "Frostbolt", class: "Mage", spec: "Frost", role: "rangedDps" as const, ilvl: 490, hasBloodlust: true, hasBattleRez: false, keyMin: 12, keyMax: 17 },
    { id: "13", name: "Shadowbolt", class: "Warlock", spec: "Affliction", role: "rangedDps" as const, ilvl: 487, hasBloodlust: false, hasBattleRez: true, keyMin: 10, keyMax: 14 },
    { id: "14", name: "Starfall", class: "Druid", spec: "Balance", role: "rangedDps" as const, ilvl: 485, hasBloodlust: false, hasBattleRez: true, keyMin: 8, keyMax: 12 },
    { id: "15", name: "Lavaburster", class: "Shaman", spec: "Elemental", role: "rangedDps" as const, ilvl: 482, hasBloodlust: true, hasBattleRez: false, keyMin: 6, keyMax: 11 },
    { id: "16", name: "Multishot", class: "Hunter", spec: "Marksmanship", role: "rangedDps" as const, ilvl: 479, hasBloodlust: true, hasBattleRez: false, keyMin: 4, keyMax: 9 },
  ]
}



export function EventDetail({ eventId, isAdmin = false }: EventDetailProps) {
  const t = useTranslations("event")
  const [codeCopied, setCodeCopied] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [shuffledGroups, setShuffledGroups] = useState<PartyGroup[]>([])
  const [draggedItem, setDraggedItem] = useState<{participant: Participant, fromGroupId: string | 'unassigned', slot: 'tank' | 'healer' | 'dps'} | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)
  const [dragOverParticipant, setDragOverParticipant] = useState<string | null>(null)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"edit" | "add">("edit")
  const [participants, setParticipants] = useState(mockEvent.participants)
  const [groupsVisibleToParticipants, setGroupsVisibleToParticipants] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [clearParticipantsOpen, setClearParticipantsOpen] = useState(false)
  const [clearGroupsOpen, setClearGroupsOpen] = useState(false)
  
  // In real app, fetch event by eventId
  const event = { ...mockEvent, participants }

  const tanks = event.participants.filter(p => p.role === "tank")
  const healers = event.participants.filter(p => p.role === "healer")
  const meleeDps = event.participants.filter(p => p.role === "meleeDps")
  const rangedDps = event.participants.filter(p => p.role === "rangedDps")
  const allDps = [...meleeDps, ...rangedDps]

  // Shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleShuffle = () => {
    setIsShuffling(true)
    
    setTimeout(() => {
      const shuffledTanks = shuffleArray(tanks)
      const shuffledHealers = shuffleArray(healers)
      const shuffledMelee = shuffleArray(meleeDps)
      const shuffledRanged = shuffleArray(rangedDps)
      
      const numGroups = Math.min(
        shuffledTanks.length,
        shuffledHealers.length,
        Math.floor(event.participants.length / 5)
      )
      
      if (numGroups === 0) {
        setShuffledGroups([])
        setIsShuffling(false)
        return
      }
      
      const groups: PartyGroup[] = []
      const usedParticipants = new Set<string>()
      
      for (let i = 0; i < numGroups; i++) {
        const tank = shuffledTanks[i]
        const healer = shuffledHealers[i]
        usedParticipants.add(tank.id)
        usedParticipants.add(healer.id)
        
        groups.push({
          id: `group-${i}`,
          tank,
          healer,
          dps: []
        })
      }
      
      // Add melee DPS (at least 1 per group)
      for (let i = 0; i < numGroups; i++) {
        const melee = shuffledMelee.find(m => !usedParticipants.has(m.id))
        if (melee) {
          groups[i].dps.push(melee)
          usedParticipants.add(melee.id)
        }
      }
      
      // Add ranged DPS (at least 1 per group)
      for (let i = 0; i < numGroups; i++) {
        const ranged = shuffledRanged.find(r => !usedParticipants.has(r.id))
        if (ranged) {
          groups[i].dps.push(ranged)
          usedParticipants.add(ranged.id)
        }
      }
      
      // Fill remaining DPS slots
      const remainingDps = [...shuffledMelee, ...shuffledRanged].filter(d => !usedParticipants.has(d.id))
      for (const dps of shuffleArray(remainingDps)) {
        const targetGroup = groups.filter(g => g.dps.length < 3).sort((a, b) => a.dps.length - b.dps.length)[0]
        if (targetGroup) {
          targetGroup.dps.push(dps)
          usedParticipants.add(dps.id)
        }
      }
      
      setShuffledGroups(groups)
      setIsShuffling(false)
    }, 500)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(event.code)
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

  const handleSaveParticipant = (updatedParticipant: Participant) => {
    if (dialogMode === "add") {
      setParticipants(prev => [...prev, updatedParticipant])
    } else {
      setParticipants(prev => 
        prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
      )
    }
    // Also update in shuffled groups if present
    setShuffledGroups(prev => prev.map(group => ({
      ...group,
      tank: group.tank?.id === updatedParticipant.id ? updatedParticipant : group.tank,
      healer: group.healer?.id === updatedParticipant.id ? updatedParticipant : group.healer,
      dps: group.dps.map(d => d.id === updatedParticipant.id ? updatedParticipant : d)
    })))
  }

  const handleDeleteParticipant = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId))
    // Also remove from shuffled groups
    setShuffledGroups(prev => prev.map(group => ({
      ...group,
      tank: group.tank?.id === participantId ? null : group.tank,
      healer: group.healer?.id === participantId ? null : group.healer,
      dps: group.dps.filter(d => d.id !== participantId)
    })))
  }



  const roleCategories = [
    { key: "tank", label: t("roles.tank"), icon: Shield, color: "text-blue-400", participants: tanks },
    { key: "healer", label: t("roles.healer"), icon: Heart, color: "text-green-400", participants: healers },
    { key: "meleeDps", label: t("roles.meleeDps"), icon: Sword, color: "text-red-400", participants: meleeDps },
    { key: "rangedDps", label: t("roles.rangedDps"), icon: Crosshair, color: "text-orange-400", participants: rangedDps },
  ]

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
        draggable
        onDragStart={(e) => handleDragStart(e, participant, groupId, slot)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          e.stopPropagation()
          handleDragOver(e, groupId, participant.id)
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, groupId, slot, participant.id)}
        className={`flex items-center gap-2 p-1.5 rounded cursor-grab active:cursor-grabbing transition-all ${
          isDragging 
            ? 'opacity-50 scale-95' 
            : isDropTarget && canSwap
              ? 'bg-cyan-500/30 ring-2 ring-cyan-400 scale-105'
              : 'hover:bg-purple-500/10'
        }`}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
        <ParticipantIcon className={`w-4 h-4 ${participantIconColor} flex-shrink-0`} />
        <span className={`font-medium w-20 truncate ${classColors[participant.class] || "text-foreground"}`}>
          {participant.name}
        </span>
        <span className="text-muted-foreground text-xs w-16 truncate hidden sm:block">
          {participant.spec}
        </span>
        <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded w-10 text-center ${
          participant.ilvl >= 490 ? "bg-purple-500/20 text-purple-300" :
          participant.ilvl >= 480 ? "bg-blue-500/20 text-blue-300" :
          participant.ilvl >= 470 ? "bg-green-500/20 text-green-300" :
          "bg-muted/20 text-muted-foreground"
        }`}>
          {participant.ilvl}
        </span>
        <span className="text-cyan-400/70 text-xs font-mono w-12 text-center hidden lg:block" title={t("keyRange")}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToDashboard")}
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <span>{t("eventCode")}:</span>
              <code className="px-2 py-0.5 bg-purple-500/20 rounded text-cyan-400 font-mono">
                {event.code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="h-6 w-6 p-0"
              >
                {codeCopied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <span>
              {t("createdOn")}: {event.createdAt}
            </span>
            <span>
              {t("totalParticipants")}: {event.participants.length}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setJoinDialogOpen(true)}
            className="bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("addParticipant")}
          </Button>
          <div className="w-px h-6 bg-purple-500/30" />
          <Button
            onClick={() => setClearParticipantsOpen(true)}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            disabled={participants.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("clearParticipants")}
          </Button>
          <Button
            onClick={handleShuffle}
            disabled={isShuffling || tanks.length === 0 || healers.length === 0 || allDps.length < 3}
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            {isShuffling ? t("shuffling") : t("shuffleParties")}
          </Button>
        </div>
      </div>

      {/* Shuffled Groups Display */}
      {shuffledGroups.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              {t("generatedGroups")}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setGroupsVisibleToParticipants(!groupsVisibleToParticipants)}
                variant="outline"
                size="sm"
                className={groupsVisibleToParticipants 
                  ? "border-green-500/50 text-green-400 hover:bg-green-500/10" 
                  : "border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                }
              >
                {groupsVisibleToParticipants ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {t("groupsVisibleToParticipants")}
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    {t("groupsHiddenFromParticipants")}
                  </>
                )}
              </Button>
          <Button
            onClick={() => setClearGroupsOpen(true)}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            disabled={shuffledGroups.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("clearGroups")}
          </Button>
              <Button
                onClick={handleAddGroup}
                variant="outline"
                size="sm"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("addGroup")}
              </Button>
              <Button
                onClick={handleShuffle}
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                {t("shuffleAgain")}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">
            {t("dragHint")}
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shuffledGroups.map((group, index) => {
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
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">
                        {t("group")} {index + 1}
                      </h3>
                      {(() => {
                        const members = [group.tank, group.healer, ...group.dps].filter(Boolean) as typeof group.dps
                        if (members.length === 0) return null
                        const ilvls = members.map(m => m.ilvl)
                        const keys = members.map(m => ({ min: m.keyMin, max: m.keyMax }))
                        const minIlvl = Math.min(...ilvls)
                        const maxIlvl = Math.max(...ilvls)
                        const minKey = Math.min(...keys.map(k => k.min))
                        const maxKey = Math.max(...keys.map(k => k.max))
                        return (
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-bold font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300`}>
                              {minIlvl}-{maxIlvl}
                            </span>
                            <span className="font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                              +{minKey}-{maxKey}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      {isGroupEmpty(group) && (
                        <Button
                          onClick={() => handleDeleteGroup(group.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title={t("deleteGroup")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Status banner - warning for missing elements or green for complete */}
                  {hasWarning ? (
                    <div className="px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-yellow-500/80">{t("missing")}</span>
                      <div className="flex items-center gap-1.5">
                        {missingItems}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="text-green-500/80">{t("complete")}</span>
                    </div>
                  )}
                  <div className="p-3 space-y-1 text-sm">
                    {renderGroupParticipant(group.tank, group.id, 'tank', Shield, 'text-blue-400', t("noTank"))}
                    {renderGroupParticipant(group.healer, group.id, 'healer', Heart, 'text-green-400', t("noHealer"))}
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
                            draggable
                            onDragStart={(e) => handleDragStart(e, dps, group.id, 'dps')}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              e.stopPropagation()
                              handleDragOver(e, group.id, dps.id)
                            }}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, group.id, 'dps', dps.id)}
                            className={`flex items-center gap-2 p-1.5 rounded cursor-grab active:cursor-grabbing transition-all ${
                              isDpsDragging 
                                ? 'opacity-50 scale-95' 
                                : isDpsDropTarget && canDpsSwap
                                  ? 'bg-cyan-500/30 ring-2 ring-cyan-400 scale-105'
                                  : 'hover:bg-purple-500/10'
                            }`}
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                            {dps.role === "tank" ? (
                              <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            ) : dps.role === "healer" ? (
                              <Heart className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : dps.role === "meleeDps" ? (
                              <Sword className="w-4 h-4 text-red-400 flex-shrink-0" />
                            ) : (
                              <Crosshair className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            )}
                            <span className={`font-medium w-20 truncate ${classColors[dps.class] || "text-foreground"}`}>
                              {dps.name}
                            </span>
                            <span className="text-muted-foreground text-xs w-16 truncate hidden sm:block">
                              {dps.spec}
                            </span>
                            <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded w-10 text-center ${
                              dps.ilvl >= 490 ? "bg-purple-500/20 text-purple-300" :
                              dps.ilvl >= 480 ? "bg-blue-500/20 text-blue-300" :
                              dps.ilvl >= 470 ? "bg-green-500/20 text-green-300" :
                              "bg-muted/20 text-muted-foreground"
                            }`}>
                              {dps.ilvl}
                            </span>
                            <span className="text-cyan-400/70 text-xs font-mono w-12 text-center hidden lg:block" title={t("keyRange")}>
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
                </div>
              )
            })}
          </div>
          
          {/* Unassigned Participants - Always visible when groups exist */}
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
              {t("unassignedParticipants")} ({unassignedParticipants.length})
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
                      draggable
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
                      <span className={`font-medium truncate ${classColors[participant.class] || "text-foreground"}`}>
                        {participant.name}
                      </span>
                      <span className="text-muted-foreground text-xs truncate hidden sm:block">
                        {participant.spec}
                      </span>
                      <span className="text-muted-foreground/60 text-xs font-mono">
                        {participant.ilvl}
                      </span>
                      <span className="text-cyan-400/70 text-xs font-mono ml-auto" title={t("keyRange")}>
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
                {t("noUnassigned")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants by role */}
      <div className="grid gap-6">
        {roleCategories.map(({ key, label, icon: Icon, color, participants: roleParticipants }) => (
          <div key={key} className="bg-card/50 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <h2 className="font-semibold text-foreground">{label}</h2>
              <span className="text-sm text-muted-foreground">({roleParticipants.length})</span>
            </div>
            
            {roleParticipants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-border/50 text-sm text-muted-foreground">
                      <th className="px-4 py-2 text-left font-medium w-[20%]">{t("columns.name")}</th>
                      <th className="px-4 py-2 text-left font-medium w-[18%]">{t("columns.class")}</th>
                      <th className="px-4 py-2 text-left font-medium w-[18%]">{t("columns.spec")}</th>
                      <th className="px-4 py-2 text-center font-medium w-[12%]">{t("columns.ilvl")}</th>
                      <th className="px-4 py-2 text-center font-medium w-[12%]">{t("keyRange")}</th>
                      <th className="px-4 py-2 font-medium text-center w-[10%]">
                        <BloodlustIcon className="w-5 h-5 inline text-orange-400" />
                      </th>
                      <th className="px-4 py-2 font-medium text-center w-[10%]">
                        <BattleRezIcon className="w-5 h-5 inline text-green-400" />
                      </th>
                      <th className="w-[8%]" />
                    </tr>
                  </thead>
                  <tbody>
                    {roleParticipants.map((participant) => (
                      <tr 
                        key={participant.id} 
                        className="group border-b border-border/30 last:border-0 hover:bg-secondary/20 cursor-pointer transition-colors"
                        onClick={() => handleEditParticipant(participant)}
                      >
                        <td className="px-4 py-2.5 font-medium truncate">{participant.name}</td>
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
                          <span className="text-cyan-400 font-mono text-sm">
                            {participant.keyMin}-{participant.keyMax}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {participant.hasBloodlust ? (
                            <BloodlustIcon className="w-5 h-5 inline text-orange-400" />
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {participant.hasBattleRez ? (
                            <BattleRezIcon className="w-5 h-5 inline text-green-400" />
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteParticipant(participant.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-red-400/60 hover:text-red-400"
                            title={t("deleteParticipant")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {t("noParticipants")}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clear Participants Dialog */}
      <ClearConfirmDialog
        open={clearParticipantsOpen}
        onOpenChange={setClearParticipantsOpen}
        type="participants"
        onConfirm={() => {
          setParticipants([])
          setShuffledGroups([])
        }}
      />

      {/* Clear Groups Dialog */}
      <ClearConfirmDialog
        open={clearGroupsOpen}
        onOpenChange={setClearGroupsOpen}
        type="groups"
        onConfirm={() => setShuffledGroups([])}
      />

      {/* Join Event Dialog */}
      <JoinEventDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        onJoin={(participant) => setParticipants(prev => [...prev, participant])}
      />

      {/* Edit/Add Participant Dialog */}
      <EditParticipantDialog
        participant={editingParticipant}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveParticipant}
        onDelete={handleDeleteParticipant}
        mode={dialogMode}
      />
    </div>
  )
}
