import { useState } from "react"
import { Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor")
      return
    }
    setIsPending(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success("Şifre güncellendi")
      setNewPassword("")
      setConfirmPassword("")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Şifre güncellenemedi")
    } finally {
      setIsPending(false)
    }
  }

  function handleClose() {
    setNewPassword("")
    setConfirmPassword("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Şifre Değiştir
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Yeni Şifre *</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="En az 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Yeni Şifre (Tekrar) *</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Şifreyi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending || newPassword.length < 6 || newPassword !== confirmPassword}>
              {isPending ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
