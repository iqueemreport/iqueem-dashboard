import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useMemo } from "react"
import { TASK_CATEGORIES } from "@/constants/tasks"

interface TaskCompletionChartProps {
  tasks: Array<{ category: string; status: string }>
}

export function TaskCompletionChart({ tasks }: TaskCompletionChartProps) {
  const data = useMemo(() => {
    const byCategory = new Map<string, { total: number; done: number }>()
    TASK_CATEGORIES.forEach((c) => {
      byCategory.set(c.value, { total: 0, done: 0 })
    })
    tasks.forEach((t) => {
      const cat = t.category ?? "general"
      const row = byCategory.get(cat) ?? { total: 0, done: 0 }
      row.total++
      if (t.status === "done") row.done++
      byCategory.set(cat, row)
    })
    return Array.from(byCategory.entries()).map(([key, v]) => ({
      name: TASK_CATEGORIES.find((c) => c.value === key)?.label ?? key,
      total: v.total,
      done: v.done,
      rate: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0,
    }))
  }, [tasks])

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.25} />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="rate" fill="hsl(var(--chart-1))" name="Tamamlanma %" radius={[4, 4, 0, 0]} background={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
