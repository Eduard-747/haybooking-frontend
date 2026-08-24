"use client"

import { useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Clock, CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { hy, ru, enUS } from "date-fns/locale"
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
  allowPast?: boolean
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
  allowPast = false,
}: DateTimePickerProps) {
  const { t, i18n } = useTranslation()
  const localeMap = { en: enUS, ru: ru, am: hy }
  const currentLocale = localeMap[i18n.language as keyof typeof localeMap] || enUS

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!allowPast && date < today) return true;
    return false;
  };

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) {
      return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
    }

    const day = selectedDate.getDay();
    const wh = (workingHours || []).find(w => w.weekday === day || (w as any).day === day || Number((w as any).weekday) === day);

    const openTimeStr = wh?.openTime || "09:00";
    const closeTimeStr = wh?.closeTime || "23:30";

    let slots: string[] = [];
    const [openH, openM] = openTimeStr.split(':').map(Number);
    const [closeH, closeM] = closeTimeStr.split(':').map(Number);

    let currentMin = (isNaN(openH) ? 9 : openH) * 60 + (isNaN(openM) ? 0 : openM);
    let closeMin = (isNaN(closeH) ? 23 : closeH) * 60 + (isNaN(closeM) ? 30 : closeM);

    if (closeMin <= currentMin) {
      closeMin += 1440;
    }

    const step = 30; // Generate slots every 30 minutes
    const dayBreaks = (breaks || []).filter(b => b.weekday === day || (b as any).day === day);

    while (currentMin < closeMin) {
      const slotStart = currentMin;
      const slotEnd = currentMin + 30;
      
      const overlapsBreak = dayBreaks.some(br => {
        const [bsh, bsm] = (br.startTime || "").split(':').map(Number);
        const [beh, bem] = (br.endTime || "").split(':').map(Number);
        const brStart = bsh * 60 + bsm;
        const brEnd = beh * 60 + bem;
        return slotStart < brEnd && slotEnd > brStart;
      });

      if (!overlapsBreak) {
        const isToday = selectedDate.getDate() === new Date().getDate() &&
                        selectedDate.getMonth() === new Date().getMonth() &&
                        selectedDate.getFullYear() === new Date().getFullYear();
        const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

        if (allowPast || !isToday || currentMin > nowMin) {
          const rawH = Math.floor(currentMin / 60) % 24;
          const h = rawH.toString().padStart(2, '0');
          const m = (currentMin % 60).toString().padStart(2, '0');
          slots.push(`${h}:${m}`);
        }
      }
      currentMin += step;
    }

    // Fallback: If all slots were filtered out for today or none generated, provide day slots so the UI is never empty
    if (slots.length === 0) {
      currentMin = (isNaN(openH) ? 9 : openH) * 60 + (isNaN(openM) ? 0 : openM);
      while (currentMin < closeMin) {
        const rawH = Math.floor(currentMin / 60) % 24;
        const h = rawH.toString().padStart(2, '0');
        const m = (currentMin % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
        currentMin += step;
      }
    }

    if (slots.length === 0) {
      slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"];
    }

    return slots;
  }, [selectedDate, workingHours, breaks, totalDuration, allowPast]);

  return (
    <section>


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
              day_selected: "bg-[#FF4444] text-white hover:bg-[#FF4444] hover:text-white focus:bg-[#FF4444] focus:text-white rounded-full",
              day_today: "bg-accent text-accent-foreground rounded-full",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-full transition-colors",
              head_cell: "text-muted-foreground font-semibold text-[10px] tracking-wider uppercase w-9",
            }}
          />
        </div>

        {/* Right: Time Slots */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{t("book.availableSlots", "Available Slots")}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("book.timesInCEST", "Times are in CEST")}</span>
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
                      ? "bg-[#FF4444] text-white border-[#FF4444] shadow-sm shadow-[#FF4444]/20"
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
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-[#FDEAEA] border border-[#FF4444]/20">
              <CheckCircle2 className="h-5 w-5 text-[#FF4444] shrink-0 mt-0.5" />
              <p className="text-sm text-[#3D2B2B]">
                {t("book.appointmentSet", "Your selected appointment is set for")}{" "}
                <span className="font-bold">
                  {format(selectedDate, "EEEE, MMM d", { locale: currentLocale })}
                </span>
                {" "}{t("book.at", "at")} <span className="font-bold">{selectedTime}</span>.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </section>
  )
}
