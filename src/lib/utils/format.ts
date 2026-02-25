import { format as formatFns } from "date-fns"
import { tr } from "date-fns/locale"
import type { Currency } from "@/types"

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  TRY: "₺",
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${symbol}${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: string | Date, formatStr = "dd MMM yyyy"): string {
  return formatFns(new Date(date), formatStr, { locale: tr })
}

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-")
  const date = new Date(parseInt(year!, 10), parseInt(month!, 10) - 1)
  return formatFns(date, "MMMM yyyy", { locale: tr })
}
