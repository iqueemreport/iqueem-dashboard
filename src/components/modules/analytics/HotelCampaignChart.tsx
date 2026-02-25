import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface HotelCampaignChartProps {
  data: Array<{ name: string; count: number }>
}

export function HotelCampaignChart({ data }: HotelCampaignChartProps) {
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
          <YAxis dataKey="name" type="category" width={120} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} background={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
