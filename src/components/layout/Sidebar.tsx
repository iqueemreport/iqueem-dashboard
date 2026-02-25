import { NavLink } from "react-router-dom"
import { usePrefetchAdmin } from "@/hooks/usePrefetchAdmin"
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch"
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/stores/auth-store"
import { useStore as useSidebarStore } from "@/stores/sidebar-store"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks", icon: CheckSquare, label: "Görevler" },
  { to: "/budgets", icon: Wallet, label: "Kampanya Bütçeleri" },
  { to: "/campaigns", icon: Calendar, label: "Kampanya Detayları" },
  { to: "/reports", icon: FileText, label: "Otel Raporları" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
]

const adminItem = {
  to: "/admin",
  icon: Shield,
  label: "Admin",
}

export function Sidebar() {
  const { profile } = useStore()
  const { collapsed, toggle } = useSidebarStore()
  const prefetchAdmin = usePrefetchAdmin()
  const { prefetchCampaigns, prefetchReports, prefetchAnalytics } = useRoutePrefetch()
  const isAdmin = profile?.role === "admin"

  const getPrefetch = (to: string) => {
    if (to === "/campaigns") return prefetchCampaigns
    if (to === "/reports") return prefetchReports
    if (to === "/analytics") return prefetchAnalytics
    return undefined
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="font-semibold text-lg">IQUEEM</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => getPrefetch(item.to)?.()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <NavLink
                to={adminItem.to}
                onMouseEnter={() => prefetchAdmin()}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )
                }
              >
                <adminItem.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{adminItem.label}</span>}
              </NavLink>
            </>
          )}
        </nav>
      </ScrollArea>
    </aside>
  )
}
