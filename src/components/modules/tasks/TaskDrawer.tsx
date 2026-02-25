import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTask } from "@/hooks/useTasks"
import { useStore } from "@/stores/auth-store"
import { useTaskComments, useAddTaskComment } from "@/hooks/useTaskComments"
import { useProfiles } from "@/hooks/useProfiles"
import { useHotels } from "@/hooks/useHotels"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from "@/constants/tasks"
import { formatDate } from "@/lib/utils/format"
import type { Task } from "@/types"
import { TASK_CATEGORY_COLORS, TASK_PRIORITY_COLORS } from "@/constants/colors"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null | undefined
  onEdit?: (task: Task) => void
}

export function TaskDrawer({
  open,
  onOpenChange,
  taskId,
  onEdit,
}: TaskDrawerProps) {
  const effectiveTaskId = taskId ?? null
  const { data: task, isLoading } = useTask(effectiveTaskId)
  const { data: comments } = useTaskComments(effectiveTaskId)
  const { data: profiles } = useProfiles()
  const { data: hotels } = useHotels()
  const { user } = useStore()
  const addComment = useAddTaskComment()

  const [commentText, setCommentText] = useState("")

  const assignee = profiles?.find((p) => p.id === task?.assignee_id)
  const hotel = hotels?.find((h) => h.id === task?.hotel_id)

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!taskId || !commentText.trim() || !user?.id) return
    await addComment.mutateAsync({
      task_id: taskId,
      user_id: user.id,
      content: commentText.trim(),
    })
    setCommentText("")
  }

  if (!taskId) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-x-hidden overflow-y-auto px-6 py-4">
        <SheetHeader className="pr-10">
          <SheetTitle>Görev Detayı</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="mt-8 space-y-4 px-0">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !task ? (
          <p className="text-muted-foreground py-8 px-0">Görev bulunamadı</p>
        ) : (
          <div className="mt-8 flex min-w-0 flex-1 flex-col overflow-hidden space-y-6 px-0 pb-8">
            <div className="min-w-0 overflow-hidden rounded-xl bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded text-white ${
                    TASK_CATEGORY_COLORS[task.category]
                  }`}
                >
                  {TASK_CATEGORIES.find((c) => c.value === task.category)?.label}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded text-white ${
                    TASK_PRIORITY_COLORS[task.priority]
                  }`}
                >
                  {TASK_PRIORITIES.find((p) => p.value === task.priority)?.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(task.created_at)}
                </span>
              </div>
              <h2 className="overflow-hidden break-words text-lg font-semibold" title={task.title}>
                {task.title}
              </h2>
              {task.description && (
                <p className="mt-1 overflow-hidden break-words text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </div>

            <div className="min-w-0 overflow-hidden rounded-xl border bg-muted/20 px-5 py-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Atanan
                  </Label>
                  <p className="text-sm font-medium">
                    {assignee?.full_name || assignee?.email || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Otel
                  </Label>
                  <p
                    className="overflow-hidden text-ellipsis text-sm font-medium"
                    title={hotel?.name ?? undefined}
                  >
                    {hotel?.name || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Durum
                  </Label>
                  <p className="text-sm font-medium">
                    {TASK_STATUSES.find((s) => s.value === task.status)?.label}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Bitiş
                  </Label>
                  <p className="text-sm font-medium">
                    {task.due_date ? formatDate(task.due_date) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {task.tags?.length ? (
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                  Etiketler
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <h3 className="font-medium">Yorumlar</h3>
              <form onSubmit={handleAddComment} className="flex min-w-0 gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Yorum yazın..."
                  disabled={!task || !user}
                  className="min-w-0 flex-1"
                />
                <Button type="submit" size="sm" disabled={!commentText.trim()}>
                  Gönder
                </Button>
              </form>
              <div className="space-y-3">
                {comments?.map((c) => {
                  const author = profiles?.find((p) => p.id === c.user_id)
                  return (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={author?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {author?.full_name?.[0] ?? author?.email?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {author?.full_name || author?.email || "Kullanıcı"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(c.created_at)}
                        </p>
                        <p className="text-sm mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  )
                })}
                {(!comments || comments.length === 0) && (
                  <p className="text-sm text-muted-foreground">Henüz yorum yok</p>
                )}
              </div>
            </div>

            {onEdit && (
              <div className="mt-auto pt-6">
                <div className="h-px shrink-0 bg-border mb-4" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task as Task)}
                >
                  Düzenle
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
