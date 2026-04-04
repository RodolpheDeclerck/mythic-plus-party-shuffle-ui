"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ClearConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  type: "participants" | "groups"
}

export function ClearConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
}: ClearConfirmDialogProps) {
  const t = useTranslations("event")

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const messageKey = type === "participants" ? "confirmClearParticipants" : "confirmClearGroups"
  const titleKey = type === "participants" ? "clearParticipants" : "clearGroups"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-red-500/30 bg-red-950/60 backdrop-blur-md">
        <div className="flex gap-4">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-lg font-bold text-red-300">
              {t(titleKey)}
            </DialogTitle>
            <DialogDescription className="mt-1 text-red-200/90">
              {t(messageKey)}
            </DialogDescription>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 border-red-500/50 text-red-400/80 hover:bg-red-500/15"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600/60 text-red-200 border border-red-500/60 hover:bg-red-600/80"
          >
            {t(titleKey)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
