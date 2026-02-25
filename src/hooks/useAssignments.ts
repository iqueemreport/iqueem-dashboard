import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { PlatformAssignment, HotelAssignment } from "@/types"
import { toast } from "sonner"

const PLATFORM_ASSIGNMENTS_ALL_KEY = ["platform-assignments-all"] as const
const HOTEL_ASSIGNMENTS_ALL_KEY = ["hotel-assignments-all"] as const

export function useAllPlatformAssignments() {
  return useQuery({
    queryKey: PLATFORM_ASSIGNMENTS_ALL_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_assignments")
        .select("id, user_id, platform")
      if (error) throw error
      return data as PlatformAssignment[]
    },
  })
}

export function useAllHotelAssignments() {
  return useQuery({
    queryKey: HOTEL_ASSIGNMENTS_ALL_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_assignments")
        .select("id, user_id, hotel_id")
      if (error) throw error
      return data as HotelAssignment[]
    },
  })
}

export function usePlatformAssignments(userId: string | null) {
  return useQuery({
    queryKey: ["platform-assignments", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("platform_assignments")
        .select("*")
        .eq("user_id", userId)
      if (error) throw error
      return data as PlatformAssignment[]
    },
    enabled: !!userId,
  })
}

export function useHotelAssignments(userId: string | null) {
  return useQuery({
    queryKey: ["hotel-assignments", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("hotel_assignments")
        .select("*")
        .eq("user_id", userId)
      if (error) throw error
      return data as HotelAssignment[]
    },
    enabled: !!userId,
  })
}

export function useAddPlatformAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      user_id,
      platform,
    }: {
      user_id: string
      platform: string
    }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("platform_assignments")
        .insert({ user_id, platform })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as PlatformAssignment
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["platform-assignments", v.user_id] })
      qc.invalidateQueries({ queryKey: PLATFORM_ASSIGNMENTS_ALL_KEY })
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Platform ataması eklendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRemovePlatformAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { error } = await supabase
        .from("platform_assignments")
        .delete()
        .eq("id", id)
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["platform-assignments", userId] })
      qc.invalidateQueries({ queryKey: PLATFORM_ASSIGNMENTS_ALL_KEY })
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Platform ataması kaldırıldı")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useAddHotelAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      user_id,
      hotel_id,
    }: {
      user_id: string
      hotel_id: string
    }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("hotel_assignments")
        .insert({ user_id, hotel_id })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as HotelAssignment
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["hotel-assignments", v.user_id] })
      qc.invalidateQueries({ queryKey: HOTEL_ASSIGNMENTS_ALL_KEY })
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Otel ataması eklendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRemoveHotelAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { error } = await supabase
        .from("hotel_assignments")
        .delete()
        .eq("id", id)
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["hotel-assignments", userId] })
      qc.invalidateQueries({ queryKey: HOTEL_ASSIGNMENTS_ALL_KEY })
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Otel ataması kaldırıldı")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
