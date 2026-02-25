// Database types for IQUEEM Agency Dashboard

export type UserRole = "admin" | "manager" | "specialist"

export type Platform =
  | "google"
  | "meta"
  | "dv360"
  | "yandex"
  | "hybrid"
  | "vk"

export type TaskCategory =
  | "general"
  | "ads"
  | "social_media"
  | "reports"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done"

export type CampaignObjective =
  | "traffic"
  | "branding"
  | "conversion"
  | "awareness"
  | "engagement"
  | "retargeting"

export type CampaignStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"

export type Currency = "EUR" | "USD" | "TRY"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface PlatformAssignment {
  id: string
  user_id: string
  platform: Platform
  created_at: string
}

export interface HotelAssignment {
  id: string
  user_id: string
  hotel_id: string
  created_at: string
}

export interface Hotel {
  id: string
  name: string
  country: string
  status: "active" | "inactive"
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  category: TaskCategory
  assignee_id: string | null
  hotel_id: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  tags: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
}

export interface TaskAttachment {
  id: string
  task_id: string
  user_id: string
  file_name: string
  file_url: string
  created_at: string
}

export interface Budget {
  id: string
  hotel_id: string
  month: string // YYYY-MM
  platform: Platform
  target_country: string
  currency: Currency
  amount: number
  spent_amount: number
  assigned_user_id: string | null
  notes: string | null
  created_by: string
  updated_at: string
}

export interface Campaign {
  id: string
  hotel_id: string
  budget_id: string | null
  name: string
  platform: Platform
  target_country: string
  objective: CampaignObjective
  currency: Currency
  budget_amount: number
  spent_amount: number
  start_date: string
  end_date: string
  status: CampaignStatus
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface HotelReport {
  id: string
  hotel_id: string
  title: string
  period_month: string // YYYY-MM
  file_url: string
  file_name: string
  uploaded_by: string
  created_at: string
}
