import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useBudgets } from "@/hooks/useBudgets"
import { PLATFORMS } from "@/constants/platforms"
import { CAMPAIGN_OBJECTIVES } from "@/constants/objectives"
import type { Campaign, Currency } from "@/types"

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "EUR", label: "€ EUR" },
  { value: "USD", label: "$ USD" },
  { value: "TRY", label: "₺ TRY" },
]

const CAMPAIGN_STATUSES = [
  { value: "planned", label: "Planlandı" },
  { value: "active", label: "Aktif" },
  { value: "paused", label: "Duraklatıldı" },
  { value: "completed", label: "Tamamlandı" },
]

interface CampaignFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  initialDate?: string // YYYY-MM-DD, for new campaigns
  onSubmit: (data: Partial<Campaign>) => Promise<void>
}

export function CampaignForm({
  open,
  onOpenChange,
  campaign,
  initialDate,
  onSubmit,
}: CampaignFormProps) {
  const { data: hotels } = useHotels()
  const { data: budgets } = useBudgets()

  const [hotelId, setHotelId] = useState("")
  const [name, setName] = useState("")
  const [platform, setPlatform] = useState<Campaign["platform"]>("google")
  const [targetCountry, setTargetCountry] = useState("")
  const [objective, setObjective] = useState<Campaign["objective"]>("traffic")
  const [currency, setCurrency] = useState<Currency>("EUR")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [spentAmount, setSpentAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<Campaign["status"]>("planned")
  const [budgetId, setBudgetId] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (campaign) {
      setHotelId(campaign.hotel_id)
      setName(campaign.name)
      setPlatform(campaign.platform)
      setTargetCountry(campaign.target_country)
      setObjective(campaign.objective)
      setCurrency(campaign.currency)
      setBudgetAmount(String(campaign.budget_amount))
      setSpentAmount(String(campaign.spent_amount))
      setStartDate(campaign.start_date)
      setEndDate(campaign.end_date)
      setStatus(campaign.status)
      setBudgetId(campaign.budget_id ?? "")
      setNotes(campaign.notes ?? "")
    } else {
      setHotelId("")
      setName("")
      setPlatform("google")
      setTargetCountry("")
      setObjective("traffic")
      setCurrency("EUR")
      setBudgetAmount("")
      setSpentAmount("")
      setStartDate(initialDate ?? "")
      setEndDate(initialDate ?? "")
      setStatus("planned")
      setBudgetId("")
      setNotes("")
    }
  }, [campaign, open, initialDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hotelId || !name || !startDate || !endDate) return
    await onSubmit({
      hotel_id: hotelId,
      budget_id: budgetId || null,
      name,
      platform,
      target_country: targetCountry,
      objective,
      currency,
      budget_amount: Number(budgetAmount) || 0,
      spent_amount: Number(spentAmount) || 0,
      start_date: startDate,
      end_date: endDate,
      status,
      notes: notes || null,
    })
    onOpenChange(false)
  }

  const relatedBudgets = budgets?.filter(
    (b) => b.hotel_id === hotelId
  ) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "Kampanya Düzenle" : "Yeni Kampanya"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Otel *</Label>
            <Select value={hotelId || "__empty__"} onValueChange={(v) => setHotelId(v === "__empty__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__empty__">Seçin</SelectItem>
                {hotels?.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Kampanya Adı *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kampanya adı"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Campaign["platform"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Hedef Ülke</Label>
              <Input
                id="country"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                placeholder="TR"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kampanya Hedefi</Label>
            <Select value={objective} onValueChange={(v) => setObjective(v as Campaign["objective"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OBJECTIVES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bütçe Tutarı</Label>
              <Input
                type="number"
                min={0}
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Harcanan Tutar</Label>
            <Input
              type="number"
              min={0}
              value={spentAmount}
              onChange={(e) => setSpentAmount(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Durum</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Campaign["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>İlgili Bütçe (Opsiyonel)</Label>
            <Select value={budgetId || "__none__"} onValueChange={(v) => setBudgetId(v === "__none__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Yok</SelectItem>
                {relatedBudgets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.platform} - {b.month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
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
