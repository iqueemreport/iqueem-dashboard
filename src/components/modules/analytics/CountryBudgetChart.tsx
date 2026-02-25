import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface CountryBudgetChartProps {
  data: Array<{ name: string; value: number }>
}

export function CountryBudgetChart({ data }: CountryBudgetChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        Veri yok
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.25} horizontal={false} />
          <XAxis type="number" stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} background={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
