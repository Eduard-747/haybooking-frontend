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
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          2
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Select Specialist</h2>
          <p className="text-sm text-muted-foreground">
            Our certified professionals are here to provide the best wellness experience.
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {specialists.map((specialist) => {
          const isSelected = selectedSpecialist === specialist.id
          return (
            <button
              key={specialist.id}
              onClick={() => onSelect(specialist.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg shrink-0 transition-all text-center min-w-[100px]",
                isSelected
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "relative w-16 h-16 rounded-full overflow-hidden ring-2 transition-all",
                  isSelected ? "ring-primary" : "ring-transparent"
                )}
              >
                <Image
                  src={specialist.image}
                  alt={specialist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {specialist.name}
                </p>
                <p className="text-xs text-muted-foreground">{specialist.role}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
