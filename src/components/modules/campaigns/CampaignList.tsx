import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PLATFORMS } from "@/constants/platforms"
import { CAMPAIGN_OBJECTIVES } from "@/constants/objectives"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { PLATFORM_COLORS } from "@/constants/colors"
import type { Campaign } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  planned: "Planlandı",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
}

interface CampaignListProps {
  campaigns: Campaign[]
  hotels: { id: string; name: string }[]
  onCampaignClick: (campaign: Campaign) => void
}

export function CampaignList({
  campaigns,
  hotels,
  onCampaignClick,
}: CampaignListProps) {
  const hotelName = (id: string) => hotels.find((h) => h.id === id)?.name ?? id

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kampanya</TableHead>
            <TableHead>Otel</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Hedef</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Bütçe</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!campaigns.length ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                Kampanya bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onCampaignClick(c)}
              >
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{hotelName(c.hotel_id)}</TableCell>
                <TableCell>
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: PLATFORM_COLORS[c.platform] ?? "#6b7280" }}
                  />
                  {PLATFORMS.find((p) => p.value === c.platform)?.label}
                </TableCell>
                <TableCell>
                  {CAMPAIGN_OBJECTIVES.find((o) => o.value === c.objective)?.label}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(c.start_date)} — {formatDate(c.end_date)}
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(c.budget_amount), c.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.status === "active"
                        ? "default"
                        : c.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {STATUS_LABELS[c.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
