import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Sun, Moon, LogOut, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/stores/auth-store"
import { useSignOut } from "@/hooks/useAuth"
import { useThemeStore } from "@/stores/theme-store"
import { cn } from "@/lib/utils"
import { ROLES } from "@/constants/roles"
import { NotificationDropdown } from "./NotificationDropdown"
import { ChangePasswordModal } from "./ChangePasswordModal"

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const { profile } = useStore()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState("")

  const roleLabel =
    ROLES.find((r) => r.value === profile?.role)?.label ?? profile?.role
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6">
      <h1 className="font-semibold text-lg">{title}</h1>
      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="relative hidden md:block max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <NotificationDropdown />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className={cn("h-4 w-4", theme === "dark" && "hidden")} />
          <Moon className={cn("h-4 w-4", theme === "light" && "hidden")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {profile?.full_name?.[0] ?? profile?.email?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {profile?.full_name ?? "Kullanıcı"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.email}
                </p>
                <Badge variant="secondary" className="mt-1 w-fit text-xs">
                  {roleLabel}
                </Badge>
              </div>
            </div>
            <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
              <Key className="mr-2 h-4 w-4" />
              Şifre Değiştir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChangePasswordModal open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      </div>
    </header>
  )
}
