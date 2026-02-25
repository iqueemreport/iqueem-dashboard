import { useState } from "react"
import { Plus, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BudgetTable } from "@/components/modules/budgets/BudgetTable"
import { BudgetForm } from "@/components/modules/budgets/BudgetForm"
import { BudgetDrawer } from "@/components/modules/budgets/BudgetDrawer"
import { useCreateBudgets } from "@/hooks/useBudgets"
import { useHotels } from "@/hooks/useHotels"
import { PLATFORMS } from "@/constants/platforms"
import { COUNTRIES } from "@/constants/countries"
import { useStore } from "@/stores/auth-store"
import { format, startOfMonth, subMonths } from "date-fns"
import { tr } from "date-fns/locale"
import type { Budget } from "@/types"

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const d = subMonths(startOfMonth(new Date()), i)
  return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: tr }) }
})

export function BudgetsPage() {
  const { user } = useStore()
  const [month, setMonth] = useState(MONTH_OPTIONS[0].value)
  const [formOpen, setFormOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"matrix" | "table">("table")
  const [filterHotel, setFilterHotel] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [selectedBudget, setSelectedBudget] = useState<{
    budget: Budget | null
    hotelId: string
    platform: string
  } | null>(null)

  const createBudgets = useCreateBudgets()
  const { data: hotels } = useHotels()

  function handleCellClick(
    budget: Budget | null,
    hotelId: string,
    platform: string
  ) {
    setSelectedBudget({ budget, hotelId, platform })
    setDrawerOpen(true)
  }

  async function handleSubmit(data: {
    rows: Array<{
      hotel_id: string
      platform: string
      target_country: string
      currency: string
      amount: number
      notes?: string | null
    }>
    month: string
  }) {
    if (!user?.id) {
      throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.")
    }
    await createBudgets.mutateAsync(
      data.rows.map((r) => ({
        ...r,
        month: data.month,
        created_by: user.id,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
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
          <Select value={filterHotel || "__all__"} onValueChange={(v) => setFilterHotel(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Otel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tüm Oteller</SelectItem>
              {hotels?.filter((h) => h.status === "active").map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPlatform || "__all__"} onValueChange={(v) => setFilterPlatform(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tüm Platformlar</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCountry || "__all__"} onValueChange={(v) => setFilterCountry(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ülke" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tüm Ülkeler</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "matrix" | "table")}>
            <TabsList>
              <TabsTrigger value="table">
                <List className="h-4 w-4 mr-1.5" />
                Tablo
              </TabsTrigger>
              <TabsTrigger value="matrix">
                <LayoutGrid className="h-4 w-4 mr-1.5" />
                Matris
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bütçe Ekle
          </Button>
        </div>
      </div>

      <BudgetTable
        month={month}
        viewMode={viewMode}
        filters={{ hotelId: filterHotel || undefined, platform: filterPlatform || undefined, country: filterCountry || undefined }}
        onCellClick={handleCellClick}
      />

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        month={month}
        onSubmit={handleSubmit}
      />

      <BudgetDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        budgetId={selectedBudget?.budget?.id ?? null}
        hotelId={selectedBudget?.hotelId ?? ""}
      />
    </div>
  )
}
