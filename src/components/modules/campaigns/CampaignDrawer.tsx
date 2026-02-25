import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCampaign } from "@/hooks/useCampaigns"
import { useHotels } from "@/hooks/useHotels"
import { PLATFORMS } from "@/constants/platforms"
import { CAMPAIGN_OBJECTIVES } from "@/constants/objectives"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { Currency } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_LABELS: Record<string, string> = {
  planned: "Planlandı",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
}

interface CampaignDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string | null
  onEdit?: (id: string) => void
  onAddNew?: () => void
}

export function CampaignDrawer({
  open,
  onOpenChange,
  campaignId,
  onEdit,
  onAddNew,
}: CampaignDrawerProps) {
  const { data: campaign, isLoading } = useCampaign(campaignId)
  const { data: hotels } = useHotels()

  const hotel = campaign ? hotels?.find((h) => h.id === campaign.hotel_id) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto px-6 py-4">
        <SheetHeader className="pr-10">
          <SheetTitle>Kampanya Detayı</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="mt-8 space-y-4 px-0">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !campaign ? (
          <div className="py-8 space-y-4 px-0">
            <p className="text-muted-foreground">Kampanya bulunamadı</p>
            {onAddNew && (
              <Button type="button" onClick={() => { onOpenChange(false); onAddNew() }}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Kampanya Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-8 flex flex-1 flex-col space-y-6 px-0 pb-8">
            <div className="rounded-xl bg-muted/40 px-5 py-4">
              <h2 className="text-lg font-semibold">{campaign.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {hotel?.name} • {PLATFORMS.find((p) => p.value === campaign.platform)?.label}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 px-5 py-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Hedef
                  </Label>
                  <p className="text-sm font-medium">
                    {CAMPAIGN_OBJECTIVES.find((o) => o.value === campaign.objective)?.label}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Durum
                  </Label>
                  <p className="text-sm font-medium">{STATUS_LABELS[campaign.status]}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Ülke
                  </Label>
                  <p className="text-sm font-medium">{campaign.target_country}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Tarih
                  </Label>
                  <p className="text-sm font-medium">
                    {formatDate(campaign.start_date)} — {formatDate(campaign.end_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 px-5 py-5">
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                  Bütçe
                </Label>
                <p className="text-sm font-medium">
                  {formatCurrency(Number(campaign.budget_amount), campaign.currency as Currency)} /{" "}
                  {formatCurrency(Number(campaign.spent_amount), campaign.currency as Currency)} harcandı
                </p>
              </div>
            </div>

            {campaign.notes && (
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                  Notlar
                </Label>
                <p className="text-sm mt-1">{campaign.notes}</p>
              </div>
            )}

            <div className="mt-auto pt-6">
              <div className="h-px shrink-0 bg-border mb-4" />
              <div className="flex flex-wrap gap-2">
                {onEdit && (
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(campaign.id)}>
                    Düzenle
                  </Button>
                )}
                {onAddNew && (
                  <Button type="button" variant="outline" size="sm" onClick={() => { onOpenChange(false); onAddNew() }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Kampanya Ekle
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
