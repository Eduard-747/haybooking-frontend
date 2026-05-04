"use client"

import { BookingsHeader } from "@/components/bookings/bookings-header"
import { BookingsContent } from "@/components/bookings/bookings-content"
import { BookingsFooter } from "@/components/bookings/bookings-footer"

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BookingsHeader />
      <BookingsContent />
      <BookingsFooter />
    </div>
  )
}
