import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { LayoutRoute } from "@/app/routes/index"

const LoginPage = lazy(() => import("@/app/routes/login").then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import("@/app/routes/dashboard").then((m) => ({ default: m.DashboardPage })))
const TasksPage = lazy(() => import("@/app/routes/tasks").then((m) => ({ default: m.TasksPage })))
const BudgetsPage = lazy(() => import("@/app/routes/budgets").then((m) => ({ default: m.BudgetsPage })))
const CampaignsPage = lazy(() => import("@/app/routes/campaigns").then((m) => ({ default: m.CampaignsPage })))
const ReportsPage = lazy(() => import("@/app/routes/reports").then((m) => ({ default: m.ReportsPage })))
const AnalyticsPage = lazy(() => import("@/app/routes/analytics").then((m) => ({ default: m.AnalyticsPage })))
const AdminPage = lazy(() => import("@/app/routes/admin").then((m) => ({ default: m.AdminPage })))

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-foreground">Yükleniyor...</p>
    </div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LayoutRoute />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="tasks"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <TasksPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="budgets"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <BudgetsPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="campaigns"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <CampaignsPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="reports"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <ReportsPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="analytics"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <AnalyticsPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <AdminPage />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
