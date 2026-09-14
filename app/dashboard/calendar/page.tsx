"use client"

import React, { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, Calendar as CalendarIcon, Clock, Plus } from "lucide-react"
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
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70",
  declined: "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70",
  completed: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/70",
  "no-show": "bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100/70",
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

        <main className="flex-1 p-3.5 sm:p-6 flex flex-col lg:flex-row gap-6 overflow-x-hidden">

          {/* Calendar Main Grid Container */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
            
            {/* Header / Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => nav(-1)}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight text-center sm:text-left min-w-[140px]">
                  {t(`calendar.${MONTHS[currentDate.getMonth()].toLowerCase()}`)} {currentDate.getFullYear()}
                </h2>
                <button
                  type="button"
                  onClick={() => nav(1)}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date())}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {t("calendar.today", "Today")}
                </button>

                <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setViewMode("Week")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "Week" ? "bg-[#FF3B30] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t("calendar.week", "Week")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("Day")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "Day" ? "bg-[#FF3B30] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t("calendar.day", "Day")}
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid & Day View */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF3B30]" />
              </div>
            ) : viewMode === "Week" ? (
              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <div className="grid min-w-[650px] sm:min-w-0 w-full" style={{ gridTemplateColumns: `54px repeat(${activeDays.length}, 1fr)` }}>
                  {/* Empty top-left time header cell */}
                  <div className="border-b border-slate-200/80 bg-slate-50/80 sticky left-0 z-20" />
                  
                  {/* Day headers */}
                  {activeDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCurrentDate(day);
                          setViewMode("Day");
                        }}
                        className="border-b border-l border-slate-200/80 bg-slate-50/80 py-2.5 px-1 text-center hover:bg-slate-100/60 transition-colors w-full flex flex-col items-center justify-center cursor-pointer"
                      >
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-tight truncate w-full text-center">
                          {t(`calendar.${DAYS[day.getDay()].toLowerCase()}`)}
                        </span>
                        <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${isToday ? "w-6 h-6 sm:w-7 sm:h-7 bg-[#FF3B30] text-white rounded-full flex items-center justify-center mx-auto" : "text-slate-900"}`}>
                          {day.getDate()}
                        </span>
                      </button>
                    )
                  })}

                  {/* Time rows */}
                  {HOURS.map(hour => (
                    <React.Fragment key={`row-${hour}`}>
                      <div className="border-t border-slate-100 py-2 px-1 text-[10px] sm:text-xs font-bold text-slate-400 text-right bg-slate-50/40 sticky left-0 z-20">
                        {hour}:00
                      </div>
                      {activeDays.map((day, di) => {
                        const slotBookings = getBookingsForSlot(day, hour)
                        const isBreak = isBreakSlot(day, hour)
                        return (
                          <div
                            key={`${di}-${hour}`}
                            onClick={() => { setCurrentDate(day); setViewMode("Day"); }}
                            className={`border-t border-l border-slate-100 min-h-[54px] p-1 relative cursor-pointer transition-colors ${
                              isBreak ? 'bg-slate-100/70 hover:bg-slate-200/50' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            {isBreak && slotBookings.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest rotate-[-30deg]">
                                  {t("calendar.break", "Break")}
                                </span>
                              </div>
                            )}
                            <div className="relative z-10 space-y-1">
                              {slotBookings.map(b => (
                                <div
                                  key={b._id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                                  className={`text-[10px] font-bold px-1.5 py-1 rounded-lg border truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-2xs ${
                                    statusColors[b.status] || "bg-blue-50 border-blue-200 text-blue-700"
                                  }`}
                                >
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
              /* CLEAN VERTICAL DAY AGENDA VIEW */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
                <div className="max-w-3xl mx-auto space-y-4">
                  {/* Day Navigation Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewMode("Week")}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> {t("calendar.backToWeek", "Back to Week")}
                      </button>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {t(`calendar.${DAYS[currentDate.getDay()].toLowerCase()}`)}, {t(`calendar.${MONTHS[currentDate.getMonth()].toLowerCase()}`)} {currentDate.getDate()}, {currentDate.getFullYear()}
                      </h3>
                    </div>
                  </div>

                  {/* Vertical Timetable List */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden divide-y divide-slate-100">
                    {HOURS.map((hour) => {
                      const slotBookings = getBookingsForSlot(currentDate, hour);
                      const isBreak = isBreakSlot(currentDate, hour);
                      return (
                        <div key={hour} className="flex items-start transition-colors hover:bg-slate-50/40">
                          {/* Hour Label */}
                          <div className="w-16 sm:w-20 py-3.5 pr-3 text-right text-xs font-extrabold text-slate-400 shrink-0 bg-slate-50/50 border-r border-slate-100">
                            {hour}:00
                          </div>

                          {/* Hourly Slot Details */}
                          <div className={`flex-1 p-2.5 sm:p-3 min-h-[64px] flex flex-col justify-center gap-2 relative ${isBreak ? 'bg-slate-100/60' : ''}`}>
                            {isBreak && slotBookings.length === 0 && (
                              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider py-1">
                                <span className="bg-slate-200 px-2 py-0.5 rounded-md text-[10px]">{t("calendar.break", "Break")}</span>
                              </div>
                            )}

                            {slotBookings.length > 0 ? (
                              <div className="space-y-2">
                                {slotBookings.map((b) => (
                                  <div
                                    key={b._id}
                                    onClick={() => setSelectedBooking(b)}
                                    className={`p-3 rounded-xl border ${statusColors[b.status] || "bg-blue-50 border-blue-200 text-blue-700"} shadow-2xs transition-all hover:scale-[1.01] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                                  >
                                    <div>
                                      <span className="font-extrabold text-sm block">
                                        {b.userId ? `${b.userId.name} ${b.userId.surname || ""}`.trim() || t("common.guest", "Guest") : (b.guestName || t("common.guest", "Guest"))}
                                      </span>
                                      <span className="text-xs opacity-90 font-medium block mt-0.5">
                                        {b.serviceIds && b.serviceIds.length > 0
                                          ? b.serviceIds.map((s: any) => s.name).join(', ')
                                          : (b.serviceId ? (b.serviceId as any).name : "")
                                        }
                                      </span>
                                      {b.specialistId && (
                                        <span className="text-[11px] opacity-75 font-semibold block mt-0.5">
                                          {t("common.with", "with")} {(b.specialistId as any).name}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg bg-white/70 self-start sm:self-auto shrink-0 border border-current/10">
                                      {t(`common.${b.status}` as any, b.status)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : !isBreak ? (
                              <div className="text-xs text-slate-300 font-medium py-1">
                                {t("calendar.noBookingsForSlot", "Available")}
                              </div>
                            ) : null}
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">{t("dashboard.bookingRequests", "Booking Requests")}</h3>
                <span className="bg-[#FFF0F0] text-[#FF3B30] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-rose-100">
                  {pendingBookings.length}
                </span>
              </div>

              {pendingBookings.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 text-center py-8 italic">{t("dashboard.noRequests", "No pending requests")}</p>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-260px)]">
                  {pendingBookings.map(b => {
                    const name = b.userId ? `${b.userId.name} ${b.userId.surname || ""}`.trim() || t("common.guest") : (b.guestName || t("common.guest"))
                    const localeStr = i18n.language === 'am' ? 'hy-AM' : i18n.language === 'ru' ? 'ru-RU' : 'en-US'
                    const time = new Date(b.startTime).toLocaleString(localeStr, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    const isEnded = new Date(b.endTime).getTime() < new Date().getTime();
                    return (
                      <div
                        key={b._id}
                        onClick={() => setSelectedBooking(b)}
                        className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-all hover:bg-white shadow-2xs"
                      >
                        <p className="font-extrabold text-sm text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {b.serviceIds && b.serviceIds.length > 0
                            ? b.serviceIds.map(s => s.name).join(', ')
                            : (b.serviceId?.name || t("common.service", "Service"))
                          }
                        </p>
                        {b.specialistId?.name && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{t("common.with", "with")} {b.specialistId.name}</p>
                        )}
                        <p className="text-xs text-[#FF3B30] font-bold mt-1.5">{time}</p>
                        {!isEnded && (
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateStatus(b._id, "confirmed"); }}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> {t("dashboard.accept", "Accept")}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateStatus(b._id, "declined"); }}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors cursor-pointer"
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
