"use client"

import { ConfirmationHeader } from "@/components/confirmation/confirmation-header"
import { ConfirmationHero } from "@/components/confirmation/confirmation-hero"
import { BookingSummaryCard } from "@/components/confirmation/booking-summary-card"
import { ConfirmationActions } from "@/components/confirmation/confirmation-actions"
import { SiteFooter } from "@/components/landing/site-footer"

// Sample booking data
const bookingData = {
  id: "HB-94201",
  bookedOn: "Oct 20, 2023",
  service: "Deep Tissue Massage",
  provider: "Serenity Spa & Wellness",
  dateTime: "Oct 24, 2023 at 2:00 PM",
  location: "123 Wellness Way, Suite 400",
  totalPaid: "$85.00",
  duration: "60 Minutes",
}

export default function BookingConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <ConfirmationHeader />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-12">
        <ConfirmationHero />
        
        <BookingSummaryCard booking={bookingData} />
        
        <ConfirmationActions />
      </main>
      
      <SiteFooter />
    </div>
  )
}
