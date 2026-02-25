import { useState } from "react"
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
import { useHotels } from "@/hooks/useHotels"
import { useUploadReport } from "@/hooks/useHotelReports"
import { toast } from "sonner"
import { useStore } from "@/stores/auth-store"
import { format, subMonths, startOfMonth } from "date-fns"
import { tr } from "date-fns/locale"

interface ReportUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const d = subMonths(startOfMonth(new Date()), i)
  return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: tr }) }
})

export function ReportUploadModal({ open, onOpenChange }: ReportUploadModalProps) {
  const { user } = useStore()
  const { data: hotels } = useHotels()
  const uploadReport = useUploadReport()

  const [hotelId, setHotelId] = useState("")
  const [title, setTitle] = useState("")
  const [periodMonth, setPeriodMonth] = useState(MONTH_OPTIONS[0].value)
  const [file, setFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) {
      toast.error("Oturum bulunamadı. Lütfen tekrar giriş yapın.")
      return
    }
    if (!hotelId || !title || !file) {
      toast.error("Lütfen Otel, Rapor Başlığı ve PDF dosyası alanlarını doldurun.")
      return
    }
    try {
      await uploadReport.mutateAsync({
        hotel_id: hotelId,
        title,
        period_month: periodMonth,
        file,
        uploaded_by: user.id,
      })
      setHotelId("")
      setTitle("")
      setPeriodMonth(MONTH_OPTIONS[0].value)
      setFile(null)
      setFileInputKey((k) => k + 1)
      onOpenChange(false)
    } catch {
      // Hata useUploadReport onError ile gösterilir
    }
  }

  function handleClose() {
    setHotelId("")
    setTitle("")
    setPeriodMonth(MONTH_OPTIONS[0].value)
    setFile(null)
    setFileInputKey((k) => k + 1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rapor Yükle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Otel *</Label>
            <Select value={hotelId || "__pick__"} onValueChange={(v) => setHotelId(v === "__pick__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__pick__">Seçin</SelectItem>
                {hotels?.filter((h) => h.status === "active").map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Rapor Başlığı *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Aylık Performans Raporu"
            />
          </div>
          <div className="space-y-2">
            <Label>Dönem *</Label>
            <Select value={periodMonth} onValueChange={setPeriodMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>PDF Dosyası *</Label>
            <Input
              key={fileInputKey}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={!hotelId || !title || !file}>
              Yükle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
