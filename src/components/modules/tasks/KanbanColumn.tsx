import { useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import { TaskCard } from "./TaskCard"
import type { Task, TaskStatus } from "@/types"
import { cn } from "@/lib/utils"
import { TASK_STATUS_COLORS } from "@/constants/colors"

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

function DraggableTaskCard({
  task,
  onClick,
}: {
  task: import("@/types").Task
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <TaskCard
        task={task}
        onClick={onClick}
        className={cn(isDragging && "opacity-50 scale-95")}
      />
    </div>
  )
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const statusColor = TASK_STATUS_COLORS[id] ?? "bg-slate-500"

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[260px] min-w-0 flex-col overflow-hidden rounded-xl border bg-muted/20 p-4 transition-all duration-200",
        isOver && "ring-2 ring-primary/40 bg-muted/50 scale-[1.02]"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span
          className={cn(
            "flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-medium text-white",
            statusColor
          )}
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 py-8 text-center text-sm text-muted-foreground">
            <p>Bu aşamada görev yok</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}
