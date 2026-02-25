export function getBudgetProgressColor(spentPct: number, isExceeded: boolean): string {
  if (isExceeded) return "bg-red-500"
  if (spentPct >= 90) return "bg-green-500"
  if (spentPct >= 60) return "bg-yellow-500"
  return "bg-red-500"
}
