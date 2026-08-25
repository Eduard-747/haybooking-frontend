"use client"

import { useState, useEffect } from "react"
import { BookingCard } from "./booking-card"
import { Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useTranslation } from "react-i18next"

interface BookingData {
  _id: string
  startTime: string
  endTime: string
  status: string
  partnerId: { _id: string; businessName: string } | null
  serviceIds?: { _id: string; name: string; duration: number; price: number; image?: string }[]
  serviceId?: { _id: string; name: string; duration: number; price: number; image?: string } | null
  branchId: { _id: string; address: { line1: string; city: string } } | null
}

function formatBooking(b: BookingData, language: string = 'en') {
  const start = new Date(b.startTime)
  const end = new Date(b.endTime)
  const localeStr = language === 'am' || language === 'hy' ? 'hy-AM' : language === 'ru' ? 'ru-RU' : 'en-US'
  const date = start.toLocaleDateString(localeStr, { month: "short", day: "numeric", year: "numeric" })
  const time = `${start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} - ${end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`
  const location = b.branchId ? `${b.branchId.address.line1}, ${b.branchId.address.city}` : "—"

  return {
    id: b._id,
    serviceName: b.serviceIds && b.serviceIds.length > 0 
      ? (b.serviceIds.length === 1 ? b.serviceIds[0].name : `${b.serviceIds[0].name} + ${b.serviceIds.length - 1} more`) 
      : (b.serviceId?.name || "Service"),
    providerName: b.partnerId?.businessName || "Provider",
    date,
    time,
    location,
    status: b.status as "confirmed" | "pending" | "completed" | "cancelled" | "declined",
    image: b.serviceIds && b.serviceIds.length > 0 && b.serviceIds[0].image 
      ? b.serviceIds[0].image 
      : (b.serviceId?.image || "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&fit=crop"),
  }
}

export function BookingsContent() {
  const { i18n } = useTranslation()
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/bookings/my')
      setBookings(res.data)
    } catch (error) {
      console.error("Failed to load bookings", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    try {
      await api.patch(`/bookings/${id}/status`, { status: "cancelled" })
      fetchBookings()
    } catch {
      console.error("Failed to cancel booking")
    }
  }

  const now = new Date()
  const upcomingBookings = bookings.filter(b =>
    new Date(b.startTime) >= now && b.status !== "cancelled" && b.status !== "declined"
  )
  const pastBookings = bookings.filter(b =>
    new Date(b.startTime) < now || b.status === "cancelled" || b.status === "declined"
  )

  const activeBookingsCount = upcomingBookings.length
  const completedBookingsCount = pastBookings.length

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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Past</p>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "upcoming" ? (
              upcomingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">No upcoming bookings.</p>
                  <a href="/" className="mt-4 text-sm font-medium text-primary hover:underline">
                    Browse services to book
                  </a>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={formatBooking(booking, i18n.language)}
                    showActions
                    onCancel={() => handleCancel(booking._id)}
                  />
                ))
              )
            ) : (
              pastBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">No past bookings yet.</p>
                </div>
              ) : (
                pastBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={formatBooking(booking, i18n.language)}
                    showActions={false}
                  />
                ))
              )
            )}
          </div>
        )}
      </div>
    </main>
  )
}
