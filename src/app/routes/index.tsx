import { Outlet, useLocation } from "react-router-dom"
import { PageWrapper } from "@/components/layout/PageWrapper"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Görevler",
  "/budgets": "Kampanya Bütçeleri",
  "/campaigns": "Kampanya Detayları",
  "/reports": "Otel Raporları",
  "/analytics": "Analytics",
  "/admin": "Admin Panel",
}

function getTitle(pathname: string): string {
  const base = pathname.split("/")[1] ?? ""
  return routeTitles[`/${base}`] ?? "IQUEEM"
}

export function LayoutRoute() {
  const { pathname } = useLocation()
  const title = getTitle(pathname)

  return (
    <PageWrapper title={title}>
      <Outlet />
    </PageWrapper>
  )
}
