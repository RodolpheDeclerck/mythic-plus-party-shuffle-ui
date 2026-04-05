"use client"

import { use, useState } from "react"
import { NextIntlClientProvider } from "next-intl"
import { EventDetail } from "@/components/event-detail"
import { EventParticipantView } from "@/components/event-participant-view"
import { useAuth } from "@/context/auth-context"
import { useMessages, useLocale } from "next-intl"
import type { Participant, PartyGroup } from "@/types"

interface EventPageProps {
  params: Promise<{ id: string }>
}

function EventPageInner({ id }: { id: string }) {
  const { isAuthenticated } = useAuth()

  const initialParticipants: Participant[] = [
    { id: "p1", name: "Tankmaster", class: "Warrior", spec: "Protection", role: "tank", ilvl: 489, hasBloodlust: false, hasBattleRez: false, keyMin: 10, keyMax: 15 },
    { id: "p2", name: "Holylights", class: "Paladin", spec: "Holy", role: "healer", ilvl: 487, hasBloodlust: false, hasBattleRez: false, keyMin: 10, keyMax: 14 },
    { id: "p3", name: "Bladestorm", class: "Warrior", spec: "Fury", role: "meleeDps", ilvl: 491, hasBloodlust: false, hasBattleRez: false, keyMin: 12, keyMax: 18 },
    { id: "p4", name: "Frostbolt", class: "Mage", spec: "Frost", role: "rangedDps", ilvl: 490, hasBloodlust: true, hasBattleRez: false, keyMin: 12, keyMax: 17 },
    { id: "p5", name: "Shadowbolt", class: "Warlock", spec: "Affliction", role: "rangedDps", ilvl: 487, hasBloodlust: false, hasBattleRez: true, keyMin: 10, keyMax: 14 },
    { id: "p6", name: "Bearform", class: "Druid", spec: "Guardian", role: "tank", ilvl: 482, hasBloodlust: false, hasBattleRez: true, keyMin: 6, keyMax: 10 },
    { id: "p7", name: "Natureheal", class: "Druid", spec: "Restoration", role: "healer", ilvl: 484, hasBloodlust: false, hasBattleRez: true, keyMin: 8, keyMax: 12 },
    { id: "p8", name: "Starfall", class: "Druid", spec: "Balance", role: "rangedDps", ilvl: 485, hasBloodlust: false, hasBattleRez: true, keyMin: 8, keyMax: 12 },
    { id: "p9", name: "Shadowstrike", class: "Rogue", spec: "Subtlety", role: "meleeDps", ilvl: 488, hasBloodlust: false, hasBattleRez: false, keyMin: 10, keyMax: 15 },
    { id: "p10", name: "Lavaburster", class: "Shaman", spec: "Elemental", role: "rangedDps", ilvl: 482, hasBloodlust: true, hasBattleRez: false, keyMin: 6, keyMax: 11 },
  ]

  const [participants, setParticipants] = useState(initialParticipants)

  const mockGroups: PartyGroup[] = [
    { id: "g1", tank: participants[0], healer: participants[1], dps: [participants[2], participants[3], participants[4]] },
    { id: "g2", tank: participants[5], healer: undefined as any, dps: [participants[7], participants[9]] },
  ]

  const myParticipantId = "p4"

  const handleUpdateParticipant = (updatedParticipant: Participant) => {
    setParticipants(prev => prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p))
  }

  const handleLeaveEvent = () => {
    setParticipants(prev => prev.filter(p => p.id !== myParticipantId))
  }

  if (isAuthenticated) {
    return <EventDetail eventId={id} isAdmin={true} />
  }

  return (
    <EventParticipantView
      eventId={id}
      eventName="Weekly M+ Push"
      eventCode={id}
      participants={participants}
      groups={mockGroups}
      groupsVisible={true}
      myParticipantId={myParticipantId}
      onUpdateParticipant={handleUpdateParticipant}
      onLeaveEvent={handleLeaveEvent}
    />
  )
}

export default function EventPage({ params }: EventPageProps) {
  const { id } = use(params)
  const messages = useMessages()
  const locale = useLocale()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <main className="relative min-h-screen flex items-start justify-center px-4 py-8 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#0a0614]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50" />

        <div className="relative z-10 w-full max-w-5xl py-8">
          <EventPageInner id={id} />
        </div>
      </main>
    </NextIntlClientProvider>
  )
}
