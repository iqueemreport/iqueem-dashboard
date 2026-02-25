import { useState } from "react"
import { Pencil, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { HotelForm } from "./HotelForm"
import { useHotels, useCreateHotel, useUpdateHotel } from "@/hooks/useHotels"
import type { Hotel } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export function HotelTable() {
  const { data: hotels, isLoading, isError, error } = useHotels()
  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Hotel | null>(null)

  function handleCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleEdit(hotel: Hotel) {
    setEditing(hotel)
    setFormOpen(true)
  }

  async function handleSubmit(data: {
    name: string
    country: string
    status: "active" | "inactive"
  }) {
    if (editing) {
      await updateHotel.mutateAsync({ id: editing.id, ...data })
    } else {
      await createHotel.mutateAsync(data)
    }
    setFormOpen(false)
    setEditing(null)
  }

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
        <p>Oteller yüklenirken hata oluştu.</p>
        <p className="text-sm">{error?.message}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Yeniden Dene
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button type="button" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Otel Ekle
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Otel Adı</TableHead>
            <TableHead>Ülke</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hotels?.length ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Henüz otel eklenmemiş
              </TableCell>
            </TableRow>
          ) : (
            hotels.map((hotel) => (
              <TableRow key={hotel.id}>
                <TableCell className="font-medium">{hotel.name}</TableCell>
                <TableCell>{hotel.country}</TableCell>
                <TableCell>
                  <Badge variant={hotel.status === "active" ? "default" : "secondary"}>
                    {hotel.status === "active" ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(hotel)}>
                        <Pencil className="mr-2 h-4 w-4" />
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
      <HotelForm
        open={formOpen}
        onOpenChange={setFormOpen}
        hotel={editing}
        onSubmit={handleSubmit}
      />
    </>
  )
}
