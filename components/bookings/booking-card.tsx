"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Booking {
  id: string
  serviceName: string
  providerName: string
  date: string
  time: string
  location: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  image: string
}

interface BookingCardProps {
  booking: Booking
  showActions?: boolean
}

export function BookingCard({ booking, showActions = true }: BookingCardProps) {
  const getStatusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-background border border-border rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Service Image */}
        <div className="relative w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={booking.image}
            alt={booking.serviceName}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-foreground">
                  {booking.serviceName}
                </h3>
                {getStatusBadge()}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {booking.providerName}
              </p>
            </div>

            {/* Action Buttons - Desktop */}
            {showActions && (
              <div className="hidden sm:flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary/30 hover:bg-primary/5 hover:border-primary"
                >
                  Reschedule
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary/60" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/60" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary/60" />
              <span className="truncate max-w-[200px]">{booking.location}</span>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          {showActions && (
            <div className="flex sm:hidden gap-3 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary"
              >
                Reschedule
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
