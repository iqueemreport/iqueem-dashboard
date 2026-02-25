import { useState } from "react"
import { UserPlus } from "lucide-react"
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
import { useInviteUser } from "@/hooks/useInviteUser"

interface InviteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteUserModal({ open, onOpenChange }: InviteUserModalProps) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const inviteUser = useInviteUser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    await inviteUser.mutateAsync({ email: email.trim(), full_name: fullName.trim() || undefined })
    setEmail("")
    setFullName("")
    onOpenChange(false)
  }

  function handleClose() {
    setEmail("")
    setFullName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Kullanıcı Davet Et
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">E-posta *</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="ornek@iqueem.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Ad Soyad (opsiyonel)</Label>
            <Input
              id="invite-name"
              placeholder="Kullanıcı adı"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Davet edilen kullanıcıya e-posta ile aktivasyon linki gönderilecektir.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={inviteUser.isPending}>
              {inviteUser.isPending ? "Gönderiliyor..." : "Davet Gönder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
