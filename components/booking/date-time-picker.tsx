"use client"

import { useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  selectedTime: string | null
  onTimeChange: (time: string) => void
  bookedSlots?: string[]
  workingHours?: { weekday: number; openTime: string; closeTime: string }[]
  breaks?: { weekday: number; startTime: string; endTime: string }[]
  totalDuration?: number
}

export function DateTimePicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  bookedSlots = [],
  workingHours = [],
  breaks = [],
  totalDuration = 30,
}: DateTimePickerProps) {

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (!workingHours || workingHours.length === 0) return false;
    const day = date.getDay();
    const hasHours = workingHours.some(wh => wh.weekday === day);
    return !hasHours;
  };

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !workingHours || workingHours.length === 0) {
      return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    }

    const day = selectedDate.getDay();
    const wh = workingHours.find(w => w.weekday === day);
    if (!wh) return [];

    const slots = [];
    const [openH, openM] = wh.openTime.split(':').map(Number);
    const [closeH, closeM] = wh.closeTime.split(':').map(Number);

    let currentMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    const step = 30; // Generate slots every 30 minutes
    const dayBreaks = breaks.filter(b => b.weekday === day);

    while (currentMin + totalDuration <= closeMin) {
      const slotStart = currentMin;
      const slotEnd = currentMin + totalDuration;
      
      const overlapsBreak = dayBreaks.some(br => {
        const [bsh, bsm] = br.startTime.split(':').map(Number);
        const [beh, bem] = br.endTime.split(':').map(Number);
        const brStart = bsh * 60 + bsm;
        const brEnd = beh * 60 + bem;
        return slotStart < brEnd && slotEnd > brStart;
      });

      if (!overlapsBreak) {
        const h = Math.floor(currentMin / 60).toString().padStart(2, '0');
        const m = (currentMin % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
      currentMin += step;
    }

    return slots;
  }, [selectedDate, workingHours, breaks, totalDuration]);

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FDEAEA] text-[#E5555E] text-sm font-bold">
          3
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Date & Time</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Available slots are updated in real-time based on your specialist choice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start mt-8">
        
        {/* Left: Calendar */}
        <div className="p-4 border border-border/60 rounded-xl bg-white shadow-sm flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={disabledDays}
            className="rounded-md"
            classNames={{
              day_selected: "bg-[#E5555E] text-white hover:bg-[#E5555E] hover:text-white focus:bg-[#E5555E] focus:text-white rounded-full",
              day_today: "bg-accent text-accent-foreground rounded-full",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-full transition-colors",
              head_cell: "text-muted-foreground font-semibold text-[10px] tracking-wider uppercase w-9",
            }}
          />
        </div>

        {/* Right: Time Slots */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Available Slots</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
              <Clock className="h-3.5 w-3.5" />
              <span>Times are in CEST</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableTimeSlots.map((time) => {
              const isSelected = selectedTime === time
              const isBooked = bookedSlots.includes(time)
              return (
                <button
                  key={time}
                  disabled={isBooked}
                  onClick={() => onTimeChange(time)}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border",
                    isSelected
                      ? "bg-[#E5555E] text-white border-[#E5555E] shadow-sm shadow-[#E5555E]/20"
                      : isBooked
                        ? "bg-muted/50 text-muted-foreground/50 border-border/40 cursor-not-allowed line-through"
                        : "bg-white text-foreground border-border/60 hover:border-muted-foreground/30 hover:bg-[#FAFAFA]"
                  )}
                >
                  {time}
                </button>
              )
            })}
          </div>

          {/* Summary Alert */}
          {selectedDate && selectedTime && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-[#FDEAEA] border border-[#E5555E]/20">
              <CheckCircle2 className="h-5 w-5 text-[#E5555E] shrink-0 mt-0.5" />
              <p className="text-sm text-[#3D2B2B]">
                Your selected appointment is set for{" "}
                <span className="font-bold">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                {" "}at <span className="font-bold">{selectedTime}</span>.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </section>
  )
}
