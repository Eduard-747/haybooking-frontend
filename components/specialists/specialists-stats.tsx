import { Users, TrendingUp, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  {
    icon: Users,
    label: "Total Specialists",
    value: "24",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    label: "Active Today",
    value: "18",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: MapPin,
    label: "Branches Active",
    value: "06",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
]

export function SpecialistsStats() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-4 bg-background border border-border rounded-xl"
          >
            <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
        <Plus className="h-4 w-4 mr-2" />
        Add Specialist
      </Button>
    </div>
  )
}
