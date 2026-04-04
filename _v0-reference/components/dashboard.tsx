"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Plus, Trash2, ExternalLink, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Event {
  id: string
  name: string
  code: string
  createdAt: string
  participants: number
}

// Mock data - replace with actual API calls
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Weekly Mythic+ Session",
    code: "WMS2024",
    createdAt: "2024-03-15",
    participants: 12,
  },
  {
    id: "2",
    name: "Guild Dungeon Night",
    code: "GDN001",
    createdAt: "2024-03-20",
    participants: 8,
  },
  {
    id: "3",
    name: "PUG Training",
    code: "PUG123",
    createdAt: "2024-03-25",
    participants: 5,
  },
]

export function Dashboard() {
  const t = useTranslations("dashboard")
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
    setDeleteConfirmId(null)
  }

  const handleOpenEvent = (id: string) => {
    router.push(`/event/${id}`)
  }

  const handleCreateEvent = () => {
    router.push("/event/create")
  }

  const formatDate = (dateStr: string) => {
    return dateStr
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-1">
            {t("eyebrow")}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Button
          onClick={handleCreateEvent}
          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("createEvent")}
        </Button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-purple-500/20 bg-[#0a0614]/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("noEvents")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {t("noEventsDescription")}
          </p>
          <Button
            onClick={handleCreateEvent}
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-semibold border border-cyan-400/50 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createEvent")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative rounded-xl p-[1px] bg-gradient-to-r from-purple-500/30 via-cyan-500/20 to-purple-500/30"
            >
              <div className="rounded-xl bg-[#0a0614]/95 backdrop-blur-sm p-5">
                {deleteConfirmId === event.id ? (
                  // Delete confirmation
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground">
                      {t("confirmDelete")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {t("deleteCancel")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                      >
                        {t("deleteConfirm")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Event details
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-mono text-xs bg-cyan-400/10 px-2 py-0.5 rounded">
                            {event.code}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {t("createdOn")} {formatDate(event.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {event.participants} {t("participants")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEvent(event.id)}
                        className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50"
                      >
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        {t("openEvent")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(event.id)}
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
