import { useMemo } from "react"
import { BudgetCell } from "./BudgetCell"
import { useBudgets } from "@/hooks/useBudgets"
import { useHotels } from "@/hooks/useHotels"
import { useProfiles } from "@/hooks/useProfiles"
import { PLATFORMS } from "@/constants/platforms"
import { getCountryName } from "@/constants/countries"
import { formatCurrency } from "@/lib/utils/format"
import type { Budget } from "@/types"
import type { Currency } from "@/types"

type ViewMode = "matrix" | "table"

interface BudgetFilters {
  hotelId?: string
  platform?: string
  country?: string
}

interface BudgetTableProps {
  month: string
  viewMode?: ViewMode
  filters?: BudgetFilters
  onCellClick: (budget: Budget | null, hotelId: string, platform: string) => void
}

export function BudgetTable({ month, viewMode = "matrix", filters = {}, onCellClick }: BudgetTableProps) {
  const { data: budgets } = useBudgets(month)
  const { data: hotels } = useHotels()
  const { data: profiles } = useProfiles()

  const filteredBudgets = useMemo(() => {
    let list = budgets ?? []
    if (filters.hotelId) list = list.filter((b) => b.hotel_id === filters.hotelId)
    if (filters.platform) list = list.filter((b) => b.platform === filters.platform)
    if (filters.country) {
      const code = filters.country
      const aliases: Record<string, string[]> = { UA: ["Ukrain", "Ukraine"], TR: ["Turkey", "Turkiye"] }
      const match = [code, ...(aliases[code] ?? [])]
      list = list.filter((b) => match.some((m) => (b.target_country ?? "").toLowerCase() === m.toLowerCase()))
    }
    return list
  }, [budgets, filters.hotelId, filters.platform, filters.country])

  const matrix = useMemo(() => {
    const map = new Map<string, Budget>()
    filteredBudgets.forEach((b) => {
      const key = `${b.hotel_id}-${b.platform}-${b.target_country}`
      if (!map.has(key)) map.set(key, b)
    })
    return map
  }, [filteredBudgets])

  const activeHotels = useMemo(() => {
    let list = hotels?.filter((h) => h.status === "active") ?? []
    if (filters.hotelId) list = list.filter((h) => h.id === filters.hotelId)
    return list
  }, [hotels, filters.hotelId])

  const assigneeName = (id: string | null) =>
    id ? profiles?.find((p) => p.id === id)?.full_name ?? profiles?.find((p) => p.id === id)?.email ?? "—" : "Atanmadı"

  if (viewMode === "table") {
    const monthBudgets = filteredBudgets.filter((b) => b.month === month)
    return (
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 border-b font-medium">Otel</th>
              <th className="text-left p-3 border-b font-medium">Platform</th>
              <th className="text-left p-3 border-b font-medium">Ülke</th>
              <th className="text-left p-3 border-b font-medium">Sorumlu</th>
              <th className="text-right p-3 border-b font-medium">Tahsis</th>
              <th className="text-right p-3 border-b font-medium">Harcanan</th>
            </tr>
          </thead>
          <tbody>
            {!monthBudgets.length ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  Bu dönemde bütçe yok
                </td>
              </tr>
            ) : (
              monthBudgets.map((b) => {
                const hotel = hotels?.find((h) => h.id === b.hotel_id)
                return (
                  <tr
                    key={b.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors border-b last:border-0"
                    onClick={() => onCellClick(b, b.hotel_id, b.platform)}
                  >
                    <td className="p-3 font-medium">{hotel?.name ?? "—"}</td>
                    <td className="p-3">{PLATFORMS.find((p) => p.value === b.platform)?.label ?? b.platform}</td>
                    <td className="p-3">{getCountryName(b.target_country)}</td>
                    <td className="p-3">{assigneeName(b.assigned_user_id)}</td>
                    <td className="p-3 text-right">{formatCurrency(Number(b.amount), b.currency as Currency)}</td>
                    <td className="p-3 text-right">{formatCurrency(Number(b.spent_amount), b.currency as Currency)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left p-2 border-b font-medium">Otel</th>
            {PLATFORMS.map((p) => (
              <th key={p.value} className="text-center p-2 border-b font-medium w-36">
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeHotels.map((hotel) => (
            <tr key={hotel.id}>
              <td className="p-2 border-b font-medium">{hotel.name}</td>
              {PLATFORMS.map((p) => {
                const budget = [...(matrix.values() ?? [])].find(
                  (b) => b.hotel_id === hotel.id && b.platform === p.value
                ) ?? null
                return (
                  <td key={p.value} className="p-2 border-b">
                    <BudgetCell
                      budget={budget}
                      onClick={() => onCellClick(budget, hotel.id, p.value)}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!activeHotels.length && (
        <p className="text-center py-8 text-muted-foreground">
          Henüz otel yok. Önce Admin panelinden otel ekleyin.
        </p>
      )}
    </div>
  )
}
