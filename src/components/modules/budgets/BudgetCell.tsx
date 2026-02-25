import { formatCurrency } from "@/lib/utils/format"
import { getBudgetProgressColor } from "@/lib/utils/budget"
import type { Budget, Currency } from "@/types"

interface BudgetCellProps {
  budget: Budget | null
  onClick?: () => void
}

export function BudgetCell({ budget, onClick }: BudgetCellProps) {
  if (!budget) {
    return (
      <div
        className="min-h-[60px] p-2 rounded border border-dashed border-muted-foreground/20 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onClick}
      >
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    )
  }

  const spentNum = Number(budget.spent_amount)
  const amountNum = Number(budget.amount)
  const spentPct = amountNum > 0 ? (spentNum / amountNum) * 100 : 0
  const isExceeded = spentNum > amountNum && amountNum > 0
  const progressColor = getBudgetProgressColor(spentPct, isExceeded)

  return (
    <div
      className="min-h-[60px] p-2 rounded border cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={onClick}
    >
      <div className="text-xs font-medium">
        {formatCurrency(amountNum, budget.currency as Currency)} /{" "}
        {formatCurrency(spentNum, budget.currency as Currency)}
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${progressColor} transition-all`}
          style={{ width: `${Math.min(spentPct, 100)}%` }}
        />
      </div>
    </div>
  )
}
