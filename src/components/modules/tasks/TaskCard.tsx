import { GripVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { TASK_CATEGORY_COLORS, TASK_PRIORITY_COLORS } from "@/constants/colors"
import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/constants/tasks"
import { formatDate } from "@/lib/utils/format"
import type { Task } from "@/types"
import { cn } from "@/lib/utils"
import { useProfiles } from "@/hooks/useProfiles"
import { useHotels } from "@/hooks/useHotels"

interface TaskCardProps {
  task: Task
  onClick?: () => void
  className?: string
}

export function TaskCard({ task, onClick, className }: TaskCardProps) {
  const { data: profiles } = useProfiles()
  const { data: hotels } = useHotels()
  const assignee = profiles?.find((p) => p.id === task.assignee_id)
  const hotel = hotels?.find((h) => h.id === task.hotel_id)
  const categoryLabel = TASK_CATEGORIES.find((c) => c.value === task.category)?.label ?? task.category
  const priorityLabel = TASK_PRIORITIES.find((p) => p.value === task.priority)?.label ?? task.priority

  return (
    <Card
      className={cn(
        "group cursor-grab active:cursor-grabbing overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/20",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 overflow-hidden">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-xs font-medium text-white",
                  TASK_CATEGORY_COLORS[task.category]
                )}
              >
                {categoryLabel}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-xs font-medium text-white",
                  TASK_PRIORITY_COLORS[task.priority]
                )}
              >
                {priorityLabel}
              </span>
            </div>
            <p className="overflow-hidden break-words font-medium text-sm leading-snug line-clamp-2" title={task.title}>
              {task.title}
            </p>
            {task.due_date && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📅</span>
                {formatDate(task.due_date)}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex min-w-0 items-center gap-2">
                {assignee ? (
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={assignee.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-medium">
                      {assignee.full_name?.[0] ?? assignee.email[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
                {hotel && (
                  <span className="truncate text-xs text-muted-foreground" title={hotel.name}>
                    {hotel.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
