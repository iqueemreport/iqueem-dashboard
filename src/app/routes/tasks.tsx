import { useState } from "react"
import { LayoutGrid, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { KanbanBoard } from "@/components/modules/tasks/KanbanBoard"
import { TaskForm } from "@/components/modules/tasks/TaskForm"
import { TaskDrawer } from "@/components/modules/tasks/TaskDrawer"
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/useTasks"
import { useProfiles } from "@/hooks/useProfiles"
import { useHotels } from "@/hooks/useHotels"
import { useStore } from "@/stores/auth-store"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from "@/constants/tasks"
import { formatDate } from "@/lib/utils/format"
import type { Task } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

type ViewMode = "kanban" | "list"

export function TasksPage() {
  const { user } = useStore()
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [category, setCategory] = useState<string>("")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [hotelId, setHotelId] = useState<string>("")
  const [priority, setPriority] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [myTasks, setMyTasks] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const filters = {
    category: category || undefined,
    assignee_id: assigneeId || undefined,
    hotel_id: hotelId || undefined,
    priority: priority || undefined,
    status: status || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    my_tasks: myTasks,
    userId: user?.id,
  }

  const { data: tasks, isLoading, isError, error } = useTasks(filters)
  const { data: profiles } = useProfiles()
  const { data: hotels } = useHotels()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  function handleTaskClick(task: Task) {
    setSelectedTask(task)
    setDrawerOpen(true)
  }

  async function handleCreate(data: Partial<Task>) {
    if (!user?.id) {
      throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.")
    }
    await createTask.mutateAsync({ ...data, created_by: user.id } as Partial<Task> & {
      created_by: string
    })
    setFormOpen(false)
  }

  async function handleUpdate(data: Partial<Task>) {
    if (!editingTask) {
      throw new Error("Düzenlenecek görev seçilmedi.")
    }
    const { created_by: _, ...updateData } = data
    await updateTask.mutateAsync({ id: editingTask.id, ...updateData })
    setFormOpen(false)
    setEditingTask(null)
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
    setDrawerOpen(false)
  }

  const assigneeName = (id: string | null) =>
    id ? profiles?.find((p) => p.id === id)?.full_name || profiles?.find((p) => p.id === id)?.email || id : "—"
  const hotelName = (id: string | null) =>
    id ? hotels?.find((h) => h.id === id)?.name || id : "—"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={category || "all"}
          onValueChange={(v) => setCategory(v === "all" ? "" : v)}
        >
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            {TASK_CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button type="button" onClick={() => { setEditingTask(null); setFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Görev
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Button
          type="button"
          variant={myTasks ? "default" : "outline"}
          size="sm"
          onClick={() => setMyTasks(!myTasks)}
        >
          Benim Görevlerim
        </Button>
        <Select value={assigneeId || "all"} onValueChange={(v) => setAssigneeId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Atanan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {profiles?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name || p.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={hotelId || "all"} onValueChange={(v) => setHotelId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Otel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {hotels?.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority || "all"} onValueChange={(v) => setPriority(v === "all" ? "" : v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-40"
          placeholder="Başlangıç"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-40"
          placeholder="Bitiş"
        />
        <div className="flex gap-1 ml-auto">
          <Button
            type="button"
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          Görevler yüklenirken hata oluştu: {error?.message ?? "Bilinmeyen hata"}
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard tasks={tasks ?? []} onTaskClick={handleTaskClick} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Atanan</TableHead>
                <TableHead>Otel</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Bitiş</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!tasks?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Görev bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleTaskClick(task)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {TASK_CATEGORIES.find((c) => c.value === task.category)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{assigneeName(task.assignee_id)}</TableCell>
                    <TableCell>{hotelName(task.hotel_id)}</TableCell>
                    <TableCell>{TASK_PRIORITIES.find((p) => p.value === task.priority)?.label}</TableCell>
                    <TableCell>{TASK_STATUSES.find((s) => s.value === task.status)?.label}</TableCell>
                    <TableCell>{task.due_date ? formatDate(task.due_date) : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingTask(null)
        }}
        task={editingTask}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        createdBy={user?.id ?? ""}
      />

      <TaskDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        taskId={selectedTask?.id ?? null}
        onEdit={handleEdit}
      />
    </div>
  )
}
