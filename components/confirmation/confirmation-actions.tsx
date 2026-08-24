"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Bell, ChevronLeft } from "lucide-react"
import Link from "next/link"

export function ConfirmationActions() {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      
      {/* Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <Button 
          size="lg" 
          className="bg-[#FF4444] hover:bg-[#BCAAA4] text-white rounded-md w-full font-semibold shadow-sm transition-colors"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Add to Calendar
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="bg-white border-border/60 text-[#FF4444] hover:bg-[#FAFAFA] hover:text-[#BCAAA4] rounded-md w-full font-semibold shadow-sm transition-colors"
        >
          <Bell className="mr-2 h-4 w-4" />
          Set Reminder
        </Button>
      </div>

      {/* Back Link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to My Bookings
      </Link>
      
    </div>
  )
}
