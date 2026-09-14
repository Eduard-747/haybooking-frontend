"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { Clock, User, Phone, Mail, Loader2, CheckCircle, XCircle, CalendarIcon, ChevronLeft, ChevronRight, Plus, MapPin } from "lucide-react"
import api from "@/lib/api"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide"
import { toast } from "sonner"
import { formatPrice } from "@/lib/currency"
import { useTranslation } from "react-i18next"
import { useRestaurant } from "@/hooks/useRestaurant"
import { RestaurantDashboard } from "@/components/restaurant/restaurant-dashboard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Booking {
  _id: string
  startTime: string
  endTime: string
  status: string
  userId: { _id: string; name: string; surname: string; phoneNumber: string; email: string } | null
  serviceIds?: { _id: string; name: string; price: number; duration: number }[]
  serviceId?: { _id: string; name: string; price: number; duration: number } | null
  branchId?: { _id: string; address: { line1: string; city: string; country: string } } | string | null
  guestName?: string
  guestPhone?: string
  createdAt: string
  specialistId?: { _id: string; name: string } | null
}

const ITEMS_PER_PAGE = 5;

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/60",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/60",
  declined: "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/60",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60",
  completed: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/60",
  "no-show": "bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100/60",
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
}

function formatDate(iso: string, language: string = 'en') {
  const localeStr = language === 'am' ? 'hy-AM' : language === 'ru' ? 'ru-RU' : 'en-US'
  return new Date(iso).toLocaleDateString(localeStr, { month: "short", day: "numeric", year: "numeric" })
}

