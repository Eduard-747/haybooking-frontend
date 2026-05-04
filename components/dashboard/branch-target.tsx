"use client"

import { TrendingUp } from "lucide-react"

export function BranchTarget() {
  const progress = 85
  const target = 50000
  const current = target * (progress / 100)

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">Branch Target</p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            $50k Monthly
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${current.toLocaleString()} of ${target.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
