import { useState } from "react"
import { LayoutGrid, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CampaignCalendar } from "@/components/modules/campaigns/CampaignCalendar"
import { CampaignList } from "@/components/modules/campaigns/CampaignList"
import { CampaignForm } from "@/components/modules/campaigns/CampaignForm"
import { CampaignDrawer } from "@/components/modules/campaigns/CampaignDrawer"
import { useCampaigns, useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns"
import { useHotels } from "@/hooks/useHotels"
import { useStore } from "@/stores/auth-store"
import { PLATFORMS } from "@/constants/platforms"
import { CAMPAIGN_OBJECTIVES } from "@/constants/objectives"
import { format, subMonths, startOfMonth } from "date-fns"
import { tr } from "date-fns/locale"
import type { Campaign } from "@/types"

const STATUS_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "planned", label: "Planlandı" },
  { value: "active", label: "Aktif" },
  { value: "paused", label: "Duraklatıldı" },
  { value: "completed", label: "Tamamlandı" },
]

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = subMonths(startOfMonth(new Date()), i)
  return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: tr }) }
})

type ViewMode = "calendar" | "list"

export function CampaignsPage() {
  const { user } = useStore()
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [month, setMonth] = useState(MONTH_OPTIONS[0].value)
  const [hotelId, setHotelId] = useState("")
  const [platform, setPlatform] = useState("")
  const [targetCountry, setTargetCountry] = useState("")
  const [objective, setObjective] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [initialDate, setInitialDate] = useState<string | null>(null)

  const filters = {
    hotel_id: hotelId || undefined,
    platform: platform || undefined,
    target_country: targetCountry || undefined,
    objective: objective || undefined,
    status: status || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const { data: campaigns, isLoading, isError, error } = useCampaigns(filters)
  const { data: hotels } = useHotels()
  const createCampaign = useCreateCampaign()
  const updateCampaign = useUpdateCampaign()

  function handleCampaignClick(campaign: Campaign) {
    setSelectedCampaign(campaign)
    setDrawerOpen(true)
  }

  function handleEdit(campaignId: string) {
    const c = campaigns?.find((x) => x.id === campaignId)
    setEditingCampaign(c ?? null)
    setDrawerOpen(false)
    setFormOpen(true)
  }

  async function handleCreate(data: Partial<Campaign>) {
    if (!user?.id) return
    await createCampaign.mutateAsync({ ...data, created_by: user.id } as Partial<Campaign> & {
      created_by: string
    })
    setFormOpen(false)
  }

  async function handleUpdate(data: Partial<Campaign>) {
    if (!editingCampaign) return
    await updateCampaign.mutateAsync({ id: editingCampaign.id, ...data })
    setFormOpen(false)
    setEditingCampaign(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          <Button
            type="button"
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("calendar")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button type="button" onClick={() => { setEditingCampaign(null); setInitialDate(null); setFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Kampanya Ekle
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {viewMode === "calendar" && (
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-44">
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
        )}
        <Select value={hotelId || "__all__"} onValueChange={(v) => setHotelId(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-40">
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
        <Select value={platform || "__all__"} onValueChange={(v) => setPlatform(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tümü</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-24"
          placeholder="Ülke"
          value={targetCountry}
          onChange={(e) => setTargetCountry(e.target.value)}
        />
        <Select value={objective || "__all__"} onValueChange={(v) => setObjective(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Hedef" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tümü</SelectItem>
            {CAMPAIGN_OBJECTIVES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status || "__all__"} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value || "__all__"} value={s.value || "__all__"}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-40"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          className="w-40"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {isError ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <p>Veriler yüklenirken hata oluştu.</p>
          <p className="text-xs">{error?.message}</p>
        </div>
      ) : isLoading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Yükleniyor...
        </div>
      ) : viewMode === "calendar" ? (
        <CampaignCalendar
          campaigns={campaigns ?? []}
          month={month}
          onCampaignClick={handleCampaignClick}
          onEmptyDayClick={(date) => {
            setEditingCampaign(null)
            setInitialDate(new Date(date).toISOString().slice(0, 10))
            setFormOpen(true)
          }}
        />
      ) : (
        <CampaignList
          campaigns={campaigns ?? []}
          hotels={hotels ?? []}
          onCampaignClick={handleCampaignClick}
        />
      )}

      <CampaignForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) { setEditingCampaign(null); setInitialDate(null) }
        }}
        campaign={editingCampaign}
        initialDate={initialDate ?? undefined}
        onSubmit={editingCampaign ? handleUpdate : handleCreate}
      />

      <CampaignDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        campaignId={selectedCampaign?.id ?? null}
        onEdit={handleEdit}
        onAddNew={() => { setEditingCampaign(null); setInitialDate(null); setFormOpen(true) }}
      />
    </div>
  )
}
