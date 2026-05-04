"use client"

import { Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

interface ServiceSelectionProps {
  services: Service[]
  selectedServices: string[]
  onToggle: (id: string) => void
}

export function ServiceSelection({
  services,
  selectedServices,
  onToggle,
}: ServiceSelectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          1
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Branch & Service</h2>
          <p className="text-sm text-muted-foreground">
            {"Choose your preferred branch location and the services you'd like to book."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id)
          return (
            <div
              key={service.id}
              onClick={() => onToggle(service.id)}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(service.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground">{service.name}</h3>
                  <span className="font-semibold text-foreground shrink-0">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{service.duration} min</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
