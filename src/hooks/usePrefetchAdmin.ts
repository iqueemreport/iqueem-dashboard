import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/types"

export function usePrefetchAdmin() {
  const qc = useQueryClient()

  return useCallback(async () => {
    await Promise.all([
      qc.prefetchQuery({
        queryKey: ["profiles"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, email, full_name, avatar_url, role")
            .order("full_name")
          if (error) throw error
          return data as Profile[]
        },
      }),
      qc.prefetchQuery({
        queryKey: ["hotels"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("hotels")
            .select("id, name, country, status")
            .order("name")
          if (error) throw error
          return data
        },
      }),
    ])
  }, [qc])
}
