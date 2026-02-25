import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { Budget } from "@/types"
import { toast } from "sonner"

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ["budgets", month],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      let q = supabase
        .from("budgets")
        .select("*")
        .order("hotel_id")

      if (month) q = q.eq("month", month)

      const { data, error } = await q
      if (error) throw error
      return data as Budget[]
    },
  })
}

export function useBudget(id: string | null) {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data as Budget
    },
    enabled: !!id,
  })
}

export function useCreateBudgets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      rows: Array<{
        hotel_id: string
        month: string
        platform: string
        target_country: string
        currency: string
        amount: number
        notes?: string | null
        created_by: string
      }>
    ) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.")
      }

      const { data: paData, error: paError } = await supabase
        .from("platform_assignments")
        .select("user_id, platform")
      if (paError) throw new Error(paError.message)

      const paMap = new Map<string, string>()
      paData?.forEach((pa: { user_id: string; platform: string }) => {
        paMap.set(pa.platform, pa.user_id)
      })

      const inserts = rows.map((r) => ({
        hotel_id: r.hotel_id,
        month: r.month,
        platform: r.platform,
        target_country: r.target_country,
        currency: r.currency,
        amount: r.amount,
        spent_amount: 0,
        assigned_user_id: paMap.get(r.platform) ?? null,
        notes: r.notes ?? null,
        created_by: r.created_by,
      }))

      const { data, error } = await supabase
        .from("budgets")
        .insert(inserts)
        .select()
      if (error) throw new Error(error.message)
      return data as Budget[]
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] })
      toast.success("Bütçeler eklendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] })
      toast.success("Bütçe silindi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(input)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data as Budget
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["budgets"] })
      qc.invalidateQueries({ queryKey: ["budgets", v.id] })
      toast.success("Bütçe güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
