import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { usePerformance } from "@/hooks/usePerformance"
import { Skeleton } from "@/components/ui/skeleton"

export function PerformanceTable() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")

  const filters = {
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const { data: performance, isLoading, isError, error } = usePerformance(filters)

  function handleExportCsv() {
    if (!performance?.length) return
    const headers = ["Kullanıcı", "E-posta", "Toplam Görev", "Tamamlanan", "Oran %", "Ort. Süre (saat)"]
    const rows = performance.map((p) => [
      p.full_name,
      p.email,
      String(p.total_tasks),
      String(p.completed_tasks),
      String(p.completion_rate),
      String(p.avg_completion_hours),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ekip-performans-${dateFrom || "all"}-${dateTo || "all"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const chartData = (performance ?? []).map((p) => ({
    name: p.full_name || p.email || p.user_id.slice(0, 8),
    tamamlanan: p.completed_tasks,
    toplam: p.total_tasks,
  }))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground space-y-2">
        <p>Performans verisi yüklenirken hata oluştu.</p>
        <p className="text-sm">{error?.message}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Yeniden Dene
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label>Başlangıç</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label>Bitiş</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Tablo
          </Button>
          <Button
            variant={viewMode === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("chart")}
          >
            Grafik
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="mr-2 h-4 w-4" />
          CSV Export
        </Button>
      </div>

      {viewMode === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead className="text-right">Toplam Görev</TableHead>
              <TableHead className="text-right">Tamamlanan</TableHead>
              <TableHead className="text-right">Oran %</TableHead>
              <TableHead className="text-right">Ort. Süre (saat)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!performance?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Veri bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              performance.map((p) => (
                <TableRow key={p.user_id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell className="text-right">{p.total_tasks}</TableCell>
                  <TableCell className="text-right">{p.completed_tasks}</TableCell>
                  <TableCell className="text-right">{p.completion_rate}%</TableCell>
                  <TableCell className="text-right">
                    {p.avg_completion_hours.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar
                dataKey="tamamlanan"
                name="Tamamlanan"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="toplam"
                name="Toplam"
                fill="hsl(var(--muted-foreground))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
