import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportList } from "@/components/modules/reports/ReportList"
import { ReportUploadModal } from "@/components/modules/reports/ReportUploadModal"
import { useHotels } from "@/hooks/useHotels"
import { format, subMonths, startOfMonth } from "date-fns"
import { tr } from "date-fns/locale"

const MONTH_OPTIONS = [
  { value: "__all__", label: "Tüm dönemler" },
  ...Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(startOfMonth(new Date()), i)
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: tr }) }
  }),
]

export function ReportsPage() {
  const [hotelId, setHotelId] = useState("")
  const [periodMonth, setPeriodMonth] = useState("__all__")
  const [uploadOpen, setUploadOpen] = useState(false)

  const { data: hotels } = useHotels()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={hotelId || "__all__"} onValueChange={(v) => setHotelId(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Otel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tümü</SelectItem>
              {hotels?.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodMonth} onValueChange={setPeriodMonth}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Dönem" />
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
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Rapor Yükle
        </Button>
      </div>

      <ReportList
        hotelId={hotelId || undefined}
        periodMonth={periodMonth === "__all__" ? undefined : periodMonth}
      />

      <ReportUploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
