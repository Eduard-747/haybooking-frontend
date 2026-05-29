"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, Bell, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Logo } from "@/components/ui/logo"
interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  viewMode: "Day" | "Week" | "Month"
  onViewModeChange: (mode: "Day" | "Week" | "Month") => void
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
}: CalendarHeaderProps) {
  const formatDateRange = () => {
    const startOfWeek = new Date(currentDate)
    const dayOfWeek = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }
    const startStr = startOfWeek.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    const endStr = endOfWeek.toLocaleDateString("en-US", options)

    return `${startStr} - ${endStr}`
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    onDateChange(newDate)
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background min-w-[200px] justify-center">
            <span className="text-sm font-medium text-foreground">
              {formatDateRange()}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex items-center gap-4">
          {/* View Mode Pills */}
          <div className="hidden md:flex items-center rounded-lg border border-border p-0.5 bg-muted/50">
            {(["Day", "Week", "Month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Search */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Profile */}
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
            alt="Profile"
            width={36}
            height={36}
            className="rounded-full object-cover border-2 border-border"
          />
        </div>
      </div>
    </header>
  )
}
