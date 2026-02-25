import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Hotel } from "@/types"

interface HotelFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotel: Hotel | null
  onSubmit: (data: { name: string; country: string; status: "active" | "inactive" }) => Promise<void>
}

export function HotelForm({
  open,
  onOpenChange,
  hotel,
  onSubmit,
}: HotelFormProps) {
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")

  useEffect(() => {
    if (hotel) {
      setName(hotel.name)
      setCountry(hotel.country)
      setStatus(hotel.status)
    } else {
      setName("")
      setCountry("")
      setStatus("active")
    }
  }, [hotel, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !country.trim()) return
    await onSubmit({ name: name.trim(), country: country.trim(), status })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hotel ? "Otel Düzenle" : "Yeni Otel Ekle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Otel Adı</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Otel adı"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Ülke</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Ülke"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Durum</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
