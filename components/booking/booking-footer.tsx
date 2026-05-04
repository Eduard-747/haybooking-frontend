"use client"

import { Button } from "@/components/ui/button"

interface BookingFooterProps {
  totalPrice: number
  selectedDate: Date | null
  selectedTime: string | null
}

export function BookingFooter({
  totalPrice,
  selectedDate,
  selectedTime,
}: BookingFooterProps) {
  const formatDate = () => {
    if (!selectedDate) return null
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`
  }

  const formattedSlot = selectedDate && selectedTime 
    ? `${formatDate()}, ${selectedTime}` 
    : "No slot selected"

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                Total Price
              </span>
              <span className="text-2xl font-bold text-foreground">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                Selected Slot
              </span>
              <span className="text-sm font-medium text-foreground">
                {formattedSlot}
              </span>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            disabled={!selectedTime}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
