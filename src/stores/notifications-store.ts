import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppNotification } from "@/types/notifications"

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, "id" | "read" | "created_at">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (n) =>
        set((s) => {
          const newNotification: AppNotification = {
            ...n,
            id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            read: false,
            created_at: new Date().toISOString(),
          }
          return {
            notifications: [newNotification, ...s.notifications].slice(0, 50),
            unreadCount: s.unreadCount + 1,
          }
        }),

      markAsRead: (id) =>
        set((s) => {
          const wasUnread = s.notifications.find((n) => n.id === id)?.read === false
          return {
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
          }
        }),

      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: "notifications" }
  )
)
