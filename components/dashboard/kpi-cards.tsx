"use client"

import { Calendar, CheckCircle, XCircle, Users, TrendingUp } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  iconBgColor: string
}

function KpiCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconBgColor,
}: KpiCardProps) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${iconBgColor}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              {value}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-medium ${
            changeType === "positive"
              ? "text-green-600"
              : changeType === "negative"
              ? "text-red-500"
              : "text-muted-foreground"
          }`}
        >
          {change}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <TrendingUp className="h-3 w-3" />
        <span>vs. last 30 days</span>
      </div>
    </div>
  )
}

const kpiData: KpiCardProps[] = [
  {
    title: "Upcoming Bookings",
    value: "24",
    change: "+12.5%",
    changeType: "positive",
    icon: <Calendar className="h-6 w-6 text-amber-600" />,
    iconBgColor: "bg-amber-100",
  },
  {
    title: "Total Bookings",
    value: "1,842",
    change: "+8.2%",
    changeType: "positive",
    icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
  },
  {
    title: "Rejected",
    value: "8",
    change: "",
    changeType: "neutral",
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    iconBgColor: "bg-red-100",
  },
  {
    title: "Total Revenue",
    value: "$42,890.50",
    change: "+5.4%",
    changeType: "positive",
    icon: <Users className="h-6 w-6 text-blue-600" />,
    iconBgColor: "bg-blue-100",
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard key={index} {...kpi} />
      ))}
    </div>
  )
}
