export type NotificationType = "budget_assigned" | "task_assigned"

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
  meta?: Record<string, string>
}
