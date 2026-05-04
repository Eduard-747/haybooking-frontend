"use client"

import { useState } from "react"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar"
import { CalendarFooter } from "@/components/calendar/calendar-footer"

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week")
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 13)) // October 13, 2024

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Calendar Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <CalendarGrid
            currentDate={currentDate}
            viewMode={viewMode}
          />
        </main>

        {/* Right Sidebar - Pending Requests */}
        <CalendarSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      <CalendarFooter />
    </div>
  )
}
