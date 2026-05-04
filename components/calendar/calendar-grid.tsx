"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventBlock } from "./event-block"

interface CalendarGridProps {
  currentDate: Date
  viewMode: "Day" | "Week" | "Month"
}

// Sample booking events data
const bookingEvents = [
  {
    id: "1",
    clientName: "Emily Roberts",
    service: "Deep Tissue Massage",
    time: "09:00 AM - 10:30 AM",
    day: 0, // Monday
    startHour: 9,
    duration: 1.5,
    color: "rose" as const,
  },
  {
    id: "2",
    clientName: "Sophia Chen",
    service: "Full Facial Ritual",
    time: "10:00 AM - 11:30 AM",
    day: 0, // Monday
    startHour: 10,
    duration: 1.5,
    color: "amber" as const,
  },
  {
    id: "3",
    clientName: "Oliver Smith",
    service: "Hair Styling",
    time: "09:30 AM - 11:00 AM",
    day: 2, // Wednesday
    startHour: 9.5,
    duration: 1.5,
    color: "rose" as const,
  },
  {
    id: "4",
    clientName: "Ava Johnson",
    service: "Botox Treatment",
    time: "12:00 PM - 01:00 PM",
    day: 1, // Tuesday
    startHour: 12,
    duration: 1,
    color: "rose" as const,
  },
  {
    id: "5",
    clientName: "Charlotte Day",
    service: "Bridal Trial",
    time: "10:00 AM - 12:00 PM",
    day: 4, // Friday
    startHour: 10,
    duration: 2,
    color: "amber" as const,
  },
  {
    id: "6",
    clientName: "James Miller",
    service: "Consultation",
    time: "02:00 PM - 03:00 PM",
    day: 0, // Monday
    startHour: 14,
    duration: 1,
    color: "emerald" as const,
  },
  {
    id: "7",
    clientName: "Ethan Hunt",
    service: "Physical Therapy",
    time: "01:00 PM - 02:30 PM",
    day: 4, // Friday
    startHour: 13,
    duration: 1.5,
    color: "rose" as const,
  },
  {
    id: "8",
    clientName: "Mia White",
    service: "Nail Art Session",
    time: "03:00 PM - 04:30 PM",
    day: 3, // Thursday
    startHour: 15,
    duration: 1.5,
    color: "amber" as const,
  },
  {
    id: "9",
    clientName: "Lucas Thorne",
    service: "Men's Grooming",
    time: "04:30 PM - 05:30 PM",
    day: 1, // Tuesday
    startHour: 16.5,
    duration: 1,
    color: "emerald" as const,
  },
]

const timeSlots = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
]

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export function CalendarGrid({ currentDate, viewMode }: CalendarGridProps) {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  // Get the start of the week
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    const dayOfWeek = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    return weekDays.map((_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return date
    })
  }

  const weekDates = getWeekDates()
  const today = new Date()

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Calculate position for events (8 AM = hour 8, 60px per hour)
  const getEventPosition = (startHour: number) => {
    return (startHour - 8) * 60
  }

  const getEventHeight = (duration: number) => {
    return duration * 60 - 4 // Subtract 4px for spacing
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Calendar Toolbar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Weekly Overview</h1>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
          </div>

          {/* Create Booking Button */}
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Create Booking
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border sticky top-0 bg-background z-10">
            <div className="p-3 border-r border-border" />
            {weekDays.map((day, index) => {
              const date = weekDates[index]
              const isTodayDate = isToday(date)

              return (
                <div
                  key={day}
                  className="p-3 text-center border-r border-border last:border-r-0"
                >
                  <p className={`text-xs font-medium ${isTodayDate ? "text-primary" : "text-muted-foreground"}`}>
                    {day}
                  </p>
                  <p
                    className={`text-2xl font-semibold mt-1 ${
                      isTodayDate
                        ? "text-primary-foreground bg-primary rounded-full w-10 h-10 flex items-center justify-center mx-auto"
                        : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {timeSlots.map((time, timeIndex) => (
              <div
                key={time}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border"
                style={{ height: "60px" }}
              >
                {/* Time Label */}
                <div className="p-2 text-right pr-4 border-r border-border">
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>

                {/* Day Columns */}
                {weekDays.map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border-r border-border last:border-r-0 relative"
                  />
                ))}
              </div>
            ))}

            {/* Event Blocks - Absolutely Positioned */}
            {bookingEvents.map((event) => (
              <EventBlock
                key={event.id}
                event={event}
                style={{
                  position: "absolute",
                  top: `${getEventPosition(event.startHour) + 47}px`, // 47px for header offset
                  left: `calc(80px + (${event.day} * ((100% - 80px) / 7)) + 4px)`,
                  width: `calc((100% - 80px) / 7 - 8px)`,
                  height: `${getEventHeight(event.duration)}px`,
                }}
                isHovered={hoveredEvent === event.id}
                onHover={() => setHoveredEvent(event.id)}
                onLeave={() => setHoveredEvent(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
