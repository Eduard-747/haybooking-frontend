import { User, Clock, MapPin, CreditCard, Timer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface BookingData {
  id: string
  bookedOn: string
  service: string
  provider: string
  dateTime: string
  location: string
  totalPaid: string
  duration: string
}

interface BookingSummaryCardProps {
  booking: BookingData
}

export function BookingSummaryCard({ booking }: BookingSummaryCardProps) {
  return (
    <Card className="shadow-lg border-border/50">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-xs font-medium tracking-wider text-primary uppercase">
          Booking ID: {booking.id}
        </span>
        <span className="text-sm text-muted-foreground">
          Booked on {booking.bookedOn}
        </span>
      </div>

      <CardContent className="p-6">
        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Service
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.service}
              </p>
            </div>
          </div>

          {/* Provider */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Provider
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.provider}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Date & Time
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.dateTime}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Location
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.location}
              </p>
            </div>
          </div>

          {/* Total Paid */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Total Paid
              </p>
              <p className="text-sm font-semibold text-foreground">
                {booking.totalPaid}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Timer className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Duration
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.duration}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
