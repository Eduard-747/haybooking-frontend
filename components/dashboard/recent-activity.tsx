"use client"

import {
  Plus,
  Clock,
  CalendarClock,
  DollarSign,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  icon: React.ReactNode
  iconBgColor: string
  title: string
  description: string
  time: string
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "New booking received",
    description: "Color Correction from Diana P.",
    time: "2 mins ago",
  },
  {
    id: "2",
    icon: <Clock className="h-4 w-4 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
    title: "Marco Rossi completed",
    description: "a Signature Haircut for Alex S.",
    time: "14 mins ago",
  },
  {
    id: "3",
    icon: <CalendarClock className="h-4 w-4 text-amber-600" />,
    iconBgColor: "bg-amber-100",
    title: "Booking rescheduled:",
    description: "Benjamin Carter moved to 10:30 AM",
    time: "45 mins ago",
  },
  {
    id: "4",
    icon: <DollarSign className="h-4 w-4 text-blue-600" />,
    iconBgColor: "bg-blue-100",
    title: "Payment received:",
    description: "$85.00 for Luxury Beard Grooming",
    time: "1 hr ago",
  },
  {
    id: "5",
    icon: <UserPlus className="h-4 w-4 text-violet-600" />,
    iconBgColor: "bg-violet-100",
    title: "New specialist registered:",
    description: "Sarah Jenkins joined Downtown branch",
    time: "2 hrs ago",
  },
]

export function RecentActivity() {
  return (
    <div className="bg-background border border-border rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Activity List */}
      <div className="max-h-80 overflow-y-auto">
        <div className="divide-y divide-border">
          {activityData.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  item.iconBgColor
                )}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{item.title}</span>{" "}
                  <span className="text-muted-foreground">
                    {item.description}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors">
          View Activity Log
        </button>
      </div>
    </div>
  )
}
