import { User, Building2, Calendar, MapPin, CreditCard, Clock } from "lucide-react"

interface BookingSummaryCardProps {
  booking: {
    id: string
    bookedOn: string
    service: string
    provider: string
    dateTime: string
    location: string
    totalPaid: string
    duration: string
  }
}

export function BookingSummaryCard({ booking }: BookingSummaryCardProps) {
  return (
    <div className="w-full bg-white rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-[#FAFAFA]/50">
        <p className="text-[10px] font-bold tracking-wider text-[#FF4444] uppercase">
          Booking ID: {booking.id}
        </p>
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Booked on {booking.bookedOn}
        </p>
      </div>

      {/* Grid Content */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
        
        {/* Service */}
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
            <User className="h-4 w-4 text-[#FF4444]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Service</p>
            <p className="text-sm font-semibold text-foreground">{booking.service}</p>
          </div>
        </div>

        {/* Provider */}
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
            <Building2 className="h-4 w-4 text-[#FF4444]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Provider</p>
            <p className="text-sm font-semibold text-foreground">{booking.provider}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
            <Calendar className="h-4 w-4 text-[#FF4444]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Date & Time</p>
            <p className="text-sm font-semibold text-foreground">{booking.dateTime}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
            <MapPin className="h-4 w-4 text-[#FF4444]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Location</p>
            <p className="text-sm font-semibold text-foreground">{booking.location}</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
            <CreditCard className="h-4 w-4 text-[#FF4444]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Total Paid</p>
            <p className="text-sm font-semibold text-foreground">{booking.totalPaid}</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
            <Clock className="h-4 w-4 text-[#FF4444]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Duration</p>
            <p className="text-sm font-semibold text-foreground">{booking.duration}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
