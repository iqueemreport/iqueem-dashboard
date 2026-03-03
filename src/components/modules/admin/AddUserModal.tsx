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
import { useCreateUser } from "@/hooks/useCreateUser"

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const createUser = useCreateUser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    if (!password || password.length < 6) return
    await createUser.mutateAsync({
      email: email.trim(),
      password,
      full_name: fullName.trim() || undefined,
    })
    setEmail("")
    setPassword("")
    setFullName("")
    onOpenChange(false)
  }

  function handleClose() {
    setEmail("")
    setPassword("")
    setFullName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Kullanıcı Ekle
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-email">E-posta *</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="ornek@iqueem.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-password">Başlangıç Şifresi *</Label>
            <Input
              id="add-password"
              type="password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Kullanıcı ilk girişten sonra şifresini değiştirebilir.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-name">Ad Soyad (opsiyonel)</Label>
            <Input
              id="add-name"
              placeholder="Kullanıcı adı"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={createUser.isPending || password.length < 6}>
              {createUser.isPending ? "Oluşturuluyor..." : "Kullanıcı Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
