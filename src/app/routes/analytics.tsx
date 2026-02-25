import { useState, useMemo } from "react"
import {
  Filter,
  Megaphone,
  Wallet,
  CheckSquare,
  TrendingUp,
  Percent,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MetricCard } from "@/components/modules/analytics/MetricCard"
import { BudgetTrendChart } from "@/components/modules/analytics/BudgetTrendChart"
import { PlatformPieChart } from "@/components/modules/analytics/PlatformPieChart"
import { HotelCampaignChart } from "@/components/modules/analytics/HotelCampaignChart"
import { TaskCompletionChart } from "@/components/modules/analytics/TaskCompletionChart"
import { CountryBudgetChart } from "@/components/modules/analytics/CountryBudgetChart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useHotels } from "@/hooks/useHotels"
import { PLATFORMS } from "@/constants/platforms"

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  TRY: "₺",
}

export function AnalyticsPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [hotelIds, setHotelIds] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [countries] = useState<string[]>([])

  const filters = {
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    hotel_ids: hotelIds.length ? hotelIds : undefined,
    platforms: platforms.length ? platforms : undefined,
    countries: countries.length ? countries : undefined,
  }

  const { data, isLoading, isError, error } = useAnalytics(filters)
  const { data: hotels } = useHotels()

  const metrics = useMemo(() => {
    if (!data) return null
    const { tasks, campaigns, budgets } = data

    const openTasks = tasks.filter(
      (t) => t.status !== "done"
    ).length
    const completedTasks = tasks.filter((t) => t.status === "done").length
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length

    const byCurrency = new Map<string, number>()
    budgets.forEach((b: { amount: number; currency: string }) => {
      byCurrency.set(
        b.currency,
        (byCurrency.get(b.currency) ?? 0) + Number(b.amount)
      )
    })
    const totalBudgetStr = Array.from(byCurrency.entries())
      .map(([c, v]) => `${CURRENCY_SYMBOLS[c] ?? c}${v.toLocaleString()}`)
      .join(" / ") || "—"

    const totalSpent = budgets.reduce((s: number, b: { spent_amount: number }) => s + Number(b.spent_amount), 0)
    const totalAmount = budgets.reduce((s: number, b: { amount: number }) => s + Number(b.amount), 0)
    const avgSpendRate =
      totalAmount > 0 ? Math.round((totalSpent / totalAmount) * 100) : 0

    return {
      campaignCount: campaigns.length,
      activeCampaigns,
      totalBudget: totalBudgetStr,
      openTasks,
      completedTasks,
      avgSpendRate,
    }
  }, [data])

  const hotelCampaignData = useMemo(() => {
    if (!data?.campaigns || !hotels) return []
    const byHotel = new Map<string, number>()
    data.campaigns.forEach((c) => {
      byHotel.set(c.hotel_id, (byHotel.get(c.hotel_id) ?? 0) + 1)
    })
    return Array.from(byHotel.entries())
      .map(([id, count]) => ({
        name: hotels.find((h) => h.id === id)?.name ?? id.slice(0, 8),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [data?.campaigns, hotels])

  const countryBudgetData = useMemo(() => {
    if (!data?.budgets) return []
    const byCountry = new Map<string, number>()
    data.budgets.forEach((b) => {
      const key = b.target_country ?? "Diğer"
      byCountry.set(key, (byCountry.get(key) ?? 0) + Number(b.amount))
    })
    return Array.from(byCountry.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [data?.budgets])

  const budgetTrendData = useMemo(() => {
    if (!data?.budgets) return []
    return data.budgets.map((b) => ({
      month: b.month ?? "",
      platform: b.platform ?? "",
      amount: Number(b.amount),
      spent_amount: Number(b.spent_amount),
    }))
  }, [data?.budgets])

  const hasFilters = dateFrom || dateTo || hotelIds.length > 0 || platforms.length > 0

  return (
    <div className="space-y-8">
      <Card className="sticky top-14 z-10 border-border/80 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Filtreler</CardTitle>
            </div>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                  setHotelIds([])
                  setPlatforms([])
                }}
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs">Başlangıç</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Bitiş</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Otel</Label>
              <Select
                value=""
                onValueChange={(v) => {
                  if (v && !hotelIds.includes(v)) setHotelIds([...hotelIds, v])
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Otel ekle" />
                </SelectTrigger>
                <SelectContent>
                  {hotels?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Platform</Label>
              <Select
                value=""
                onValueChange={(v) => {
                  if (v && !platforms.includes(v)) setPlatforms([...platforms, v])
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Platform ekle" />
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
          </div>
          {(hotelIds.length > 0 || platforms.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {hotelIds.map((id) => (
                <Badge
                  key={id}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1 hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => setHotelIds(hotelIds.filter((x) => x !== id))}
                >
                  {hotels?.find((h) => h.id === id)?.name ?? id}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {platforms.map((p) => (
                <Badge
                  key={p}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1 hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => setPlatforms(platforms.filter((x) => x !== p))}
                >
                  {PLATFORMS.find((x) => x.value === p)?.label ?? p}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-destructive font-medium">Analiz yüklenirken hata oluştu</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error?.message ?? "Bilinmeyen hata"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Özet Metrikler
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                title="Toplam Kampanya"
                value={metrics?.campaignCount ?? 0}
                icon={Megaphone}
              />
              <MetricCard
                title="Toplam Bütçe"
                value={metrics?.totalBudget ?? "—"}
                description="Para birimi bazında"
                icon={Wallet}
              />
              <MetricCard
                title="Açık Görev"
                value={metrics?.openTasks ?? 0}
                icon={CheckSquare}
              />
              <MetricCard
                title="Tamamlanan Görev"
                value={metrics?.completedTasks ?? 0}
                icon={TrendingUp}
              />
              <MetricCard
                title="Ort. Harcama Oranı"
                value={`%${metrics?.avgSpendRate ?? 0}`}
                icon={Percent}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Bütçe Grafikleri
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aylık Bütçe Trendi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Platforma göre
                </p>
              </CardHeader>
              <CardContent>
                <BudgetTrendChart budgets={budgetTrendData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Bütçe Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Platform bazında dağılım
                </p>
              </CardHeader>
              <CardContent>
                <PlatformPieChart budgets={budgetTrendData} />
              </CardContent>
            </Card>
          </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Kampanya & Görev Analizi
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Otel Bazlı Kampanya Sayısı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  En çok kampanya olan oteller
                </p>
              </CardHeader>
              <CardContent>
                <HotelCampaignChart data={hotelCampaignData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Görev Tamamlanma Oranı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Kategoriye göre %
                </p>
              </CardHeader>
              <CardContent>
                <TaskCompletionChart tasks={data?.tasks ?? []} />
              </CardContent>
            </Card>
          </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Ülke Bazlı Bütçe Dağılımı
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ülkelere Göre Bütçe</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hedef ülkeye göre bütçe dağılımı
                </p>
              </CardHeader>
              <CardContent>
                <CountryBudgetChart data={countryBudgetData} />
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
