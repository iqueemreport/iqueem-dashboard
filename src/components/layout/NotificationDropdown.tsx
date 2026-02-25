import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationsStore } from "@/stores/notifications-store"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export function NotificationDropdown() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationsStore()

  function handleClick(id: string, link?: string) {
    markAsRead(id)
    if (link) navigate(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="font-medium text-sm">Bildirimler</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                Tümünü okundu işaretle
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearAll}
              >
                Temizle
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p>Henüz bildirim yok</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                  onClick={() => handleClick(n.id, n.link)}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        n.read ? "bg-muted" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!n.read ? "font-medium" : "text-muted-foreground"}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
