"use client"

import { useState } from "react"
import { BookingCard } from "./booking-card"

const upcomingBookings = [
  {
    id: "1",
    serviceName: "Therapeutic Deep Tissue Massage",
    providerName: "Lumina Wellness Center",
    date: "Oct 24, 2024",
    time: "10:00 AM - 11:30 AM",
    location: "124 Wellness Way, Suite 200",
    status: "confirmed" as const,
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    serviceName: "Cut, Color & Styling Session",
    providerName: "Studio Bloom Hair",
    date: "Nov 02, 2024",
    time: "02:00 PM - 04:30 PM",
    location: "88 Fashion St, Downtown",
    status: "confirmed" as const,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    serviceName: "Private Vinyasa Flow",
    providerName: "Zenith Yoga Studio",
    date: "Nov 15, 2024",
    time: "08:00 AM - 09:00 AM",
    location: "12 Harmony Blvd",
    status: "pending" as const,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop",
  },
]

const pastBookings = [
  {
    id: "4",
    serviceName: "Swedish Relaxation Massage",
    providerName: "Serenity Spa & Wellness",
    date: "Sep 15, 2024",
    time: "03:00 PM - 04:00 PM",
    location: "123 Nordic Way, Stockholm",
    status: "completed" as const,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    serviceName: "Executive Haircut & Styling",
    providerName: "The Velvet Chair",
    date: "Sep 02, 2024",
    time: "11:00 AM - 12:00 PM",
    location: "East Side, Fashion District",
    status: "completed" as const,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    serviceName: "HydraFacial Treatment",
    providerName: "Radiant Skin Studio",
    date: "Aug 20, 2024",
    time: "10:00 AM - 11:00 AM",
    location: "56 Beauty Lane",
    status: "completed" as const,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
  },
]

export function BookingsContent() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  const activeBookingsCount = upcomingBookings.length
  const completedBookingsCount = pastBookings.length + 9 // Showing 12 total as in design

  return (
    <main className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your appointments and view service history.
            </p>
          </div>

          {/* Stats Card */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-primary/5 border-r border-border">
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Active</p>
              <p className="text-2xl font-bold text-foreground">{activeBookingsCount}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-foreground">{completedBookingsCount}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex gap-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`relative pb-4 text-sm font-medium transition-colors ${
                activeTab === "upcoming"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                Upcoming
                {activeTab === "upcoming" && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </span>
              {activeTab === "upcoming" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`relative pb-4 text-sm font-medium transition-colors ${
                activeTab === "past"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past
              {activeTab === "past" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </nav>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {activeTab === "upcoming" ? (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions />
            ))
          ) : (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions={false} />
            ))
          )}
        </div>

        {/* View Full Schedule Link */}
        <div className="mt-8 text-center">
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View full schedule
          </button>
        </div>
      </div>
    </main>
  )
}
