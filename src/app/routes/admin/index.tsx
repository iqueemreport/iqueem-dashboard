import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserTable } from "@/components/modules/admin/UserTable"
import { HotelTable } from "@/components/modules/admin/HotelTable"
import { PerformanceTable } from "@/components/modules/admin/PerformanceTable"
import { InviteUserModal } from "@/components/modules/admin/InviteUserModal"

export function AdminPage() {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Kullanıcı Yönetimi</TabsTrigger>
          <TabsTrigger value="hotels">Otel Yönetimi</TabsTrigger>
          <TabsTrigger value="performance">Ekip Performansı</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
              <div>
                <CardTitle>Kullanıcılar</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Rol, platform ve otel atamalarını yönetin
                </p>
              </div>
              <Button type="button" size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Kullanıcı Davet Et
              </Button>
            </CardHeader>
            <CardContent>
              <UserTable />
            </CardContent>
          </Card>
          <InviteUserModal open={inviteOpen} onOpenChange={setInviteOpen} />
        </TabsContent>
        <TabsContent value="hotels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oteller</CardTitle>
              <p className="text-sm text-muted-foreground">
                Otel ekleyin, düzenleyin veya pasife alın
              </p>
            </CardHeader>
            <CardContent>
              <HotelTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ekip Performans Raporu</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kullanıcı bazında görev istatistikleri, tamamlanma oranı ve ortalama süre
              </p>
            </CardHeader>
            <CardContent>
              <PerformanceTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
