import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUpdateProfileRole } from "@/hooks/useProfiles"
import {
  usePlatformAssignments,
  useHotelAssignments,
  useAddPlatformAssignment,
  useRemovePlatformAssignment,
  useAddHotelAssignment,
  useRemoveHotelAssignment,
} from "@/hooks/useAssignments"
import { useHotels } from "@/hooks/useHotels"
import { PLATFORMS } from "@/constants/platforms"
import { ROLES } from "@/constants/roles"
import type { Profile } from "@/types"

interface UserDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
}

export function UserDrawer({ open, onOpenChange, profile }: UserDrawerProps) {
  const [roleSelect, setRoleSelect] = useState(profile?.role ?? "specialist")

  useEffect(() => {
    if (profile) setRoleSelect(profile.role)
  }, [profile])
  const [platformSelect, setPlatformSelect] = useState<string>("")
  const [hotelSelect, setHotelSelect] = useState<string>("")

  const updateRole = useUpdateProfileRole()
  const { data: platforms } = usePlatformAssignments(profile?.id ?? null)
  const { data: hotelAssignments } = useHotelAssignments(profile?.id ?? null)
  const { data: hotels } = useHotels()
  const addPlatform = useAddPlatformAssignment()
  const removePlatform = useRemovePlatformAssignment()
  const addHotel = useAddHotelAssignment()
  const removeHotel = useRemoveHotelAssignment()

  const assignedPlatforms = platforms ?? []
  const assignedHotelIds = new Set(hotelAssignments?.map((a) => a.hotel_id) ?? [])
  const availablePlatforms = PLATFORMS.filter(
    (p) => !assignedPlatforms.some((a) => a.platform === p.value)
  )
  const availableHotels = hotels?.filter((h) => !assignedHotelIds.has(h.id)) ?? []

  async function handleRoleChange(role: Profile["role"]) {
    if (!profile) return
    setRoleSelect(role)
    await updateRole.mutateAsync({ id: profile.id, role })
  }

  function handleAddPlatform() {
    if (!profile || !platformSelect) return
    addPlatform.mutate({ user_id: profile.id, platform: platformSelect })
    setPlatformSelect("")
  }

  function handleRemovePlatform(id: string) {
    removePlatform.mutate({ id, userId: profile!.id })
  }

  function handleAddHotel() {
    if (!profile || !hotelSelect) return
    addHotel.mutate({ user_id: profile.id, hotel_id: hotelSelect })
    setHotelSelect("")
  }

  function handleRemoveHotel(assignmentId: string) {
    if (!profile) return
    removeHotel.mutate({ id: assignmentId, userId: profile.id })
  }

  const hotelName = (hotelId: string) =>
    hotels?.find((h) => h.id === hotelId)?.name ?? hotelId

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto px-6 py-4">
        <SheetHeader className="pr-10">
          <SheetTitle>Kullanıcı Düzenle</SheetTitle>
        </SheetHeader>
        {!profile ? (
          <div className="py-8 text-center text-muted-foreground">
            Kullanıcı seçilmedi
          </div>
        ) : (
          <div className="mt-8 flex flex-1 flex-col space-y-6 px-0 pb-8 overflow-y-auto">
            <div className="rounded-xl bg-muted/40 px-5 py-4 flex items-center gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-lg">
                  {profile.full_name?.[0] ?? profile.email[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile.full_name || "—"}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 px-5 py-4 space-y-2">
              <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">Rol</Label>
              <Select
                value={roleSelect}
                onValueChange={(v) => handleRoleChange(v as Profile["role"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border bg-muted/20 px-5 py-4 space-y-2">
              <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">Platform Atamaları</Label>
              <div className="flex gap-2">
                <Select
                  value={platformSelect || "__pick__"}
                  onValueChange={(v) => setPlatformSelect(v === "__pick__" ? "" : v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Platform ekle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__pick__">Platform ekle</SelectItem>
                    {availablePlatforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                    {!availablePlatforms.length && (
                      <SelectItem value="__none__" disabled>
                        Tüm platformlar atandı
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPlatform}
                  disabled={!platformSelect || platformSelect === "__pick__" || platformSelect === "__none__"}
                >
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {assignedPlatforms.map((a) => (
                  <Badge
                    key={a.id}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => handleRemovePlatform(a.id)}
                  >
                    {PLATFORMS.find((p) => p.value === a.platform)?.label ?? a.platform}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {!assignedPlatforms.length && (
                  <span className="text-sm text-muted-foreground">
                    Atama yok
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 px-5 py-4 space-y-2">
              <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wide">Otel Atamaları</Label>
              <div className="flex gap-2">
                <Select
                  value={hotelSelect || "__pick__"}
                  onValueChange={(v) => setHotelSelect(v === "__pick__" ? "" : v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Otel ekle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__pick__">Otel ekle</SelectItem>
                    {availableHotels.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} ({h.country})
                      </SelectItem>
                    ))}
                    {!availableHotels.length && (
                      <SelectItem value="__none__" disabled>
                        Tüm oteller atandı veya otel yok
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddHotel}
                  disabled={!hotelSelect || hotelSelect === "__pick__" || hotelSelect === "__none__"}
                >
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hotelAssignments?.map((a) => (
                  <Badge
                    key={a.id}
                    variant="outline"
                    className="gap-1 cursor-pointer"
                    onClick={() => handleRemoveHotel(a.id)}
                  >
                    {hotelName(a.hotel_id)}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {!hotelAssignments?.length && (
                  <span className="text-sm text-muted-foreground">
                    Atama yok
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Yeni kullanıcı davet etmek için Supabase Dashboard → Authentication → Users bölümünü kullanın.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
