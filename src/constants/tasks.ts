import type { TaskCategory, TaskPriority, TaskStatus } from "@/types"

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "general", label: "Genel" },
  { value: "ads", label: "Reklamlar" },
  { value: "social_media", label: "Sosyal Medya" },
  { value: "reports", label: "Raporlar" },
]

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "urgent", label: "Acil" },
]

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Yapılacak" },
  { value: "in_progress", label: "Devam Ediyor" },
  { value: "in_review", label: "İncelemede" },
  { value: "done", label: "Tamamlandı" },
]
