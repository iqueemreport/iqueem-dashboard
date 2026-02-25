import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  CheckSquare,
  Megaphone,
  Wallet,
  TrendingUp,
  FileText,
  ArrowRight,
  Calendar,
} from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useCampaigns } from "@/hooks/useCampaigns"
import { useBudgets } from "@/hooks/useBudgets"
import { useHotelReports } from "@/hooks/useHotelReports"
import { useHotels } from "@/hooks/useHotels"
import { formatDate, formatMonth } from "@/lib/utils/format"
import { TASK_CATEGORIES } from "@/constants/tasks"
import { PLATFORMS } from "@/constants/platforms"
import { PLATFORM_COLORS } from "@/constants/colors"
import { addDays, format, startOfMonth, endOfMonth } from "date-fns"

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  TRY: "₺",
}

export function DashboardPage() {
  const thisMonth = format(startOfMonth(new Date()), "yyyy-MM")
  const today = format(new Date(), "yyyy-MM-dd")
  const nextMonth = format(addDays(new Date(), 30), "yyyy-MM-dd")

  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(thisMonth)
  const { data: reports } = useHotelReports()
  const { data: hotels } = useHotels()

  const metrics = useMemo(() => {
    if (!tasks || !campaigns) return null
    const openTasks = tasks.filter((t) => t.status !== "done").length
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length

    const byCurrency = new Map<string, number>()
    budgets?.forEach((b) => {
      byCurrency.set(b.currency, (byCurrency.get(b.currency) ?? 0) + Number(b.amount))
    })
    const totalBudgetStr =
      Array.from(byCurrency.entries())
        .map(([c, v]) => `${CURRENCY_SYMBOLS[c] ?? c}${v.toLocaleString("tr-TR")}`)
        .join(" / ") || "—"

    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
    const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")
    const completedThisMonth = tasks.filter((t) => {
      if (t.status !== "done") return false
      const d = (t.updated_at ?? t.created_at ?? "").slice(0, 10)
      return d >= monthStart && d <= monthEnd
    }).length

    return {
      openTasks,
      activeCampaigns,
      totalBudget: totalBudgetStr,
      completedThisMonth,
    }
  }, [tasks, campaigns, budgets])

  const recentTasks = useMemo(() => tasks?.slice(0, 5) ?? [], [tasks])

  const upcomingCampaignEndings = useMemo(() => {
    if (!campaigns) return []
    return campaigns
      .filter((c) => c.status === "active" && c.end_date >= today && c.end_date <= nextMonth)
      .sort((a, b) => (a.end_date > b.end_date ? 1 : -1))
      .slice(0, 5)
  }, [campaigns, today, nextMonth])

  const platformBudgetData = useMemo(() => {
    if (!budgets?.length) return []
    const byPlatform = new Map<string, number>()
    budgets.forEach((b) => {
      byPlatform.set(b.platform, (byPlatform.get(b.platform) ?? 0) + Number(b.amount))
    })
    const total = Array.from(byPlatform.values()).reduce((s, v) => s + v, 0)
    return Array.from(byPlatform.entries())
      .map(([platform, amount]) => ({
        platform: PLATFORMS.find((p) => p.value === platform)?.label ?? platform,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [budgets])

  const recentReports = useMemo(() => reports?.slice(0, 5) ?? [], [reports])

  const hotelName = (id: string) => hotels?.find((h) => h.id === id)?.name ?? "—"

  const isLoading = tasksLoading || campaignsLoading || budgetsLoading

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık Görevler</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.openTasks ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Devam eden görevler
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kampanyalar</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.activeCampaigns ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Devam eden kampanyalar
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Bütçe</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.totalBudget ?? "—"}</div>
                <p className="text-xs text-muted-foreground">
                  {formatMonth(thisMonth)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan (Bu Ay)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.completedThisMonth ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Bu ay tamamlanan görevler
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Son Eklenen Görevler</CardTitle>
              <p className="text-sm text-muted-foreground">
                En son 5 görev
              </p>
            </div>
            <Link
              to="/tasks"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Tümü <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Henüz görev yok
              </p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((t) => (
                  <Link
                    key={t.id}
                    to="/tasks"
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {TASK_CATEGORIES.find((c) => c.value === t.category)?.label ?? t.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(t.created_at)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Yaklaşan Kampanya Bitişleri</CardTitle>
              <p className="text-sm text-muted-foreground">
                Önümüzdeki 30 gün
              </p>
            </div>
            <Link
              to="/campaigns"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Tümü <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : upcomingCampaignEndings.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Önümüzdeki 30 günde biten kampanya yok
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingCampaignEndings.map((c) => (
                  <Link
                    key={c.id}
                    to="/campaigns"
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {hotelName(c.hotel_id)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(c.end_date)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Platform Bütçe Özeti</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatMonth(thisMonth)} dağılımı
              </p>
            </div>
            <Link
              to="/budgets"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Detay <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {budgetsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : platformBudgetData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Bu ay için bütçe verisi yok
              </p>
            ) : (
              <div className="space-y-3">
                {platformBudgetData.map((item) => (
                  <div key={item.platform} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.platform}</span>
                      <span className="text-muted-foreground">
                        %{item.percent}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor:
                            PLATFORM_COLORS[
                              PLATFORMS.find((p) => p.label === item.platform)?.value ?? ""
                            ] ?? "hsl(var(--primary))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Son Yüklenen Raporlar</CardTitle>
              <p className="text-sm text-muted-foreground">
                En son 5 rapor
              </p>
            </div>
            <Link
              to="/reports"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Tümü <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Henüz rapor yok
              </p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((r) => (
                  <Link
                    key={r.id}
                    to="/reports"
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {hotelName(r.hotel_id)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {formatMonth(r.period_month)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
