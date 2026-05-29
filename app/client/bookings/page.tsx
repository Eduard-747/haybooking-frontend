"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react"
import Image from "next/image"
import api from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { RoleGuard } from "@/components/auth/role-guard"

interface BookingFromApi {
  _id: string
  startTime: string
  endTime: string
  status: string
  partnerId: { _id: string; businessName: string; image?: string } | string
  specialistId?: { _id: string; name: string; image?: string } | string
  serviceIds?: { _id: string; name: string; duration: number; price: number; image?: string }[]
  serviceId?: { _id: string; name: string; duration: number; price: number; image?: string } | null
  branchId?: { _id: string; address: { line1: string; city: string; country: string } } | string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  declined: "bg-red-50 text-red-500 border-red-100",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingFromApi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const res = await api.get('/bookings/my')
        setBookings(res.data)
      } catch (err) {
        console.error("Failed to fetch bookings", err)
      } finally {
        setIsLoading(false)
      }
    }
    if (user) fetchBookings()
    else setIsLoading(false)
  }, [user])

  const now = new Date()
  const upcoming = bookings.filter(b => new Date(b.startTime) >= now)
  const past = bookings.filter(b => new Date(b.startTime) < now)
  const displayedBookings = tab === "upcoming" ? upcoming : past

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' })
      toast.success("Booking cancelled")
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b))
    } catch {
      toast.error("Failed to cancel booking")
    }
  }

  return (
    <RoleGuard allowedRole="client">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
        
        {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">My Bookings</h1>
          <p className="text-muted-foreground">Manage your appointments and view service history.</p>
        </div>

        <div className="flex items-center gap-8 bg-[#FDF6F6] border border-[#C69C9B]/20 rounded-xl px-8 py-5">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[#C69C9B] uppercase mb-1">Upcoming</p>
            <p className="text-2xl font-bold text-foreground">{upcoming.length}</p>
          </div>
          <div className="w-px h-10 bg-[#C69C9B]/20" />
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Completed</p>
            <p className="text-2xl font-bold text-foreground">{past.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border/60 mb-8">
        <button
          onClick={() => setTab("upcoming")}
          className={`relative pb-4 text-sm font-bold transition-colors ${tab === "upcoming" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Upcoming
          {upcoming.length > 0 && <span className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-[#E5555E] rounded-full" />}
          {tab === "upcoming" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C69C9B]" />}
        </button>
        <button
          onClick={() => setTab("past")}
          className={`relative pb-4 text-sm font-semibold transition-colors ${tab === "past" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Past
          {tab === "past" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C69C9B]" />}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-[#FDF6F6] flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-[#C69C9B]" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">No {tab} bookings</h2>
          <p className="text-sm text-muted-foreground">
            {tab === "upcoming" ? "Book a service to see your appointments here." : "Your past appointments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          {displayedBookings.map((booking) => {
            const partnerObj = booking.partnerId && typeof booking.partnerId === "object" ? booking.partnerId : null;
            const partnerName = partnerObj?.businessName || "Business";
            const partnerImage = partnerObj?.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop";

            const specialistObj = booking.specialistId && typeof booking.specialistId === "object" ? booking.specialistId : null;
            const specialistName = specialistObj?.name;

            const branchObj = booking.branchId && typeof booking.branchId === "object" ? booking.branchId : null;
            const branchAddress = branchObj?.address ? `${branchObj.address.line1}, ${branchObj.address.city}` : null;

            const serviceName = booking.serviceIds && booking.serviceIds.length > 0 
                      ? booking.serviceIds.length === 1 ? booking.serviceIds[0].name : `${booking.serviceIds[0].name} + ${booking.serviceIds.length - 1} more`
                      : (booking.serviceId?.name || "Service")
            
            const statusKey = booking.status?.toLowerCase() || "confirmed"

            return (
              <div key={booking._id} className="bg-white rounded-xl border border-border/60 p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-6 hover:shadow-md transition-shadow">

                {/* Image */}
                <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-border/40">
                  <Image src={partnerImage} alt={partnerName} fill className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    {booking.serviceIds && booking.serviceIds.length > 1 ? (
                      <h3 className="text-base font-bold text-foreground truncate" title={booking.serviceIds.map(s => s.name).join(', ')}>
                        {booking.serviceIds.map(s => s.name).join(', ')}
                      </h3>
                    ) : (
                      <h3 className="text-base font-bold text-foreground truncate">{serviceName}</h3>
                    )}
                    <span className={`shrink-0 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${statusColors[statusKey] || "bg-[#FAFAFA] border-border/50 text-muted-foreground"}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-3">
                    <p className="text-sm font-medium text-muted-foreground truncate">{partnerName}</p>
                    {specialistName && (
                      <>
                        <span className="hidden sm:inline text-border">•</span>
                        <p className="text-sm font-medium text-[#C69C9B] truncate">with {specialistName}</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground mt-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#C69C9B]" />
                      {formatDate(booking.startTime)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#C69C9B]" />
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </div>
                    {branchAddress && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#C69C9B]" />
                        <span className="truncate max-w-[200px]">{branchAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex md:flex-col items-center gap-3 md:gap-3 md:w-28 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/40">
                  <button
                    className="flex-1 md:w-full py-2 rounded-lg border border-border/40 text-muted-foreground text-xs font-bold uppercase tracking-wider cursor-not-allowed opacity-50"
                    title="Coming soon"
                    disabled
                  >
                    Reschedule
                  </button>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="flex-1 md:w-full py-2 text-muted-foreground text-xs font-bold uppercase tracking-wider hover:text-red-500 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>
        )}
  
      </div>
    </RoleGuard>
  )
}
