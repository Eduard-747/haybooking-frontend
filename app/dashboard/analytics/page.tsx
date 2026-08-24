"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BarChart3, Calendar, CheckCircle, XCircle, TrendingUp, Loader2, Users, Clock } from "lucide-react"
import api from "@/lib/api"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { formatPrice } from "@/lib/currency"
import { useTranslation } from "react-i18next"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Booking {
  _id: string
  startTime: string
  status: string
  serviceIds?: { name: string; price: number }[]
  serviceId?: { name: string; price: number } | null
  userId: { name: string; surname: string } | null
}

interface Stats {
  total: number
  confirmed: number
  cancelled: number
  declined: number
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { partnerId, partner, loading: partnerLoading } = usePartner()
  const { selectedBranchId, isLoading: branchesLoading } = useBranchContext()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year" | "all">("all")

  useEffect(() => {
    if (!partnerId || branchesLoading) {
      if (!partnerLoading && !branchesLoading) setIsLoading(false);
      return;
    }
    
    setIsLoading(true)
    const queryParams = new URLSearchParams({ partnerId })
    if (selectedBranchId) queryParams.append('branchId', selectedBranchId)

    api.get(`/bookings/partner?${queryParams.toString()}`)
      .then((res) => {
        setBookings(res.data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [partnerId, partnerLoading, branchesLoading, selectedBranchId])

  const filteredBookings = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return bookings.filter(b => {
      if (timeRange === "all") return true
      const d = new Date(b.startTime)
      
      if (timeRange === "today") return d >= startOfDay
      
      if (timeRange === "week") {
        const startOfWeek = new Date(startOfDay)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        return d >= startOfWeek
      }
      
      if (timeRange === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return d >= startOfMonth
      }
      
      if (timeRange === "year") {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return d >= startOfYear
      }
      return true
    })
  }, [bookings, timeRange])

  const computedStats = useMemo(() => {
    return {
      total: filteredBookings.length,
      confirmed: filteredBookings.filter(b => b.status === "confirmed").length,
      declined: filteredBookings.filter(b => b.status === "declined").length,
      cancelled: filteredBookings.filter(b => b.status === "cancelled").length,
      pending: filteredBookings.filter(b => b.status === "pending").length,
      completed: filteredBookings.filter(b => b.status === "completed").length,
      "no-show": filteredBookings.filter(b => b.status === "no-show").length,
    }
  }, [filteredBookings])

  // Calculate revenue from confirmed/completed bookings
  const revenue = filteredBookings
    .filter(b => ["confirmed", "completed"].includes(b.status))
    .reduce((sum, b) => {
      const bRev = b.serviceIds && b.serviceIds.length > 0 
        ? b.serviceIds.reduce((s, svc) => s + (svc.price || 0), 0) 
        : (b.serviceId?.price || 0)
      return sum + bRev
    }, 0)

  // Get bookings per day for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const perDay = last7Days.map(day => ({
    label: day.toLocaleDateString("en-US", { weekday: "short" }),
    count: filteredBookings.filter(b => {
      const bd = new Date(b.startTime)
      return bd.getDate() === day.getDate() && bd.getMonth() === day.getMonth() && bd.getFullYear() === day.getFullYear()
    }).length,
  }))
  const maxDay = Math.max(...perDay.map(d => d.count), 1)

  const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {}
  filteredBookings.forEach(b => {
    if (b.serviceIds && Array.isArray(b.serviceIds) && b.serviceIds.length > 0) {
      b.serviceIds.forEach(svc => {
        const id = svc.name
        if (!serviceCount[id]) serviceCount[id] = { name: id, count: 0, revenue: 0 }
        serviceCount[id].count++
        if (b.status === "confirmed") serviceCount[id].revenue += svc.price || 0
      })
    } else if (b.serviceId) {
      const id = b.serviceId.name
      if (!serviceCount[id]) serviceCount[id] = { name: id, count: 0, revenue: 0 }
      serviceCount[id].count++
      if (b.status === "confirmed") serviceCount[id].revenue += b.serviceId.price || 0
    }
  })
  const topServices = Object.values(serviceCount).sort((a, b) => b.count - a.count).slice(0, 5)

  // Recent bookings
  const recent = [...filteredBookings].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 5)

  const confirmRate = computedStats.total > 0 ? Math.round(((computedStats.confirmed + computedStats.completed) / computedStats.total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/analytics" />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("analyticsPage.analyticsOverview", "Analytics Overview")}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{t("analyticsPage.realtimePerformance", "Real-time performance data for your business.")}</p>
              </div>
              <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
                <SelectTrigger className="w-full sm:w-[180px] h-[42px] bg-white border border-border/60 hover:border-[#FF4444] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FF4444]/20 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("analyticsPage.allTime", "All Time")}</SelectItem>
                  <SelectItem value="today">{t("analyticsPage.today", "Today")}</SelectItem>
                  <SelectItem value="week">{t("analyticsPage.thisWeek", "This Week")}</SelectItem>
                  <SelectItem value="month">{t("analyticsPage.thisMonth", "This Month")}</SelectItem>
                  <SelectItem value="year">{t("analyticsPage.thisYear", "This Year")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(isLoading || partnerLoading) ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF4444]" />
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: t("analyticsPage.totalBookings", "Total Bookings"), value: computedStats.total, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: t("analyticsPage.confirmed", "Confirmed"), value: computedStats.confirmed, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: t("analyticsPage.declined", "Declined"), value: computedStats.declined, icon: XCircle, color: "text-red-400", bg: "bg-red-50" },
                    { label: t("analyticsPage.revenue", "Revenue"), value: formatPrice(revenue, partner?.currency), icon: TrendingUp, color: "text-[#FF4444]", bg: "bg-[#FEF2F2]" },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
                      <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                  {/* Bookings Bar Chart */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="h-5 w-5 text-[#FF4444]" />
                      <h2 className="font-bold text-foreground">{t("analyticsPage.bookingsLast7Days", "Bookings – Last 7 Days")}</h2>
                    </div>
                    <div className="flex items-end gap-3 h-40">
                      {perDay.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{d.count || ""}</span>
                          <div className="w-full rounded-t-md bg-[#FF4444]/20 flex items-end"
                            style={{ height: "100px" }}>
                            <div className="w-full rounded-t-md bg-[#FF4444] transition-all duration-500"
                              style={{ height: `${(d.count / maxDay) * 100}px` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{t(`calendar.${d.label.toLowerCase()}`, d.label)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation Rate */}
                  <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-[#FF4444]" />
                      <h2 className="font-bold text-foreground">{t("analyticsPage.bookingStatus", "Booking Status")}</h2>
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      {[
                        { label: t("analyticsPage.confirmed", "Confirmed"), value: computedStats.confirmed, color: "bg-emerald-400", pct: computedStats.total ? computedStats.confirmed / computedStats.total : 0 },
                        { label: t("analyticsPage.completed", "Completed"), value: computedStats.completed, color: "bg-blue-400", pct: computedStats.total ? computedStats.completed / computedStats.total : 0 },
                        { label: t("analyticsPage.declined", "Declined"), value: computedStats.declined, color: "bg-red-400", pct: computedStats.total ? computedStats.declined / computedStats.total : 0 },
                        { label: t("analyticsPage.cancelled", "Cancelled"), value: computedStats.cancelled, color: "bg-gray-300", pct: computedStats.total ? computedStats.cancelled / computedStats.total : 0 },
                        { label: t("analyticsPage.noShow", "No-Show"), value: computedStats["no-show"], color: "bg-purple-300", pct: computedStats.total ? computedStats["no-show"] / computedStats.total : 0 },
                      ].map(({ label, value, color, pct }) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">{label}</span>
                            <span className="text-xs font-bold text-foreground">{value}</span>
                          </div>
                          <div className="h-2 bg-[#FAFAFA] rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 text-center">
                        <p className="text-3xl font-bold text-foreground">{confirmRate}%</p>
                        <p className="text-xs text-muted-foreground">{t("analyticsPage.confirmationRate", "Confirmation Rate")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Services */}
                  <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6">
                    <h2 className="font-bold text-foreground mb-4">{t("analyticsPage.topServices", "Top Services")}</h2>
                    {topServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">{t("analyticsPage.noServiceData", "No service data yet")}</p>
                    ) : (
                      <div className="space-y-4">
                        {topServices.map((s, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{s.name}</span>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                                <span>{s.count} {t("analyticsPage.bookings", "bookings")}</span>
                                <span className="font-bold text-foreground">{formatPrice(s.revenue, partner?.currency)}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-[#FAFAFA] rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF4444] rounded-full" style={{ width: `${(s.count / (topServices[0]?.count || 1)) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Bookings */}
                  <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6">
                    <h2 className="font-bold text-foreground mb-4">{t("analyticsPage.recentBookings", "Recent Bookings")}</h2>
                    {recent.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">{t("analyticsPage.noBookingsYet", "No bookings yet")}</p>
                    ) : (
                      <div className="space-y-3">
                        {recent.map((b, i) => {
                          const name = b.userId ? `${b.userId.name} ${b.userId.surname || ""}`.trim() : t("common.guest", "Guest")
                          const statusColor = b.status === "confirmed" ? "text-emerald-600" : b.status === "completed" ? "text-blue-600" : b.status === "declined" ? "text-red-500" : b.status === "no-show" ? "text-purple-500" : "text-gray-400"
                          return (
                            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-[#FF4444]" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {b.serviceIds && b.serviceIds.length > 0
                                      ? b.serviceIds.map(s => s.name).join(', ')
                                      : (b.serviceId?.name || "Service")}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>{t(`common.${b.status}`, b.status)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
