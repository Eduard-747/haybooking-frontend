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
    title: "Նոր ամրագրում:",
    description: "Յոգա և Մեդիտացիա — Դավիթ Հ.",
    time: "1ր առաջ",
  },
  {
    id: "2",
    icon: <Clock className="h-4 w-4 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
    title: "Ամրագրումն ավարտվեց:",
    description: "Մազերի Ներկում — Elena Smith",
    time: "3ր առաջ",
  },
  {
    id: "3",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "Նոր ամրագրում:",
    description: "Տղամարդու Վարսահարդարում — Արմեն Գ.",
    time: "5ր առաջ",
  },
  {
    id: "4",
    icon: <CalendarClock className="h-4 w-4 text-amber-600" />,
    iconBgColor: "bg-amber-100",
    title: "Ամրագրումը տեղափոխվեց:",
    description: "Թերապևտիկ Մերսում — Sophia Taylor",
    time: "7ր առաջ",
  },
  {
    id: "5",
    icon: <DollarSign className="h-4 w-4 text-blue-600" />,
    iconBgColor: "bg-blue-100",
    title: "Վճարումն ստացված է:",
    description: "Ատամների Մաքրում — Նարեկ Ս.",
    time: "10ր առաջ",
  },
  {
    id: "6",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "Նոր ամրագրում:",
    description: "Մատնահարդարում — Lilit Hovhannisyan",
    time: "12ր առաջ",
  },
  {
    id: "7",
    icon: <Clock className="h-4 w-4 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
    title: "Ամրագրումն ավարտվեց:",
    description: "Ավտոլվացում — Hayk Davtyan",
    time: "15ր առաջ",
  },
  {
    id: "8",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "Նոր ամրագրում:",
    description: "Դեմքի Խնամք — Անահիտ Տ.",
    time: "18ր առաջ",
  },
  {
    id: "9",
    icon: <UserPlus className="h-4 w-4 text-violet-600" />,
    iconBgColor: "bg-violet-100",
    title: "Նոր հաճախորդ:",
    description: "Անհատական Ֆիթնես — Alexandre M.",
    time: "22ր առաջ",
  },
  {
    id: "10",
    icon: <DollarSign className="h-4 w-4 text-blue-600" />,
    iconBgColor: "bg-blue-100",
    title: "ՎԻՊ Սեղանի Ամրագրում:",
    description: "Ռեստորան — Մարիամ Խ.",
    time: "25ր առաջ",
  },
  {
    id: "11",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "Նոր ամրագրում:",
    description: "Խորհրդատվություն — Aram Rustamyan",
    time: "30ր առաջ",
  },
  {
    id: "12",
    icon: <Clock className="h-4 w-4 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
    title: "Ամրագրումն ավարտվեց:",
    description: "Կենդանիների Խնամք — Սոնա Վ.",
    time: "35ր առաջ",
  },
  {
    id: "13",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "Նոր ամրագրում:",
    description: "Լազերային Էպիլյացիա — David Miller",
    time: "40ր առաջ",
  },
  {
    id: "14",
    icon: <Plus className="h-4 w-4 text-primary" />,
    iconBgColor: "bg-primary/10",
    title: "Նոր ամրագրում:",
    description: "Հարսանեկան Դիմահարդարում — Էլեն Կ.",
    time: "45ր առաջ",
  },
  {
    id: "15",
    icon: <UserPlus className="h-4 w-4 text-violet-600" />,
    iconBgColor: "bg-violet-100",
    title: "Նոր հաճախորդ:",
    description: "Գեղեցկության Սրահ — Christine A.",
    time: "50ր առաջ",
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
