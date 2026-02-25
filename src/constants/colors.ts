import type { TaskCategory, TaskPriority } from "@/types"

export const TASK_CATEGORY_COLORS: Record<TaskCategory, string> = {
  general: "bg-slate-500",
  ads: "bg-blue-500",
  social_media: "bg-purple-500",
  reports: "bg-amber-500",
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
}

export const TASK_STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-500",
  in_progress: "bg-blue-500",
  in_review: "bg-amber-500",
  done: "bg-green-500",
}

export const PLATFORM_COLORS: Record<string, string> = {
  google: "#4285F4",
  meta: "#1877F2",
  dv360: "#FF5722",
  yandex: "#FC3F1D",
  hybrid: "#6366F1",
  vk: "#4C75A3",
}
