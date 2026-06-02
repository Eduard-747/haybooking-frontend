"use client"

import { X, Calendar as CalendarIcon, Clock, User, Phone, CheckCircle, XCircle, MoreVertical, Check, PhoneCall } from "lucide-react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { hy, ru, enUS } from "date-fns/locale"
import { formatPrice } from "@/lib/currency"

interface Booking {
  _id: string
  startTime: string
  endTime: string
  status: string
  userId: { name: string; surname: string; phoneNumber: string; email?: string } | null
  serviceIds?: { name: string; duration: number; price: number }[]
  serviceId?: { name: string; duration: number; price: number } | null
  guestName?: string
  guestPhone?: string
  specialistId?: { _id: string; name: string } | null
  notes?: string
  createdAt?: string
}

interface BookingModalProps {
  booking: Booking
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => void
  currency?: string
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 border-amber-300 text-amber-700",
  confirmed: "bg-emerald-100 border-emerald-300 text-emerald-700",
  declined: "bg-red-100 border-red-300 text-red-700",
  cancelled: "bg-gray-100 border-gray-300 text-gray-500",
  completed: "bg-blue-100 border-blue-300 text-blue-700",
  "no-show": "bg-slate-100 border-slate-300 text-slate-700",
}

export function BookingModal({ booking, onClose, onUpdateStatus, currency = "AMD" }: BookingModalProps) {
  const { t, i18n } = useTranslation()

  const name = booking.userId ? `${booking.userId.name} ${booking.userId.surname || ""}`.trim() || t("common.guest", "Guest") : (booking.guestName || t("common.guest", "Guest"))
  const phone = booking.userId?.phoneNumber || booking.guestPhone
  const email = booking.userId?.email

  const services = booking.serviceIds && booking.serviceIds.length > 0 ? booking.serviceIds : (booking.serviceId ? [booking.serviceId] : [])
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)

  const startDate = new Date(booking.startTime)
  const endDate = new Date(booking.endTime)
  const dateLocale = i18n.language === 'am' ? hy : i18n.language === 'ru' ? ru : enUS
  const formattedDate = format(startDate, "EEEE, MMMM d, yyyy", { locale: dateLocale })
  const formattedTime = `${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} - ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border/50">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40 bg-[#FAFAFA]">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t("dashboard.bookingDetails", "Booking Details")}</h2>
            <div className={`mt-1.5 inline-flex text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider uppercase ${statusColors[booking.status] || "bg-gray-100 text-gray-500"}`}>
              {t(`common.${booking.status}` as any, booking.status)}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Customer Info */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("role.customer", "Customer")}</h3>
            <div className="flex items-center gap-3 bg-[#FDF6F6] p-3 rounded-xl border border-[#E5555E]/20">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-[#E5555E] font-bold shadow-sm shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{name}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {phone && <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-[#E5555E] transition-colors"><Phone className="h-3 w-3" /> {phone}</a>}
                </div>
              </div>
            </div>
          </div>

          {/* Time & Specialist */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("book.dateAndTime", "Date & Time")}</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarIcon className="h-4 w-4 text-[#C69C9B]" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <Clock className="h-4 w-4 text-[#C69C9B]" />
                  {formattedTime}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("common.specialist", "Specialist")}</h3>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                <User className="h-4 w-4 text-[#C69C9B]" />
                {booking.specialistId?.name || t("book.anyAvailable", "Any available")}
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("common.services", "Services")}</h3>
            <div className="space-y-2">
              {services.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.duration} {t("common.min", "min")}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatPrice(s.price, currency)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-border/60">
                <p className="text-sm font-bold text-foreground">{t("book.total", "Total")} ({totalDuration} {t("common.min", "min")})</p>
                <p className="text-base font-bold text-[#E5555E]">{formatPrice(totalPrice, currency)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("book.notes", "Notes")}</h3>
              <p className="text-sm text-foreground bg-gray-50 p-3 rounded-lg border border-border/40">{booking.notes}</p>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border/40 bg-[#FAFAFA] flex flex-wrap gap-2 justify-end">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border/60 text-foreground hover:bg-gray-50 text-sm font-semibold rounded-lg transition-colors mr-auto shadow-sm">
              <PhoneCall className="h-4 w-4 text-[#C69C9B]" />
              {t("landing.contact", "Contact")}
            </a>
          )}
          
          {["pending", "cancelled", "declined", "no-show"].includes(booking.status) && endDate.getTime() >= new Date().getTime() && (
            <>
              {booking.status !== "declined" && booking.status !== "cancelled" && (
                <button onClick={() => onUpdateStatus(booking._id, "declined")} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold rounded-lg transition-colors">
                  <XCircle className="h-4 w-4" /> {t("dashboard.reject", "Reject")}
                </button>
              )}
              <button onClick={() => onUpdateStatus(booking._id, "confirmed")} className="flex items-center gap-1.5 px-4 py-2 bg-[#E5555E] text-white hover:bg-[#d64c54] text-sm font-semibold rounded-lg transition-colors shadow-sm">
                <CheckCircle className="h-4 w-4" /> {t("dashboard.accept", "Accept")}
              </button>
            </>
          )}

          {["pending", "cancelled", "declined", "no-show"].includes(booking.status) && endDate.getTime() < new Date().getTime() && (
            <button onClick={() => onUpdateStatus(booking._id, "declined")} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold rounded-lg transition-colors">
              <XCircle className="h-4 w-4" /> {t("dashboard.reject", "Reject")}
            </button>
          )}

          {booking.status === "confirmed" && (
            <>
              <button onClick={() => onUpdateStatus(booking._id, "cancelled")} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold rounded-lg transition-colors">
                <XCircle className="h-4 w-4" /> {t("common.cancel", "Cancel")}
              </button>
            </>
          )}

          <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white hover:bg-black text-sm font-semibold rounded-lg transition-colors shadow-sm ml-2">
            {t("common.close", "Close")}
          </button>
        </div>

      </div>
    </div>
  )
}
