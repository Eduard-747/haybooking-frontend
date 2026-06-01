import React from "react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hour, minute] = (value || "00:00").split(":")

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="px-2 py-1.5 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm outline-none focus:border-[#C69C9B] appearance-none text-center cursor-pointer min-w-[3rem]"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-muted-foreground font-bold">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="px-2 py-1.5 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm outline-none focus:border-[#C69C9B] appearance-none text-center cursor-pointer min-w-[3rem]"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}
