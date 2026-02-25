import { useState, useEffect } from "react"
import { Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets"
import { useHotels } from "@/hooks/useHotels"
import { useProfiles } from "@/hooks/useProfiles"
import { PLATFORMS } from "@/constants/platforms"
import { getCountryName } from "@/constants/countries"
import { formatCurrency, formatMonth } from "@/lib/utils/format"
import type { Currency } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetId: string | null
  hotelId: string
}

export function BudgetDrawer({
  open,
  onOpenChange,
  budgetId,
  hotelId,
}: BudgetDrawerProps) {
  const { data: budget, isLoading } = useBudget(budgetId)
  const { data: hotels } = useHotels()
  const { data: profiles } = useProfiles()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const [spentAmount, setSpentAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const assignee = budget
    ? profiles?.find((p) => p.id === budget.assigned_user_id)
    : null
  const hotel = hotels?.find((h) => h.id === (budget?.hotel_id ?? hotelId))

  useEffect(() => {
    if (budget && open) {
      setSpentAmount(String(budget.spent_amount))
      setNotes(budget.notes ?? "")
    }
  }, [budget, open])

  async function handleSave() {
    if (!budget) return
    await updateBudget.mutateAsync({
      id: budget.id,
      spent_amount: Number(spentAmount) || 0,
      notes: notes || null,
    })
    setIsEditing(false)
  }

  function handleExportCsv() {
    if (!budget) return
    const rows = [
      ["Otel", "Platform", "Ülke", "Para Birimi", "Tahsis", "Harcanan", "Not"],
      [
        hotel?.name ?? "",
        PLATFORMS.find((p) => p.value === budget.platform)?.label ?? budget.platform,
        getCountryName(budget.target_country),
        budget.currency,
        String(budget.amount),
        String(budget.spent_amount),
        budget.notes ?? "",
      ],
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `butce-${budget.month}-${hotel?.name ?? "otel"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete() {
    if (!budget || !confirm("Bu bütçeyi silmek istediğinize emin misiniz?")) return
    deleteBudget.mutate(budget.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto px-6 py-4">
        <SheetHeader className="pr-10">
          <SheetTitle>Bütçe Detayı</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="mt-8 space-y-4 px-0">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !budget ? (
          <div className="mt-8 px-0">
            <p className="text-muted-foreground">
              Bu hücrede bütçe yok. Yeni bütçe eklemek için üstteki &quot;Bütçe Ekle&quot; butonunu kullanın.
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-1 flex-col space-y-6 px-0 pb-8">
            <div className="rounded-xl bg-muted/40 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{formatMonth(budget.month)}</span>
                {" · "}
                <span>{hotel?.name}</span>
                {" · "}
                <span>{PLATFORMS.find((p) => p.value === budget.platform)?.label}</span>
                {" · "}
                <span>{getCountryName(budget.target_country)}</span>
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 px-5 py-5">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Tahsis Edilen
                  </Label>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(Number(budget.amount), budget.currency as Currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Harcanan
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={spentAmount}
                      onChange={(e) => setSpentAmount(e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <p className="text-lg font-semibold tabular-nums">
                      {formatCurrency(Number(budget.spent_amount), budget.currency as Currency)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                Sorumlu
              </Label>
              <p className="text-sm font-medium">
                {assignee?.full_name || assignee?.email || (
                  <span className="text-muted-foreground italic">Atanmadı</span>
                )}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                Notlar
              </Label>
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                  placeholder="Not ekleyebilirsiniz..."
                />
              ) : (
                <p className="text-sm min-h-[2.5rem] py-2 text-muted-foreground">
                  {budget.notes?.trim() ? budget.notes : "Henüz not eklenmemiş"}
                </p>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-4 pt-6">
              <div className="h-px shrink-0 bg-border" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" size="sm" onClick={handleSave}>
                        Kaydet
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        İptal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        Düzenle
                      </Button>
                      <Button type="button" variant="outline" size="icon" onClick={handleExportCsv} title="CSV İndir">
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleteBudget.isPending}
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
