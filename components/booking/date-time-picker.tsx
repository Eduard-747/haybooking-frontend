"use client"

import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedTime: string | null
  onTimeChange: (time: string) => void
}

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

interface TimeSlot {
  time: string
  available: boolean
}

const TIME_SLOTS: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:30", available: true },
  { time: "16:30", available: false },
  { time: "17:30", available: true },
]

export function DateTimePicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
}: DateTimePickerProps) {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7 // Adjust for Monday start
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => {
    onDateChange(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1))
  }

  const selectDay = (day: number) => {
    onDateChange(new Date(year, month, day))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const isPast = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(year, month, day)
    return checkDate < today
  }

  // Generate calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const formatSelectedDate = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          3
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Date & Time</h2>
          <p className="text-sm text-muted-foreground">
            Available slots are updated in real-time based on your specialist choice.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-card rounded-lg border border-border p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-foreground">
              {MONTHS[month]} {year}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day !== null && (
                  <button
                    onClick={() => !isPast(day) && selectDay(day)}
                    disabled={isPast(day)}
                    className={cn(
                      "w-full h-full flex items-center justify-center rounded-full text-sm font-medium transition-all",
                      isPast(day) && "text-muted-foreground/40 cursor-not-allowed",
                      !isPast(day) && !isSelected(day) && "hover:bg-muted",
                      isToday(day) && !isSelected(day) && "text-primary font-semibold",
                      isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Available Slots
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Times are in CEST</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSlotSelected = selectedTime === slot.time
              return (
                <button
                  key={slot.time}
                  onClick={() => slot.available && onTimeChange(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    "py-2.5 px-3 rounded-lg text-sm font-medium transition-all border",
                    slot.available && !isSlotSelected && 
                      "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5",
                    isSlotSelected && 
                      "border-primary bg-primary text-primary-foreground",
                    !slot.available && 
                      "border-border bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through"
                  )}
                >
                  {slot.time}
                </button>
              )
            })}
          </div>

          {/* Selected Confirmation */}
          {selectedTime && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-foreground">
                Your selected appointment is set for{" "}
                <span className="font-semibold">{formatSelectedDate()}</span> at{" "}
                <span className="font-semibold">{selectedTime}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
