import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { Hotel } from "@/types"
import { toast } from "sonner"

export function useHotels() {
  return useQuery({
    queryKey: ["hotels"],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("hotels")
        .select("id, name, country, status")
        .order("name")
      if (error) throw error
      return data as Hotel[]
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useHotel(id: string | null) {
  return useQuery({
    queryKey: ["hotels", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data as Hotel
    },
    enabled: !!id,
  })
}

export function useCreateHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; country: string; status?: "active" | "inactive" }) => {
      const { data, error } = await supabase
        .from("hotels")
        .insert({
          name: input.name,
          country: input.country,
          status: input.status ?? "active",
        })
        .select()
        .single()
      if (error) throw error
      return data as Hotel
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotels"] })
      toast.success("Otel eklendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateHotel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<Hotel> & { id: string }) => {
      const { data, error } = await supabase
        .from("hotels")
        .update(input)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data as Hotel
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotels"] })
      toast.success("Otel güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
