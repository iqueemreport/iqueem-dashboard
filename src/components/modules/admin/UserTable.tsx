import { useState, useMemo } from "react"
import { MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDrawer } from "./UserDrawer"
import { useProfiles, useUpdateProfileName } from "@/hooks/useProfiles"
import {
  useAllPlatformAssignments,
  useAllHotelAssignments,
} from "@/hooks/useAssignments"
import { useHotels } from "@/hooks/useHotels"
import { ROLES } from "@/constants/roles"
import { PLATFORMS } from "@/constants/platforms"
import type { Profile } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export function UserTable() {
  const { data: profiles, isLoading, isError, error } = useProfiles()
  const { data: allPlatforms } = useAllPlatformAssignments()
  const { data: allHotels } = useAllHotelAssignments()
  const { data: hotels } = useHotels()
  const updateName = useUpdateProfileName()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const platformsByUser = useMemo(() => {
    const m = new Map<string, { id: string; platform: string }[]>()
    allPlatforms?.forEach((a) => {
      const list = m.get(a.user_id) ?? []
      list.push({ id: a.id, platform: a.platform })
      m.set(a.user_id, list)
    })
    return m
  }, [allPlatforms])

  const hotelsByUser = useMemo(() => {
    const m = new Map<string, { id: string; hotel_id: string }[]>()
    allHotels?.forEach((a) => {
      const list = m.get(a.user_id) ?? []
      list.push({ id: a.id, hotel_id: a.hotel_id })
      m.set(a.user_id, list)
    })
    return m
  }, [allHotels])

  const hotelName = (id: string) => hotels?.find((h) => h.id === id)?.name ?? id

  function handleOpen(user: Profile) {
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  function startEdit(profile: Profile) {
    setEditingId(profile.id)
    setEditName(profile.full_name ?? "")
  }

  async function saveName(profile: Profile) {
    if (editingId !== profile.id) return
    const trimmed = editName.trim()
    if (trimmed !== (profile.full_name ?? "")) {
      await updateName.mutateAsync({ id: profile.id, full_name: trimmed || null })
    }
    setEditingId(null)
    setEditName("")
  }

  const roleLabel = (role: Profile["role"]) =>
    ROLES.find((r) => r.value === role)?.label ?? role

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground space-y-2">
        <p>Kullanıcılar yüklenirken hata oluştu.</p>
        <p className="text-sm">{error?.message}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Yeniden Dene
        </Button>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Otel</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!profiles?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Henüz kullanıcı yok
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {profile.full_name?.[0] ?? profile.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    {editingId === profile.id ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => saveName(profile)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName(profile)
                            if (e.key === "Escape") {
                              setEditingId(null)
                              setEditName("")
                            }
                          }}
                          className="h-8"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group min-w-0">
                        <span className="font-medium truncate">
                          {profile.full_name || "—"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => startEdit(profile)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{roleLabel(profile.role)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {(platformsByUser.get(profile.id) ?? []).map((a) => (
                      <Badge key={a.id} variant="outline" className="text-xs">
                        {PLATFORMS.find((p) => p.value === a.platform)?.label ?? a.platform}
                      </Badge>
                    ))}
                    {!(platformsByUser.get(profile.id)?.length) && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {(hotelsByUser.get(profile.id) ?? []).map((a) => (
                      <Badge key={a.id} variant="outline" className="text-xs">
                        {hotelName(a.hotel_id)}
                      </Badge>
                    ))}
                    {!(hotelsByUser.get(profile.id)?.length) && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpen(profile)}>
                        Düzenle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <UserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        profile={selectedUser}
      />
    </>
  )
}
