import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useProfiles } from "@/hooks/useProfiles"
import { useHotels } from "@/hooks/useHotels"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from "@/constants/tasks"
import type { Task } from "@/types"

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSubmit: (data: Partial<Task>) => Promise<void>
  createdBy: string
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  onSubmit,
  createdBy,
}: TaskFormProps) {
  const { data: profiles } = useProfiles()
  const { data: hotels } = useHotels()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Task["category"]>("general")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [hotelId, setHotelId] = useState<string>("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [status, setStatus] = useState<Task["status"]>("todo")
  const [dueDate, setDueDate] = useState("")
  const [tagsStr, setTagsStr] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? "")
      setCategory(task.category)
      setAssigneeId(task.assignee_id ?? "")
      setHotelId(task.hotel_id ?? "")
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.due_date ?? "")
      setTagsStr(task.tags?.join(", ") ?? "")
    } else {
      setTitle("")
      setDescription("")
      setCategory("general")
      setAssigneeId("")
      setHotelId("")
      setPriority("medium")
      setStatus("todo")
      setDueDate("")
      setTagsStr("")
    }
  }, [task, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Başlık girin.")
      return
    }
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        category,
        assignee_id: assigneeId || null,
        hotel_id: hotelId || null,
        priority,
        status,
        due_date: dueDate || null,
        tags: tagsStr
          ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        created_by: createdBy,
      })
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem sırasında bir hata oluştu.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Görev Düzenle" : "Yeni Görev"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="min-w-0 space-y-4 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Görev başlığı"
              required
              className="min-w-0 max-w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detaylar..."
              rows={3}
              className="field-sizing-fixed min-w-0 max-w-full resize-none overflow-x-hidden break-words"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Task["category"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Atanan Kişi</Label>
              <Select value={assigneeId || "__none__"} onValueChange={(v) => setAssigneeId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Atanmadı</SelectItem>
                  {profiles?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name || p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Otel</Label>
              <Select value={hotelId || "__none__"} onValueChange={(v) => setHotelId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Seçilmedi</SelectItem>
                  {hotels?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Bitiş Tarihi</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
            <Input
              id="tags"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="ör: acil, q1, revizyon"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
