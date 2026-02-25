import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { TaskComment } from "@/types"

export function useTaskComments(taskId: string | null) {
  return useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: async () => {
      if (!taskId) return []
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true })
      if (error) throw error
      return data as TaskComment[]
    },
    enabled: !!taskId,
  })
}

export function useAddTaskComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      task_id,
      user_id,
      content,
    }: {
      task_id: string
      user_id: string
      content: string
    }) => {
      const { data, error } = await supabase
        .from("task_comments")
        .insert({ task_id, user_id, content })
        .select()
        .single()
      if (error) throw error
      return data as TaskComment
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["task-comments", data.task_id] })
    },
  })
}
