import { useState, lazy, Suspense } from "react"
import { Eye, Download, Pencil } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useHotelReports } from "@/hooks/useHotelReports"
import { useHotels } from "@/hooks/useHotels"
import { useProfiles } from "@/hooks/useProfiles"
import { getReportViewUrl } from "@/hooks/useHotelReports"
import { formatDate, formatMonth } from "@/lib/utils/format"
import { ReportEditModal } from "./ReportEditModal"
import type { HotelReport } from "@/types"

const PDFViewer = lazy(() => import("./PDFViewer").then((m) => ({ default: m.PDFViewer })))

interface ReportListProps {
  hotelId?: string
  periodMonth?: string
}

export function ReportList({ hotelId, periodMonth }: ReportListProps) {
  const { data: reports, isLoading, isError, error } = useHotelReports({ hotel_id: hotelId, period_month: periodMonth })
  const { data: hotels } = useHotels()
  const { data: profiles } = useProfiles()
  const [previewReport, setPreviewReport] = useState<{ fileUrl: string; title: string } | null>(null)
  const [editReport, setEditReport] = useState<HotelReport | null>(null)

  const hotelName = (id: string) => hotels?.find((h) => h.id === id)?.name ?? id
  const uploaderName = (id: string) => {
    const p = profiles?.find((x) => x.id === id)
    return p?.full_name ?? p?.email ?? "—"
  }

  async function handleDownload(fileUrl: string, fileName: string) {
    const url = await getReportViewUrl(fileUrl)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.target = "_blank"
    a.click()
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        Raporlar yüklenirken hata oluştu: {error?.message ?? "Bilinmeyen hata"}
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Otel</TableHead>
            <TableHead>Başlık</TableHead>
            <TableHead>Dönem</TableHead>
            <TableHead>Yükleyen</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!reports?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                Henüz rapor yok
              </TableCell>
            </TableRow>
          ) : (
            reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{hotelName(r.hotel_id)}</TableCell>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>{formatMonth(r.period_month)}</TableCell>
                <TableCell>{uploaderName(r.uploaded_by)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(r.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditReport(r)}
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPreviewReport({ fileUrl: r.file_url, title: r.title })
                      }
                      title="Önizle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(r.file_url, r.file_name)}
                      title="İndir"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ReportEditModal
        open={!!editReport}
        onOpenChange={(open) => !open && setEditReport(null)}
        report={editReport}
      />

      {previewReport && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80"><Skeleton className="h-12 w-12" /></div>}>
          <PDFViewer
            open={!!previewReport}
            onOpenChange={(open) => !open && setPreviewReport(null)}
            fileUrl={previewReport.fileUrl}
            title={previewReport.title}
          />
        </Suspense>
      )}
    </>
  )
}
