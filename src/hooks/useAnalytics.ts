import { useQuery } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"

interface AnalyticsFilters {
  date_from?: string
  date_to?: string
  hotel_ids?: string[]
  platforms?: string[]
  countries?: string[]
}

export function useAnalytics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["analytics", filters],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const [tasksRes, campaignsRes, budgetsRes] = await Promise.all([
        supabase.from("tasks").select("id, status, category, created_at"),
        supabase.from("campaigns").select("id, hotel_id, platform, target_country, status, budget_amount, spent_amount, start_date, end_date"),
        supabase.from("budgets").select("id, hotel_id, platform, target_country, currency, amount, spent_amount, month"),
      ])

      if (tasksRes.error) throw tasksRes.error
      if (campaignsRes.error) throw campaignsRes.error
      if (budgetsRes.error) throw budgetsRes.error

      type TaskRow = { id: string; status: string; category: string; created_at?: string }
      type CampaignRow = { id: string; hotel_id: string; platform: string; target_country: string; status: string; budget_amount: number; spent_amount: number; start_date?: string; end_date?: string }
      type BudgetRow = { id: string; hotel_id: string; platform: string; target_country: string; currency: string; amount: number; spent_amount: number; month?: string }

      let tasks = (tasksRes.data ?? []) as TaskRow[]
      let campaigns = (campaignsRes.data ?? []) as CampaignRow[]
      let budgets = (budgetsRes.data ?? []) as BudgetRow[]

      const monthFrom = filters.date_from?.slice(0, 7)
      const monthTo = filters.date_to?.slice(0, 7)

      if (filters.date_from) {
        tasks = tasks.filter((t) => (t.created_at ?? "").slice(0, 10) >= filters.date_from!)
        campaigns = campaigns.filter((c) => (c.start_date ?? "") >= filters.date_from!)
        budgets = budgets.filter((b) => (b.month ?? "") >= (monthFrom ?? ""))
      }
      if (filters.date_to) {
        tasks = tasks.filter((t) => (t.created_at ?? "").slice(0, 10) <= filters.date_to!)
        campaigns = campaigns.filter((c) => (c.end_date ?? "") <= filters.date_to!)
        budgets = budgets.filter((b) => (b.month ?? "") <= (monthTo ?? "9999-12"))
      }
      if (filters.hotel_ids?.length) {
        campaigns = campaigns.filter((c) => filters.hotel_ids!.includes(c.hotel_id))
        budgets = budgets.filter((b) => filters.hotel_ids!.includes(b.hotel_id))
      }
      if (filters.platforms?.length) {
        campaigns = campaigns.filter((c) => filters.platforms!.includes(c.platform))
        budgets = budgets.filter((b) => filters.platforms!.includes(b.platform))
      }
      if (filters.countries?.length) {
        campaigns = campaigns.filter((c) =>
          filters.countries!.includes(c.target_country)
        )
        budgets = budgets.filter((b) =>
          filters.countries!.includes(b.target_country)
        )
      }

      return { tasks, campaigns, budgets }
    },
  })
}
