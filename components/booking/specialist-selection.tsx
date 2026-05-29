"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

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
  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FDEAEA] text-[#E5555E] text-sm font-bold">
          2
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Select Specialist</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Our certified professionals are here to provide the best wellness experience.
          </p>
        </div>
      </div>

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
                    ? "ring-2 ring-[#E5555E] ring-offset-2 scale-105"
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
                  isSelected ? "text-[#E5555E]" : "text-foreground"
                )}>
                  {specialist.name}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                  {specialist.role}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
