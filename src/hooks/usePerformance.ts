import { useQuery } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"

interface PerformanceFilters {
  date_from?: string
  date_to?: string
}

export interface UserPerformance {
  user_id: string
  full_name: string
  email: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  avg_completion_hours: number
}

export function usePerformance(filters: PerformanceFilters = {}) {
  return useQuery({
    queryKey: ["performance", filters],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const [tasksRes, profilesRes] = await Promise.all([
        supabase.from("tasks").select("id, assignee_id, status, created_at, updated_at"),
        supabase.from("profiles").select("id, full_name, email"),
      ])
      if (tasksRes.error) throw tasksRes.error
      if (profilesRes.error) throw profilesRes.error
      const tasks = tasksRes.data
      const profiles = profilesRes.data

      let filtered = tasks ?? []

      if (filters.date_from) {
        filtered = filtered.filter(
          (t) => (t.created_at ?? "").slice(0, 10) >= filters.date_from!
        )
      }
      if (filters.date_to) {
        filtered = filtered.filter(
          (t) => (t.created_at ?? "").slice(0, 10) <= filters.date_to!
        )
      }

      const byUser = new Map<
        string,
        {
          total: number
          completed: number
          completionTimes: number[]
        }
      >()

      filtered.forEach((t) => {
        const uid = t.assignee_id ?? "_unassigned"
        if (!byUser.has(uid)) {
          byUser.set(uid, { total: 0, completed: 0, completionTimes: [] })
        }
        const row = byUser.get(uid)!
        row.total++

        if (t.status === "done") {
          row.completed++
          if (t.created_at && t.updated_at) {
            const created = new Date(t.created_at).getTime()
            const updated = new Date(t.updated_at).getTime()
            const hours = (updated - created) / (1000 * 60 * 60)
            row.completionTimes.push(hours)
          }
        }
      })

      const result: UserPerformance[] = []

      byUser.forEach((stats, userId) => {
        const profile = profiles?.find((p) => p.id === userId)
        const avgHours =
          stats.completionTimes.length > 0
            ? stats.completionTimes.reduce((a, b) => a + b, 0) /
              stats.completionTimes.length
            : 0

        result.push({
          user_id: userId,
          full_name: profile?.full_name ?? (userId === "_unassigned" ? "Atanmadı" : "—"),
          email: profile?.email ?? (userId === "_unassigned" ? "" : "—"),
          total_tasks: stats.total,
          completed_tasks: stats.completed,
          completion_rate:
            stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
          avg_completion_hours: Math.round(avgHours * 10) / 10,
        })
      })

      return result
        .filter((r) => r.user_id !== "_unassigned" || r.total_tasks > 0)
        .sort((a, b) => b.completed_tasks - a.completed_tasks)
    },
  })
}
