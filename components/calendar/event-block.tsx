"use client"

import { CSSProperties } from "react"

interface EventBlockProps {
  event: {
    id: string
    clientName: string
    service: string
    time: string
    color: "rose" | "amber" | "emerald"
  }
  style: CSSProperties
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}

const colorClasses = {
  rose: {
    bg: "bg-rose-100",
    bgHover: "bg-rose-200",
    border: "border-l-rose-500",
    text: "text-rose-900",
    textMuted: "text-rose-700",
  },
  amber: {
    bg: "bg-amber-50",
    bgHover: "bg-amber-100",
    border: "border-l-amber-500",
    text: "text-amber-900",
    textMuted: "text-amber-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    bgHover: "bg-emerald-100",
    border: "border-l-emerald-500",
    text: "text-emerald-900",
    textMuted: "text-emerald-700",
  },
}

export function EventBlock({
  event,
  style,
  isHovered,
  onHover,
  onLeave,
}: EventBlockProps) {
  const colors = colorClasses[event.color]

  return (
    <div
      style={style}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        rounded-md border-l-4 px-2 py-1.5 cursor-pointer overflow-hidden
        transition-all duration-200 ease-in-out
        ${colors.border}
        ${isHovered ? colors.bgHover : colors.bg}
        ${isHovered ? "shadow-md scale-[1.02] z-20" : "shadow-sm z-10"}
      `}
    >
      <p className={`text-sm font-medium truncate ${colors.text}`}>
        {event.clientName}
      </p>
      <p className={`text-xs truncate ${colors.textMuted}`}>
        {event.service}
      </p>
      <p className={`text-xs mt-0.5 ${colors.textMuted}`}>
        {event.time}
      </p>
    </div>
  )
}
