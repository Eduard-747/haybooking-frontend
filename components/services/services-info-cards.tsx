import { DollarSign, Clock, Globe } from "lucide-react"

const infoCards = [
  {
    title: "Global Pricing",
    description: "Easily adjust prices across all branches simultaneously from the bulk action menu.",
    icon: DollarSign,
  },
  {
    title: "Duration Buffer",
    description: "Service durations include a mandatory 5-minute setup buffer by default.",
    icon: Clock,
  },
  {
    title: "Online Booking",
    description: "Toggle visibility of specific services on your public booking page.",
    icon: Globe,
  },
]

export function ServicesInfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {infoCards.map((card, index) => (
        <div
          key={index}
          className="p-5 bg-muted/30 border border-border rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
