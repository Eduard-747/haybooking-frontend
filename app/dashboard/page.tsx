"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { Clock, User, Phone, Mail, Loader2, CheckCircle, XCircle, CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import api from "@/lib/api"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide"
import { toast } from "sonner"
import { formatPrice } from "@/lib/currency"
import { useTranslation } from "react-i18next"

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
  pending: "bg-amber-50 text-amber-600 border border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  declined: "bg-red-50 text-red-500 border border-red-100",
  cancelled: "bg-gray-50 text-gray-400 border border-gray-200",
  completed: "bg-blue-50 text-blue-600 border border-blue-100",
  "no-show": "bg-purple-50 text-purple-600 border border-purple-100",
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
  const [date, setDate] = useState<Date | undefined>(undefined)
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

  return (
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardSidebar activePath="/dashboard" />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-hidden flex flex-col">
          {setupStatus.isLoaded && !branchesLoading && (branches.length === 0 || setupStatus.services === 0 || setupStatus.specialists === 0) ? (
            <div className="flex-1 overflow-y-auto pb-8">
              <OnboardingGuide 
                hasBranch={branches.length > 0} 
                hasService={setupStatus.services > 0} 
                hasSpecialist={setupStatus.specialists > 0} 
              />
            </div>
          ) : (
          <div className="flex flex-col xl:flex-row gap-8 flex-1 overflow-hidden">

            {/* Left Column: Bookings */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t("nav.bookings", "Bookings")} {date ? `- ${getLocalizedDate(date)}` : ""}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{filteredBookings.length} {t("dashboard.totalBookings", "total bookings")}</p>
                </div>
                <Link href="/dashboard/book" className="flex items-center gap-2 px-5 py-2.5 bg-[#C69C9B] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl shadow-sm transition-colors self-start md:self-auto">
                  <Plus className="h-4 w-4" /> {t("nav.createBooking", "Create Booking")}
                </Link>
              </div>

              {(isLoading || partnerLoading) ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-border/40">
                  <p className="text-muted-foreground text-sm">{t("dashboard.noBookings", "No bookings yet. Share your booking link to get started.")}</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-border/40">
                  <p className="text-muted-foreground text-sm">{t("dashboard.noBookingsForDate", "No bookings scheduled for {{date}}.", { date: getLocalizedDate(date) })}</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
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

                    const isEnded = new Date(booking.endTime).getTime() < new Date().getTime();
                    const canAccept = booking.status !== "confirmed" && booking.status !== "completed" && !isEnded;

                    return (
                      <div key={booking._id} className="bg-white rounded-xl border border-[#C69C9B]/30 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-border/40 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                              <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-[#C69C9B]" /> {formatDate(booking.startTime, i18n.language)}</span>
                              <span className="text-border/60">|</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#C69C9B]" /> {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${statusColors[booking.status] || "bg-gray-50 text-gray-400 border border-gray-200"}`}>
                              {t(`common.${booking.status}` as any, booking.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="font-bold text-foreground mr-2">{price}</span>
                            <select
                              value={booking.status}
                              onChange={(e) => updateStatus(booking._id, e.target.value)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border/60 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#C69C9B]/20 transition-colors cursor-pointer"
                            >
                              <option value="pending">{t("common.pending", "Pending")}</option>
                              <option value="confirmed">{t("common.confirmed", "Confirmed")}</option>
                              <option value="completed">{t("common.completed", "Completed")}</option>
                              <option value="no-show">{t("common.no-show", "No-Show")}</option>
                              <option value="declined">{t("common.declined", "Declined")}</option>
                              <option value="cancelled">{t("common.cancelled", "Cancelled")}</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-4 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {userName}
                          </div>
                          <p className="text-xs text-muted-foreground pl-6">{t("common.service")}: {serviceName}</p>
                          {booking.specialistId?.name && (
                            <p className="text-xs text-muted-foreground pl-6">{t("common.specialist")}: <span className="font-medium text-foreground">{booking.specialistId.name}</span></p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                          {branchAddress && (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              {branchAddress}
                            </div>
                          )}
                          {userPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {userPhone}
                            </div>
                          )}
                          {booking.userId?.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              {booking.userId.email}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 pt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-border/60 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                      >
                        <ChevronLeft className="h-4 w-4 text-foreground" />
                      </button>
                      
                      <div className="flex items-center gap-1 mx-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                              currentPage === i + 1
                                ? "bg-[#C69C9B] text-white shadow-sm"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground bg-white border border-border/60"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-border/60 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                      >
                        <ChevronRight className="h-4 w-4 text-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Widgets */}
            <div className="w-full xl:w-80 shrink-0 space-y-6 overflow-y-auto pr-2 pb-4">
              <div className="bg-[#FAFAFA] rounded-2xl border border-border/60 p-4 shadow-inner">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-xl font-bold text-foreground">{t("nav.calendar", "Calendar")}</h2>
                  <button
                    onClick={() => setDate(undefined)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${!date ? "bg-[#C69C9B] text-white shadow-sm" : "bg-white text-muted-foreground border border-border/60 hover:text-foreground hover:border-border"}`}
                  >
                    {t("dashboard.allDays", "All Days")}
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-border/40 p-2 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    classNames={{
                      day_selected: "bg-[#C69C9B] text-white hover:bg-[#C69C9B] hover:text-white rounded-full",
                      day_today: "bg-accent text-accent-foreground rounded-full",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-full transition-colors",
                      head_cell: "text-muted-foreground font-semibold text-[10px] tracking-wider uppercase w-9",
                    }}
                  />
                </div>
              </div>

              <div className="bg-[#FAFAFA] rounded-2xl border border-border/60 p-6 shadow-inner">
                <h2 className="text-xl font-bold text-foreground mb-5">{t("dashboard.topSpecialists", "Top Specialists")}</h2>
                {topSpecialists.length > 0 ? (
                  <div className="space-y-3">
                    {topSpecialists.map(({ name, count }) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        <span className="text-xs font-bold text-[#C69C9B] bg-[#C69C9B]/10 px-2 py-1 rounded-md">{count} {t("dashboard.completedBookings", "completed")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("dashboard.noCompletedBookings", "No completed bookings yet.")}</p>
                )}
              </div>

              <div className="bg-[#FAFAFA] rounded-2xl border border-border/60 p-6 shadow-inner">
                <h2 className="text-xl font-bold text-foreground mb-5">{t("dashboard.topServices", "Top Services")}</h2>
                {topServices.length > 0 ? (
                  <div className="space-y-3">
                    {topServices.map(({ name, count }) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground line-clamp-1 pr-2">{name}</span>
                        <span className="text-xs font-bold text-[#C69C9B] bg-[#C69C9B]/10 px-2 py-1 rounded-md shrink-0">{count} {t("dashboard.completedBookings", "completed")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("dashboard.noCompletedBookings", "No completed bookings yet.")}</p>
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
