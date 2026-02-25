import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { Campaign } from "@/types"
import { toast } from "sonner"

interface CampaignFilters {
  hotel_id?: string
  platform?: string
  target_country?: string
  objective?: string
  status?: string
  date_from?: string
  date_to?: string
}

export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      let q = supabase
        .from("campaigns")
        .select("*")
        .order("start_date", { ascending: false })

      if (filters.hotel_id) q = q.eq("hotel_id", filters.hotel_id)
      if (filters.platform) q = q.eq("platform", filters.platform)
      if (filters.target_country) q = q.eq("target_country", filters.target_country)
      if (filters.objective) q = q.eq("objective", filters.objective)
      if (filters.status) q = q.eq("status", filters.status)
      if (filters.date_from) q = q.gte("end_date", filters.date_from)
      if (filters.date_to) q = q.lte("start_date", filters.date_to)

      const { data, error } = await q
      if (error) throw error
      return data as Campaign[]
    },
  })
}

export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data as Campaign
    },
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Campaign> & { created_by: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          hotel_id: input.hotel_id!,
          budget_id: input.budget_id ?? null,
          name: input.name!,
          platform: input.platform!,
          target_country: input.target_country!,
          objective: input.objective!,
          currency: input.currency!,
          budget_amount: input.budget_amount ?? 0,
          spent_amount: input.spent_amount ?? 0,
          start_date: input.start_date!,
          end_date: input.end_date!,
          status: input.status ?? "planned",
          notes: input.notes ?? null,
          created_by: input.created_by,
        })
        .select()
        .single()
      if (error) throw error
      return data as Campaign
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] })
      toast.success("Kampanya oluşturuldu")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(input)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data as Campaign
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] })
      qc.invalidateQueries({ queryKey: ["campaigns", v.id] })
      toast.success("Kampanya güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
