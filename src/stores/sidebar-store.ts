import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  collapsed: boolean
  toggle: () => void
}

export const useStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: "sidebar-state" }
  )
)
