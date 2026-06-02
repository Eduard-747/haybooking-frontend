"use client"

import React, { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { BookingModal } from "@/components/dashboard/booking-modal"

interface Booking {
  _id: string
  startTime: string
  endTime: string
  status: string
  userId: { name: string; surname: string; phoneNumber: string } | null
  serviceIds?: { name: string; duration: number; price: number }[]
  serviceId?: { name: string; duration: number; price: number } | null
  guestName?: string
  guestPhone?: string
  specialistId?: { _id: string; name: string } | null
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8am - 8pm

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 border-amber-300 text-amber-700",
  confirmed: "bg-emerald-100 border-emerald-300 text-emerald-700",
  declined: "bg-red-100 border-red-300 text-red-700",
  cancelled: "bg-gray-100 border-gray-300 text-gray-500",
}

export default function CalendarPage() {
  const { partnerId, loading: partnerLoading } = usePartner()
  const { branches, selectedBranchId, isLoading: branchesLoading } = useBranchContext()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"Week" | "Day">("Week")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const { t, i18n } = useTranslation()

  const isBreakSlot = (day: Date, hour: number) => {
    if (!selectedBranchId) return false;
    const branch = branches.find(b => b._id === selectedBranchId);
    if (!branch || !branch.breaks || branch.breaks.length === 0) return false;

    const dayOfWeek = day.getDay();
    const breaks = branch.breaks.filter(b => b.weekday === dayOfWeek);

    const slotStartMins = hour * 60;
    const slotEndMins = hour * 60 + 60;

    for (const b of breaks) {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      const breakStartMins = sh * 60 + sm;
      const breakEndMins = eh * 60 + em;
      if (slotStartMins < breakEndMins && slotEndMins > breakStartMins) return true;
    }
    return false;
  }

  const fetchBookings = async () => {
    if (!partnerId) return
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({ partnerId })
      if (selectedBranchId) queryParams.append('branchId', selectedBranchId)

      const res = await api.get(`/bookings/partner?${queryParams.toString()}`)
      setBookings(res.data)
    } catch {
      console.error("Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId && !branchesLoading) fetchBookings()
    else if (!partnerLoading && !branchesLoading) setIsLoading(false)
  }, [partnerId, partnerLoading, branchesLoading, selectedBranchId])

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status })
      toast.success(`Booking ${status}`)
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status } : null)
      }
      fetchBookings()
    } catch {
      toast.error("Failed to update status")
    }
  }

  const getWeekDays = () => {
    const start = new Date(currentDate)
    const dayOfWeek = start.getDay() === 0 ? 6 : start.getDay() - 1 // Make Monday 0, Sunday 6
    start.setDate(start.getDate() - dayOfWeek)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const activeDays = viewMode === "Week" ? getWeekDays() : [currentDate]

  const getBookingsForSlot = (day: Date, hour: number) => {
    return bookings.filter(b => {
      const d = new Date(b.startTime)
      return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear() && d.getHours() === hour
    })
  }

  const pendingBookings = bookings.filter(b => b.status === "pending")

  const nav = (dir: number) => {
    const d = new Date(currentDate)
    if (viewMode === "Week") d.setDate(d.getDate() + dir * 7)
    else if (viewMode === "Day") d.setDate(d.getDate() + dir)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/calendar" />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">

          {/* Calendar Grid */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <button onClick={() => nav(-1)} className="p-1.5 hover:bg-[#FAFAFA] rounded-lg transition-colors">
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <h2 className="text-lg font-bold text-foreground">
                  {t(`calendar.${MONTHS[currentDate.getMonth()].toLowerCase()}`)} {currentDate.getFullYear()}
                </h2>
                <button onClick={() => nav(1)} className="p-1.5 hover:bg-[#FAFAFA] rounded-lg transition-colors">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-1 bg-[#FAFAFA] rounded-lg p-1 border border-border/40">
                <button
                  onClick={() => setViewMode("Week")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${viewMode === "Week" ? "bg-[#C69C9B] text-white shadow-sm" : "text-muted-foreground hover:bg-gray-100"}`}
                >
                  {t("calendar.week", "Week")}
                </button>
                <button
                  onClick={() => setViewMode("Day")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${viewMode === "Day" ? "bg-[#C69C9B] text-white shadow-sm" : "text-muted-foreground hover:bg-gray-100"}`}
                >
                  {t("calendar.day", "Day")}
                </button>
              </div>
            </div>

            {/* Calendar Grid & Day View */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
              </div>
            ) : viewMode === "Week" ? (
              <div className="flex-1 overflow-auto">
                <div className="grid" style={{ gridTemplateColumns: `60px repeat(${activeDays.length}, 1fr)` }}>
                  {/* Day headers */}
                  <div className="border-b border-border/40 bg-[#FAFAFA]" />
                  {activeDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentDate(day);
                          setViewMode("Day");
                        }}
                        className="border-b border-l border-border/40 bg-[#FAFAFA] py-3 text-center hover:bg-gray-50 transition-colors w-full flex flex-col items-center justify-center cursor-pointer"
                      >
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t(`calendar.${DAYS[day.getDay()].toLowerCase()}`)}</p>
                        <p className={`text-base font-bold mt-0.5 ${isToday ? "w-8 h-8 bg-[#C69C9B] text-white rounded-full flex items-center justify-center mx-auto" : "text-foreground"}`}>
                          {day.getDate()}
                        </p>
                      </button>
                    )
                  })}

                  {/* Time rows */}
                  {HOURS.map(hour => (
                    <React.Fragment key={`row-${hour}`}>
                      <div className="border-t border-border/20 pt-2 px-2 text-[10px] text-muted-foreground font-medium text-right">
                        {hour}:00
                      </div>
                      {activeDays.map((day, di) => {
                        const slotBookings = getBookingsForSlot(day, hour)
                        const isBreak = isBreakSlot(day, hour)
                        return (
                          <div key={`${di}-${hour}`} onClick={() => { setCurrentDate(day); setViewMode("Day"); }} className={`border-t border-l border-border/20 min-h-[52px] p-1 relative cursor-pointer transition-colors ${isBreak ? 'bg-slate-100/60 hover:bg-slate-200/50' : 'hover:bg-gray-50/50'}`}>
                            {isBreak && slotBookings.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest rotate-[-45deg]">{t("calendar.break")}</span>
                              </div>
                            )}
                            <div className="relative z-10">
                              {slotBookings.map(b => (
                                <div key={b._id} onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} className={`text-[10px] font-semibold px-1.5 py-1 rounded border mb-0.5 truncate cursor-pointer transition-transform hover:scale-[1.02] ${statusColors[b.status] || "bg-blue-50 border-blue-200 text-blue-700"}`}>
                                  {b.userId ? `${b.userId.name} ${b.userId.surname || ""}`.trim() || t("common.guest", "Guest") : (b.guestName || t("common.guest", "Guest"))}
                                  {b.serviceIds && b.serviceIds.length > 0
                                    ? ` · ${b.serviceIds.length === 1 ? b.serviceIds[0].name : `${b.serviceIds[0].name} +${b.serviceIds.length - 1}`}`
                                    : (b.serviceId ? ` · ${b.serviceId.name}` : "")
                                  }
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              /* NEW DAY VIEW */
              <div className="flex-1 overflow-auto bg-[#FAFAFA]/30 relative">
                <div className="w-max min-w-full p-6">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setViewMode("Week")} className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors bg-white px-3 py-1.5 border border-border/60 rounded-lg shadow-sm">
                        <ChevronLeft className="w-4 h-4" /> {t("calendar.backToWeek")}
                      </button>
                      <h3 className="text-xl font-bold text-foreground">
                        {t(`calendar.${DAYS[currentDate.getDay()].toLowerCase()}`)}, {t(`calendar.${MONTHS[currentDate.getMonth()].toLowerCase()}`)} {currentDate.getDate()}, {currentDate.getFullYear()}
                      </h3>
                    </div>
                  </div>

                  {/* Horizontal Timeline */}
                  <div className="bg-white border border-border/60 rounded-xl shadow-sm flex">
                    {HOURS.map((hour, idx) => {
                      const slotBookings = getBookingsForSlot(currentDate, hour);
                      const isBreak = isBreakSlot(currentDate, hour);
                      return (
                        <div key={hour} className={`flex-1 min-w-[140px] flex flex-col ${idx !== HOURS.length - 1 ? 'border-r border-border/40' : ''}`}>
                          {/* Time Header */}
                          <div className={`text-center py-3 bg-[#FAFAFA] border-b border-border/40 text-xs font-bold uppercase tracking-wider ${isBreak ? 'text-slate-400' : 'text-slate-500'}`}>
                            {hour}:00
                          </div>

                          {/* Bookings Area */}
                          <div className={`flex-1 min-h-[400px] p-2 flex flex-col gap-2 relative transition-colors group ${isBreak ? 'bg-slate-50/80 hover:bg-slate-100/50' : 'hover:bg-slate-50/50'}`}>
                            {isBreak && slotBookings.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest rotate-[-90deg]">{t("calendar.break")}</span>
                              </div>
                            )}
                            <div className="relative z-10 flex flex-col gap-2">
                              {slotBookings.map(b => (
                                <div key={b._id} onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} className={`text-xs font-semibold px-2.5 py-2 rounded-lg border ${statusColors[b.status] || "bg-blue-50 border-blue-200 text-blue-700"} shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`}>
                                  <div className="truncate font-bold mb-0.5">{b.userId ? `${b.userId.name} ${b.userId.surname || ""}`.trim() || "Guest" : (b.guestName || "Guest")}</div>
                                  <div className="truncate text-[10px] opacity-90">
                                    {b.serviceIds && b.serviceIds.length > 0
                                      ? b.serviceIds.map((s: any) => s.name).join(', ')
                                      : (b.serviceId ? (b.serviceId as any).name : "")
                                    }
                                  </div>
                                  {b.specialistId && (
                                    <div className="truncate text-[10px] opacity-75 mt-1 border-t border-current/10 pt-1">
                                      {(b.specialistId as any).name}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Empty State placeholder on hover */}
                            {!isBreak && slotBookings.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("calendar.addSlot")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Pending Requests */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">{t("dashboard.bookingRequests", "Booking Requests")}</h3>
                <span className="bg-[#FDF6F6] text-[#E5555E] text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingBookings.length}
                </span>
              </div>

              {pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("dashboard.noRequests", "No pending requests")}</p>
              ) : (
                <div className="space-y-4 overflow-auto max-h-[calc(100vh-260px)]">
                  {pendingBookings.map(b => {
                    const name = b.userId ? `${b.userId.name} ${b.userId.surname || ""}`.trim() || t("common.guest") : (b.guestName || t("common.guest"))
                    const localeStr = i18n.language === 'am' ? 'hy-AM' : i18n.language === 'ru' ? 'ru-RU' : 'en-US'
                    const time = new Date(b.startTime).toLocaleString(localeStr, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    const isEnded = new Date(b.endTime).getTime() < new Date().getTime();
                    return (
                      <div key={b._id} onClick={() => setSelectedBooking(b)} className="p-4 bg-[#FAFAFA] rounded-xl border border-border/50 cursor-pointer transition-transform hover:scale-[1.02] hover:bg-white shadow-sm">
                        <p className="font-bold text-sm text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.serviceIds && b.serviceIds.length > 0
                            ? b.serviceIds.map(s => s.name).join(', ')
                            : (b.serviceId?.name || "Service")
                          }
                        </p>
                        {b.specialistId?.name && (
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{t("common.with")} {b.specialistId.name}</p>
                        )}
                        <p className="text-xs text-[#C69C9B] font-medium mt-1">{time}</p>
                        {!isEnded && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(b._id, "confirmed"); }}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> {t("dashboard.accept", "Accept")}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(b._id, "declined"); }}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> {t("dashboard.decline", "Decline")}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </main>

      </div>
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking as any}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  )
}
