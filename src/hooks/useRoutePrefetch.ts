import { useCallback } from "react"

export function useRoutePrefetch() {
  const prefetchCampaigns = useCallback(() => {
    import("@/app/routes/campaigns")
  }, [])
  const prefetchReports = useCallback(() => {
    import("@/app/routes/reports")
  }, [])
  const prefetchAnalytics = useCallback(() => {
    import("@/app/routes/analytics")
  }, [])

  return { prefetchCampaigns, prefetchReports, prefetchAnalytics }
}
