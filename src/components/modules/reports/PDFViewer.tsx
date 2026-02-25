import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getReportViewUrl } from "@/hooks/useHotelReports"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

interface PDFViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string
  title?: string
}

export function PDFViewer({ open, onOpenChange, fileUrl, title }: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !fileUrl) return
    setLoading(true)
    setError(null)
    getReportViewUrl(fileUrl)
      .then(setUrl)
      .catch((e) => setError(e?.message ?? "URL alınamadı"))
      .finally(() => setLoading(false))
  }, [open, fileUrl])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title ?? "PDF Önizleme"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              Yükleniyor...
            </div>
          )}
          {error && (
            <div className="py-24 text-center text-destructive">{error}</div>
          )}
          {url && !error && (
            <>
              <div className="flex items-center justify-center gap-2 py-2 border-b">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {pageNumber} / {numPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center py-4">
                <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page pageNumber={pageNumber} width={Math.min(800, window.innerWidth - 64)} />
                </Document>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
