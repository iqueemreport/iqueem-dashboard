import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { Task } from "@/types"
import { toast } from "sonner"

interface TaskFilters {
  category?: string
  assignee_id?: string
  hotel_id?: string
  priority?: string
  status?: string
  date_from?: string
  date_to?: string
  my_tasks?: boolean
  userId?: string
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      let q = supabase.from("tasks").select("*").order("created_at", {
        ascending: false,
      })

      if (filters.category) q = q.eq("category", filters.category)
      if (filters.assignee_id) q = q.eq("assignee_id", filters.assignee_id)
      if (filters.hotel_id) q = q.eq("hotel_id", filters.hotel_id)
      if (filters.priority) q = q.eq("priority", filters.priority)
      if (filters.status) q = q.eq("status", filters.status)
      if (filters.date_from) q = q.gte("due_date", filters.date_from)
      if (filters.date_to) q = q.lte("due_date", filters.date_to)
      if (filters.my_tasks && filters.userId) {
        q = q.or(
          `assignee_id.eq.${filters.userId},created_by.eq.${filters.userId}`
        )
      }

      const { data, error } = await q
      if (error) throw error
      return data as Task[]
    },
  })
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data as Task
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Task> & { created_by: string }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: input.title!,
          description: input.description ?? null,
          category: input.category!,
          assignee_id: input.assignee_id ?? null,
          hotel_id: input.hotel_id ?? null,
          priority: input.priority ?? "medium",
          status: input.status ?? "todo",
          due_date: input.due_date ?? null,
          tags: input.tags ?? [],
          created_by: input.created_by,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as Task
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Görev oluşturuldu")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<Task> & { id: string }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("tasks")
        .update(input)
        .eq("id", id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as Task
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
      qc.invalidateQueries({ queryKey: ["tasks", v.id] })
      toast.success("Görev güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Görev silindi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
