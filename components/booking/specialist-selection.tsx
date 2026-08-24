"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface Specialist {
  id: string
  name: string
  role: string
  image: string
}

interface SpecialistSelectionProps {
  specialists: Specialist[]
  selectedSpecialist: string | null
  onSelect: (id: string) => void
}

export function SpecialistSelection({
  specialists,
  selectedSpecialist,
  onSelect,
}: SpecialistSelectionProps) {
  const { t } = useTranslation()
  return (
    <section>


      {/* Avatars */}
      <div className="flex items-start gap-8 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide">
        {specialists.map((specialist) => {
          const isSelected = selectedSpecialist === specialist.id
          return (
            <div
              key={specialist.id}
              onClick={() => onSelect(specialist.id)}
              className="flex flex-col items-center gap-3 cursor-pointer shrink-0 group"
            >
              {/* Avatar Ring */}
              <div
                className={cn(
                  "relative w-20 h-20 rounded-full overflow-hidden transition-all duration-200",
                  isSelected
                    ? "ring-2 ring-[#FF4444] ring-offset-2 scale-105"
                    : "ring-1 ring-border/50 group-hover:ring-border group-hover:scale-105"
                )}
              >
                <Image
                  src={specialist.image}
                  alt={specialist.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Text */}
              <div className="text-center">
                <p className={cn(
                  "text-sm font-semibold transition-colors",
                  isSelected ? "text-[#FF4444]" : "text-foreground"
                )}>
                  {specialist.name}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                  {specialist.role === "Specialist" ? t("common.specialist", "Specialist") : specialist.role}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
