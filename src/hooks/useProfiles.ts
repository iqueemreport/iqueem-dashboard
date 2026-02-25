import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { Profile } from "@/types"
import { toast } from "sonner"

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, role")
        .order("full_name")
      if (error) throw error
      return data as Profile[]
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpdateProfileRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: string
      role: Profile["role"]
    }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as Profile
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Rol güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateProfileName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      full_name,
    }: {
      id: string
      full_name: string | null
    }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("profiles")
        .update({ full_name: full_name?.trim() || null })
        .eq("id", id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as Profile
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Kullanıcı adı güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
