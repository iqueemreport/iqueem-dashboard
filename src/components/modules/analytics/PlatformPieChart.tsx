import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useMemo } from "react"
import { PLATFORMS } from "@/constants/platforms"
import { PLATFORM_COLORS } from "@/constants/colors"

interface PlatformPieChartProps {
  budgets: Array<{ platform: string; amount: number }>
}

export function PlatformPieChart({ budgets }: PlatformPieChartProps) {
  const data = useMemo(() => {
    const byPlatform = new Map<string, number>()
    budgets.forEach((b) => {
      const key = b.platform ?? "other"
      byPlatform.set(key, (byPlatform.get(key) ?? 0) + Number(b.amount))
    })
    return Array.from(byPlatform.entries()).map(([name, value]) => ({
      name: PLATFORMS.find((p) => p.value === name)?.label ?? name,
      value,
    }))
  }, [budgets])

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        Veri yok
      </div>
    )
  }

  const COLORS = data.map(
    (d) =>
      PLATFORM_COLORS[PLATFORMS.find((p) => p.label === d.name)?.value ?? ""] ??
      "#6b7280"
  )

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} stroke="none" />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
