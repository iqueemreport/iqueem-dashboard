import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useStore } from "@/stores/auth-store"
import { useNotificationsStore } from "@/stores/notifications-store"
import { toast } from "sonner"

export function useRealtimeNotifications() {
  const { user } = useStore()
  const addNotification = useNotificationsStore((s) => s.addNotification)

  useEffect(() => {
    if (!user?.id) return

    const tasksChannel = supabase
      .channel("tasks-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `assignee_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const record = payload.new as { id: string; title: string }
            addNotification({
              type: "task_assigned",
              title: "Yeni görev atandı",
              message: record.title ?? "Bir görev size atandı.",
              link: `/tasks?open=${record.id}`,
              meta: { task_id: record.id },
            })
            toast.info("Size yeni bir görev atandı: " + (record.title ?? ""))
          }
        }
      )
      .subscribe()

    const budgetsChannel = supabase
      .channel("budgets-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "budgets",
          filter: `assigned_user_id=eq.${user.id}`,
        },
        (payload) => {
          const record = payload.new as { id: string; month?: string; platform?: string }
          const month = record.month ?? ""
          const platform = record.platform ?? ""
          addNotification({
            type: "budget_assigned",
            title: "Yeni bütçe atandı",
            message: `${platform} - ${month} dönemi için bütçe sorumluluğu size atandı.`,
            link: `/budgets?month=${month}`,
            meta: { budget_id: record.id },
          })
          toast.info("Size yeni bir bütçe atandı.")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(budgetsChannel)
    }
  }, [user?.id, addNotification])
}
