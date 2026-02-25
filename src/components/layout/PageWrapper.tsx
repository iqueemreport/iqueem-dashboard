import { useEffect } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications"
import { usePrefetchAdmin } from "@/hooks/usePrefetchAdmin"
import { useStore } from "@/stores/auth-store"

interface PageWrapperProps {
  children: React.ReactNode
  title: string
}

export function PageWrapper({ children, title }: PageWrapperProps) {
  useRealtimeNotifications()
  const { profile } = useStore()
  const prefetchAdmin = usePrefetchAdmin()

  useEffect(() => {
    if (profile?.role === "admin") {
      prefetchAdmin()
    }
  }, [profile?.role, prefetchAdmin])

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
