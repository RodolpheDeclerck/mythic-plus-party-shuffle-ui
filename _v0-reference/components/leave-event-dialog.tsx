"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LeaveEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LeaveEventDialog({ open, onOpenChange, onConfirm }: LeaveEventDialogProps) {
  const t = useTranslations("event")

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-red-500/30 bg-red-950/60 backdrop-blur-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <DialogTitle className="text-red-300">{t("leaveEvent")}</DialogTitle>
              <DialogDescription className="mt-1 text-red-200/90">
                {t("confirmLeaveEvent")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

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
            {t("leaveEvent")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
