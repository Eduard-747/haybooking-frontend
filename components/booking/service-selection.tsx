"use client"

import { Clock, CheckSquare, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/currency"
import { useTranslation } from "react-i18next"

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  image?: string
}

interface ServiceSelectionProps {
  services: Service[]
  selectedServices: string[]
  onToggle: (id: string) => void
  currency?: string
}

export function ServiceSelection({
  services,
  selectedServices,
  onToggle,
  currency
}: ServiceSelectionProps) {
  const { t } = useTranslation()
  return (
    <section>


      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id)
          return (
            <div
              key={service.id}
              onClick={() => onToggle(service.id)}
              className={cn(
                "flex items-start gap-4 p-5 rounded-lg border cursor-pointer transition-all",
                isSelected
                  ? "border-[#E5555E] bg-[#FDF6F6]"
                  : "border-border hover:border-border/80 hover:bg-[#FAFAFA]"
              )}
            >
              {/* Checkbox Icon */}
              <div className="mt-0.5 shrink-0 flex items-center gap-3">
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-[#E5555E] fill-[#E5555E]/10" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground/40" />
                )}
                
                {/* Service Image */}
                {service.image ? (
                  <img src={service.image} alt={service.name} className="h-12 w-12 rounded-lg object-cover border border-border/60" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-[#FDF6F6] flex items-center justify-center border border-border/60">
                    <CheckSquare className="h-4 w-4 text-[#C69C9B]" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <span className="font-bold text-foreground shrink-0">
                    {formatPrice(service.price, currency)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-muted-foreground">
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
