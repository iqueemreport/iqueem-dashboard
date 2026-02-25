import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { useMemo, useState } from "react"
import { KanbanColumn } from "./KanbanColumn"
import { TaskCard } from "./TaskCard"
import { useUpdateTask } from "@/hooks/useTasks"
import type { Task, TaskStatus } from "@/types"
import { TASK_STATUSES } from "@/constants/tasks"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const updateTask = useUpdateTask()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const columns = useMemo(() => {
    const cols: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    }
    tasks.forEach((t) => {
      if (cols[t.status]) cols[t.status].push(t)
    })
    return cols
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragStart(e: DragStartEvent) {
    const task = tasks.find((t) => t.id === e.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = e
    if (!over) return
    const taskId = active.id as string
    let newStatus: TaskStatus
    if (TASK_STATUSES.some((s) => s.value === over.id)) {
      newStatus = over.id as TaskStatus
    } else {
      const overTask = tasks.find((t) => t.id === over.id)
      newStatus = overTask?.status ?? (over.id as TaskStatus)
    }
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    updateTask.mutate({ id: taskId, status: newStatus })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            id={status.value}
            title={status.label}
            tasks={columns[status.value]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onClick={() => onTaskClick(activeTask)}
            className="shadow-xl ring-2 ring-primary/20 rotate-1 scale-105"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
