"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/currency"

interface BookingFooterProps {
  totalPrice: number
  selectedDate: Date | undefined
  selectedTime: string | null
  onConfirm: () => void
  isSubmitting?: boolean
  currency?: string
}

export function BookingFooter({
  totalPrice,
  selectedDate,
  selectedTime,
  onConfirm,
  isSubmitting = false,
  currency
}: BookingFooterProps) {
  const isReady = selectedDate && selectedTime && totalPrice > 0

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-40 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Total Price */}
        <div className="hidden sm:block">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Total Price</p>
          <p className="text-xl font-bold text-foreground">{formatPrice(totalPrice, currency)}</p>
        </div>

        {/* Middle: Selected Slot */}
        <div className="text-center hidden md:block">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Selected Slot</p>
          <p className="text-sm font-semibold text-foreground">
            {selectedDate 
              ? `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${selectedTime || '--:--'}`
              : "No slot selected"}
          </p>
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Price Display */}
          <div className="sm:hidden">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Total</p>
            <p className="text-lg font-bold text-foreground">{formatPrice(totalPrice, currency)}</p>
          </div>

          <Button 
            size="lg" 
            onClick={onConfirm}
            disabled={!isReady || isSubmitting}
            className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white rounded-md px-8 font-semibold shadow-sm w-full sm:w-auto transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
