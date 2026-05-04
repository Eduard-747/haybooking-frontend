import { Clock, CheckCircle, XCircle, Users } from "lucide-react"

const stats = [
  {
    label: "Pending Review",
    value: "12",
    icon: Clock,
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Approved Partners",
    value: "145",
    icon: CheckCircle,
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    label: "Rejected",
    value: "8",
    icon: XCircle,
    bgColor: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    label: "Total Submissions",
    value: "165",
    icon: Users,
    bgColor: "bg-muted",
    iconColor: "text-muted-foreground",
  },
]

export function OnboardingStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl"
          >
            <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
