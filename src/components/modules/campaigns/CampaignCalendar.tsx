import { useMemo } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
} from "date-fns"
import { tr } from "date-fns/locale"
import { PLATFORM_COLORS } from "@/constants/colors"
import type { Campaign } from "@/types"

interface CampaignCalendarProps {
  campaigns: Campaign[]
  month: string // YYYY-MM
  onCampaignClick: (campaign: Campaign) => void
  onEmptyDayClick?: (date: Date) => void
}

export function CampaignCalendar({
  campaigns,
  month,
  onCampaignClick,
  onEmptyDayClick,
}: CampaignCalendarProps) {
  const [year, m] = month.split("-").map(Number)
  const start = startOfMonth(new Date(year!, m! - 1))
  const end = endOfMonth(start)
  const days = eachDayOfInterval({ start, end })

  const firstDayOfWeek = start.getDay()
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const campaignsInRange = useMemo(() => {
    const startDate = parseISO(`${month}-01`)
    const endDate = endOfMonth(startDate)
    return campaigns.filter((c) => {
      if (!c.start_date || !c.end_date) return false
      try {
        const cs = parseISO(c.start_date)
        const ce = parseISO(c.end_date)
        if (isNaN(cs.getTime()) || isNaN(ce.getTime())) return false
        return (
          isWithinInterval(cs, { start: startDate, end: endDate }) ||
          isWithinInterval(ce, { start: startDate, end: endDate }) ||
          (cs <= startDate && ce >= endDate)
        )
      } catch {
        return false
      }
    })
  }, [campaigns, month])

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium mb-4">
        {format(start, "MMMM yyyy", { locale: tr })}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-16" />
        ))}
        {days.map((day) => {
          const dayCampaigns = campaignsInRange.filter((c) => {
            if (!c.start_date || !c.end_date) return false
            try {
              const cs = parseISO(c.start_date)
              const ce = parseISO(c.end_date)
              if (isNaN(cs.getTime()) || isNaN(ce.getTime())) return false
              return isWithinInterval(day, { start: cs, end: ce })
            } catch {
              return false
            }
          })
          return (
            <div
              key={day.toISOString()}
              className={`min-h-16 p-1 border rounded text-xs ${onEmptyDayClick ? "cursor-pointer" : ""}`}
              onClick={dayCampaigns.length === 0 && onEmptyDayClick ? () => onEmptyDayClick(day) : undefined}
            >
              <span className="text-muted-foreground">{format(day, "d")}</span>
              <div className="mt-1 space-y-0.5">
                {dayCampaigns.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="truncate rounded px-1 py-0.5 cursor-pointer hover:opacity-80 text-white text-[10px]"
                    style={{
                      backgroundColor:
                        (c.platform && PLATFORM_COLORS[c.platform]) ?? "#6b7280",
                    }}
                    onClick={() => onCampaignClick(c)}
                    title={c.name}
                  >
                    {c.name}
                  </div>
                ))}
                {dayCampaigns.length > 3 && (
                  <span className="text-muted-foreground">
                    +{dayCampaigns.length - 3}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
