import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useMemo } from "react"
import { PLATFORMS } from "@/constants/platforms"
import { PLATFORM_COLORS } from "@/constants/colors"

interface BudgetTrendChartProps {
  budgets: Array<{ month: string; platform: string; amount: number; spent_amount: number }>
}

export function BudgetTrendChart({ budgets }: BudgetTrendChartProps) {
  const data = useMemo(() => {
    const byMonth = new Map<string, Record<string, string | number>>()
    budgets.forEach((b) => {
      const month = b.month ?? "?"
      if (!byMonth.has(month)) {
        byMonth.set(month, { month })
      }
      const row = byMonth.get(month)!
      const key = b.platform
      row[key] = (Number(row[key]) || 0) + Number(b.amount)
    })
    return Array.from(byMonth.values()).sort(
      (a, b) => String(a.month).localeCompare(String(b.month))
    )
  }, [budgets])

  const platforms = useMemo(
    () =>
      [...new Set(budgets.map((b) => b.platform))].filter(Boolean) as string[],
    [budgets]
  )

  if (!data.length || !platforms.length) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
        Veri yok
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.25} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {platforms.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              name={PLATFORMS.find((x) => x.value === p)?.label ?? p}
              stroke={PLATFORM_COLORS[p] ?? "#6b7280"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
