import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHotels } from "@/hooks/useHotels"
import { useStore as useSidebarStore } from "@/stores/sidebar-store"
import { PLATFORMS } from "@/constants/platforms"
import { COUNTRIES } from "@/constants/countries"
import { format, startOfMonth, subMonths } from "date-fns"
import { tr } from "date-fns/locale"
import { toast } from "sonner"
import type { Currency } from "@/types"

const MONTH_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const d = subMonths(startOfMonth(new Date()), i)
  return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: tr }) }
})

interface BudgetRow {
  hotel_id: string
  platform: string
  target_country: string
  currency: Currency
  amount: string
  notes: string
}

interface BudgetFormSubmitRow {
  hotel_id: string
  platform: string
  target_country: string
  currency: Currency
  amount: number
  notes?: string | null
}

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  month: string
  onSubmit: (data: { rows: BudgetFormSubmitRow[]; month: string }) => Promise<void>
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "EUR", label: "€ EUR" },
  { value: "USD", label: "$ USD" },
  { value: "TRY", label: "₺ TRY" },
]

const emptyRow = (): BudgetRow => ({
  hotel_id: "",
  platform: "",
  target_country: "",
  currency: "EUR",
  amount: "",
  notes: "",
})

export function BudgetForm({
  open,
  onOpenChange,
  month: initialMonth,
  onSubmit,
}: BudgetFormProps) {
  const { data: hotels } = useHotels()
  const { collapsed: sidebarCollapsed } = useSidebarStore()
  const [month, setMonth] = useState(initialMonth)
  const [rows, setRows] = useState<BudgetRow[]>([emptyRow()])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) setMonth(initialMonth)
  }, [open, initialMonth])

  function addRow() {
    setRows((r) => [...r, emptyRow()])
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof BudgetRow, value: string) {
    setRows((r) =>
      r.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = rows.filter(
      (r) =>
        r.hotel_id &&
        r.platform &&
        r.target_country &&
        r.amount &&
        !isNaN(Number(r.amount))
    )
    if (!valid.length) {
      toast.error("Lütfen en az bir satır için Otel, Platform, Ülke ve Tutar alanlarını doldurun.")
      return
    }
    setIsSubmitting(true)
    try {
      const timeoutMs = 20_000
      await Promise.race([
        onSubmit({
          month,
          rows: valid.map((r) => ({
            hotel_id: r.hotel_id,
            platform: r.platform,
            target_country: r.target_country,
            currency: r.currency,
            amount: Number(r.amount),
            notes: r.notes || null,
          })),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("İşlem zaman aşımına uğradı. Bağlantıyı kontrol edip tekrar deneyin.")), timeoutMs)
        ),
      ])
      setRows([emptyRow()])
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Tüm hataları göster - mutation onError da toast gösterir ama aynı anda olmaz
      toast.error(msg || "Kaydetme sırasında bir hata oluştu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setRows([emptyRow()])
    onOpenChange(false)
  }

  const activeHotels = hotels?.filter((h) => h.status === "active") ?? []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto overflow-x-hidden p-0 sm:max-w-4xl"
        style={{
          left: `calc(50% + ${sidebarCollapsed ? 32 : 128}px)`,
        }}
      >
        <DialogHeader className="flex flex-col gap-4 border-b px-6 py-5 text-left sm:flex-row sm:items-end sm:gap-6 sm:px-8 sm:pr-14">
          <div>
            <DialogTitle className="text-xl">Bütçe Ekle</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-sm">Dönem</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-9 w-44 sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-6 py-5 sm:px-8 sm:py-6">
            {!activeHotels.length && (
              <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                Önce Admin panelinden otel ekleyin. Otel yoksa bütçe ekleyemezsiniz.
              </p>
            )}
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 xl:gap-4"
              >
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs">Otel</Label>
                  <Select
                    value={row.hotel_id || "__pick__"}
                    onValueChange={(v) => updateRow(i, "hotel_id", v === "__pick__" ? "" : v)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="__pick__">Seçin</SelectItem>
                      {activeHotels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs">Platform</Label>
                  <Select
                    value={row.platform || "__pick__"}
                    onValueChange={(v) => updateRow(i, "platform", v === "__pick__" ? "" : v)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="__pick__">Seçin</SelectItem>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs">Ülke</Label>
                  <Select
                    value={row.target_country || "__pick__"}
                    onValueChange={(v) => updateRow(i, "target_country", v === "__pick__" ? "" : v)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="__pick__">Seçin</SelectItem>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs">Para Birimi</Label>
                  <Select value={row.currency} onValueChange={(v) => updateRow(i, "currency", v)}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs">Tutar</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.amount}
                    onChange={(e) => updateRow(i, "amount", e.target.value)}
                    placeholder="0"
                    className="h-9 w-full"
                  />
                </div>
                <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <Label className="text-xs">Not</Label>
                  <Input
                    value={row.notes}
                    onChange={(e) => updateRow(i, "notes", e.target.value)}
                    placeholder="Opsiyonel"
                    className="h-9 w-full"
                  />
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 border-destructive/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeRow(i)}
                    disabled={rows.length === 1}
                    title="Bu satırı sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="default" onClick={addRow} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Yeni satır ekle
            </Button>
          </div>
          <div className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4 sm:px-8">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