const MONTH_NAMES = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export default function BusinessDashboardPage() {
  const { partnerId, partner, loading: partnerLoading } = usePartner()
  const { selectedBranchId, branches, isLoading: branchesLoading } = useBranchContext()
  const { isRestaurant } = useRestaurant()
  const { t, i18n } = useTranslation()
  const [setupStatus, setSetupStatus] = useState({ services: 0, specialists: 0, isLoaded: false })

  const getLocalizedDate = (d: Date | undefined) => {
    if (!d) return "";
    const monthKey = MONTH_NAMES[d.getMonth()];
    const monthName = t(`calendar.${monthKey}`);
    return `${monthName} ${d.getDate()}`;
  }
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(() => new Date())
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, declined: 0 })
  const [currentPage, setCurrentPage] = useState(1)

  const fetchBookings = useCallback(async () => {
    if (!partnerId) return
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({ partnerId })
      if (selectedBranchId) queryParams.append('branchId', selectedBranchId)

      const [bookingsRes, analyticsRes] = await Promise.all([
        api.get(`/bookings/partner?${queryParams.toString()}`),
        api.get(`/bookings/analytics?${queryParams.toString()}`)
      ])
      setBookings(bookingsRes.data)
      setStats(analyticsRes.data)
    } catch (err) {
      console.error("Failed to load bookings", err)
    } finally {
      setIsLoading(false)
    }
  }, [partnerId, selectedBranchId])

  useEffect(() => {
    if (partnerId && !branchesLoading) fetchBookings()
    else if (!partnerLoading && !branchesLoading) setIsLoading(false)
  }, [partnerId, partnerLoading, branchesLoading, fetchBookings])

  useEffect(() => {
    if (partnerId) {
      Promise.all([
        api.get(`/services?partnerId=${partnerId}`),
        api.get(`/specialists?partnerId=${partnerId}`)
      ]).then(([servRes, specRes]) => {
        setSetupStatus({
          services: servRes.data?.length || 0,
          specialists: specRes.data?.length || 0,
          isLoaded: true
        })
      }).catch(() => {
        setSetupStatus(prev => ({ ...prev, isLoaded: true }))
      })
    }
  }, [partnerId])

  useEffect(() => {
    setCurrentPage(1)
  }, [date])

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status })
      toast.success(`Booking ${status}`)
      fetchBookings()
    } catch {
      toast.error("Failed to update booking status")
    }
  }

  const todayBookings = bookings.filter(b => {
    const d = new Date(b.startTime)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  // Filter by selected date
  const filteredBookings = date
    ? bookings.filter(b => {
      const d = new Date(b.startTime)
      return d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    })
    : bookings;

  // Sort by createdAt desc
  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Paginate
  const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Top 5 Specialists
  const specialistStats = bookings.reduce((acc, b) => {
    if (b.status === 'completed' && b.specialistId) {
      const id = b.specialistId._id;
      if (!acc[id]) {
        acc[id] = { name: b.specialistId.name, count: 0 };
      }
      acc[id].count += 1;
    }
    return acc;
  }, {} as Record<string, { name: string, count: number }>);

  const topSpecialists = Object.values(specialistStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top 5 Services
  const serviceStats = bookings.reduce((acc, b) => {
    if (b.status === 'completed') {
      const services = b.serviceIds && b.serviceIds.length > 0
        ? b.serviceIds
        : (b.serviceId ? [b.serviceId] : []);

      services.forEach(s => {
        if (s._id) {
          if (!acc[s._id]) {
            acc[s._id] = { name: s.name, count: 0 };
          }
          acc[s._id].count += 1;
        }
      });
    }
    return acc;
  }, {} as Record<string, { name: string, count: number }>);

  const topServices = Object.values(serviceStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (isRestaurant) {
    return <RestaurantDashboard />
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard" />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          {setupStatus.isLoaded && !branchesLoading && (branches.length === 0 || setupStatus.services === 0 || setupStatus.specialists === 0) ? (
            <div className="flex-1 overflow-y-auto pb-8">
              <OnboardingGuide
                hasBranch={branches.length > 0}
                hasService={setupStatus.services > 0}
                hasSpecialist={setupStatus.specialists > 0}
              />
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">

              {/* Left Column: Bookings */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 shrink-0">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {t("nav.bookings", "Bookings")} {date ? `- ${getLocalizedDate(date)}` : ""}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                      {filteredBookings.length} {t("dashboard.totalBookings", "total bookings")}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/book"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF3B30] hover:bg-[#E03838] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> {t("nav.createBooking", "Create Booking")}
                  </Link>
                </div>

                {(isLoading || partnerLoading) ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FF3B30]" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
                    <p className="text-slate-500 text-sm font-medium">{t("dashboard.noBookings", "No bookings yet. Share your booking link to get started.")}</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
                    <p className="text-slate-500 text-sm font-medium">{t("dashboard.noBookingsForDate", "No bookings scheduled for {{date}}.", { date: getLocalizedDate(date) })}</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {paginatedBookings.map((booking) => {
                      const userName = booking.userId
                        ? `${booking.userId.name || ""} ${booking.userId.surname || ""}`.trim() || t("common.guest")
                        : (booking.guestName || t("common.guest"));
                      const userPhone = booking.userId?.phoneNumber || booking.guestPhone;

                      const serviceName = booking.serviceIds && booking.serviceIds.length > 0
                        ? booking.serviceIds.map(s => s.name).join(', ')
                        : booking.serviceId?.name || t("common.service")

                      const branchObj = booking.branchId && typeof booking.branchId === "object" ? booking.branchId : null;
                      const branchAddress = branchObj?.address ? `${branchObj.address.line1}, ${branchObj.address.city}` : null;

                      const totalPrice = booking.serviceIds && booking.serviceIds.length > 0
                        ? booking.serviceIds.reduce((sum, s) => sum + (s.price || 0), 0)
                        : booking.serviceId?.price || 0
                      const price = totalPrice ? formatPrice(totalPrice, partner?.currency) : "—"

                      return (
                        <div
                          key={booking._id}
                          className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5"
                        >
                          {/* Card Header: Date/Time pills + Interactive Status Select */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                              <span className="inline-flex items-center gap-1.5 bg-[#FFF0F0] text-[#FF3B30] px-2.5 py-1 rounded-lg font-extrabold">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {formatDate(booking.startTime, i18n.language)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                              </span>
                            </div>

                            <div className="self-start sm:self-auto shrink-0">
                              <Select value={booking.status} onValueChange={(value) => updateStatus(booking._id, value)}>
                                <SelectTrigger
                                  className={cn(
                                    "h-8 px-3 py-1 text-xs font-bold rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-[#FF3B30]/20 cursor-pointer shadow-2xs",
                                    statusColors[booking.status] || "bg-slate-50 text-slate-600 border-slate-200"
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="end" className="rounded-xl shadow-xl border-slate-200 p-1">
                                  <SelectItem value="pending">{t("common.pending", "Pending")}</SelectItem>
                                  <SelectItem value="confirmed">{t("common.confirmed", "Confirmed")}</SelectItem>
                                  <SelectItem value="completed">{t("common.completed", "Completed")}</SelectItem>
                                  <SelectItem value="no-show">{t("common.no-show", "No-Show")}</SelectItem>
                                  <SelectItem value="declined">{t("common.declined", "Declined")}</SelectItem>
                                  <SelectItem value="cancelled">{t("common.cancelled", "Cancelled")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Customer & Service Info */}
                          <div className="mb-3.5 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-rose-50 text-[#FF3B30] flex items-center justify-center shrink-0 border border-rose-100 font-extrabold text-xs">
                                  <User className="w-4 h-4 text-[#FF3B30]" />
                                </div>
                                <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                                  {userName}
                                </span>
                              </div>
                              {price !== "—" && (
                                <span className="font-extrabold text-[#FF3B30] text-xs sm:text-sm shrink-0 bg-[#FFF0F0] px-2.5 py-1 rounded-lg border border-rose-100">
                                  {price}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 pl-10 text-xs sm:text-sm">
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-slate-400 shrink-0">{t("common.service")}:</span>
                                <span className="font-medium text-slate-800 leading-snug">{serviceName}</span>
                              </div>
                              {booking.specialistId?.name && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-400 shrink-0">{t("common.specialist")}:</span>
                                  <span className="font-bold text-slate-900">{booking.specialistId.name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Contact & Location Footer */}
                          {(branchAddress || userPhone || booking.userId?.email) && (
                            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                              {branchAddress && (
                                <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{branchAddress}</span>
                                </div>
                              )}
                              {userPhone && (
                                <a href={`tel:${userPhone}`} className="flex items-center gap-1.5 hover:text-[#FF3B30] transition-colors font-medium">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{userPhone}</span>
                                </a>
                              )}
                              {booking.userId?.email && (
                                <a href={`mailto:${booking.userId.email}`} className="flex items-center gap-1.5 hover:text-[#FF3B30] transition-colors truncate max-w-full font-medium">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{booking.userId.email}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-8 pt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-2xs cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-700" />
                        </button>

                        <div className="flex items-center gap-1 mx-1">
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === i + 1
                                  ? "bg-[#FF3B30] text-white shadow-2xs"
                                  : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                                }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-2xs cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-700" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Widgets */}
              <div className="w-full xl:w-80 shrink-0 space-y-5 pb-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{t("nav.calendar", "Calendar")}</h2>
                    <button
                      type="button"
                      onClick={() => setDate(undefined)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${!date ? "bg-[#FF3B30] text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {t("dashboard.allDays", "All Days")}
                    </button>
                  </div>
                  <div className="bg-slate-50/70 rounded-xl border border-slate-100 p-1.5 flex justify-center overflow-x-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md"
                      classNames={{
                        day_selected: "bg-[#FF3B30] text-white hover:bg-[#FF3B30] hover:text-white rounded-full font-bold",
                        day_today: "bg-rose-100 text-[#FF3B30] font-bold rounded-full",
                        day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-slate-200/70 rounded-full transition-colors text-xs sm:text-sm",
                        head_cell: "text-slate-400 font-semibold text-[10px] sm:text-xs tracking-wider uppercase w-8 sm:w-9",
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-4">{t("dashboard.topSpecialists", "Top Specialists")}</h2>
                  {topSpecialists.length > 0 ? (
                    <div className="space-y-2">
                      {topSpecialists.map(({ name, count }) => (
                        <div key={name} className="flex items-center justify-between text-xs sm:text-sm bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-800">{name}</span>
                          <span className="font-extrabold text-[#FF3B30] bg-[#FFF0F0] px-2.5 py-1 rounded-lg text-xs">{count} {t("dashboard.completedBookings", "completed")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-400 italic">{t("dashboard.noCompletedBookings", "No completed bookings yet.")}</p>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-4">{t("dashboard.topServices", "Top Services")}</h2>
                  {topServices.length > 0 ? (
                    <div className="space-y-2">
                      {topServices.map(({ name, count }) => (
                        <div key={name} className="flex items-center justify-between text-xs sm:text-sm bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-800 truncate pr-2">{name}</span>
                          <span className="font-extrabold text-[#FF3B30] bg-[#FFF0F0] px-2.5 py-1 rounded-lg text-xs shrink-0">{count} {t("dashboard.completedBookings", "completed")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-400 italic">{t("dashboard.noCompletedBookings", "No completed bookings yet.")}</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  )
}
