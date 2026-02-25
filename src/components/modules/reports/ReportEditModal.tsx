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
import { useHotels } from "@/hooks/useHotels"
import { useUpdateReport } from "@/hooks/useHotelReports"
import { toast } from "sonner"
import { format, subMonths, startOfMonth } from "date-fns"
import { tr } from "date-fns/locale"
import type { HotelReport } from "@/types"

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const d = subMonths(startOfMonth(new Date()), i)
  return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: tr }) }
})

interface ReportEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: HotelReport | null
}

export function ReportEditModal({ open, onOpenChange, report }: ReportEditModalProps) {
  const { data: hotels } = useHotels()
  const updateReport = useUpdateReport()

  const [hotelId, setHotelId] = useState("")
  const [title, setTitle] = useState("")
  const [periodMonth, setPeriodMonth] = useState(MONTH_OPTIONS[0].value)
  const [file, setFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  useEffect(() => {
    if (report) {
      setHotelId(report.hotel_id)
      setTitle(report.title)
      setPeriodMonth(report.period_month)
      setFile(null)
      setFileInputKey((k) => k + 1)
    }
  }, [report])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!report) return
    if (!hotelId || !title) {
      toast.error("Lütfen Otel ve Rapor Başlığı alanlarını doldurun.")
      return
    }
    try {
      await updateReport.mutateAsync({
        id: report.id,
        hotel_id: hotelId,
        title,
        period_month: periodMonth,
        file: file ?? undefined,
      })
      onOpenChange(false)
    } catch {
      // Hata useUpdateReport onError ile gösterilir
    }
  }

  function handleClose() {
    onOpenChange(false)
  }

  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raporu Düzenle</DialogTitle>
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
            <Label htmlFor="edit-title">Rapor Başlığı *</Label>
            <Input
              id="edit-title"
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
            <Label>PDF Dosyası</Label>
            <p className="text-sm text-muted-foreground">
              Mevcut: {report.file_name}
            </p>
            <Input
              key={fileInputKey}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Değiştirmek isterseniz yeni dosya seçin. Boş bırakırsanız mevcut PDF korunur.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={!hotelId || !title || updateReport.isPending}>
              {updateReport.isPending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
