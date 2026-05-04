"use client"

import { useState } from "react"
import { BookingsHeader } from "@/components/bookings/bookings-header"
import { BookingsStats } from "@/components/bookings/bookings-stats"
import { BookingsTabs } from "@/components/bookings/bookings-tabs"
import { BookingsFooter } from "@/components/bookings/bookings-footer"

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BookingsHeader />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title and Stats */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              My Bookings
            </h1>
            <p className="text-muted-foreground">
              Manage your appointments and view service history.
            </p>
          </div>
          <BookingsStats activeCount={3} completedCount={12} />
        </div>

        {/* Tabs and Content */}
        <BookingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* View Full Schedule Link */}
        <div className="flex justify-center mt-8">
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View full schedule
          </button>
        </div>
      </main>

      <BookingsFooter />
    </div>
  )
}
