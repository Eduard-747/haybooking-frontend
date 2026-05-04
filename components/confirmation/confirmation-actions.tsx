"use client"

import Link from "next/link"
import { Calendar, Bell, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConfirmationActions() {
  const handleAddToCalendar = () => {
    // Generate calendar event
    console.log("Adding to calendar...")
  }

  const handleSetReminder = () => {
    // Set reminder
    console.log("Setting reminder...")
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={handleAddToCalendar}
          className="w-full sm:w-auto min-w-[180px] bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6"
        >
          <Calendar className="h-5 w-5" />
          Add to Calendar
        </Button>

        <Button
          variant="outline"
          onClick={handleSetReminder}
          className="w-full sm:w-auto min-w-[180px] border-primary/30 text-primary hover:bg-primary/5 hover:text-primary gap-2 h-12 px-6"
        >
          <Bell className="h-5 w-5" />
          Set Reminder
        </Button>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link 
          href="/bookings"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to My Bookings
        </Link>
      </div>
    </div>
  )
}
