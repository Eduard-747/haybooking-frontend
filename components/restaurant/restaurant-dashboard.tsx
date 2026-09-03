"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useTranslation } from "react-i18next"
import { 
  Users, Clock, CalendarCheck, CheckCircle2, 
  TrendingUp, Plus, Layers, UtensilsCrossed, Image as ImageIcon, 
  ChevronRight, CalendarIcon, ChevronDown, Bell, Check
} from "lucide-react"
import api from "@/lib/api"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from "recharts"

interface OverviewDataPoint {
  time: string
  bookings: number
}

const overviewChartData: OverviewDataPoint[] = [
  { time: "8 AM", bookings: 0.3 },
  { time: "10 AM", bookings: 0.3 },
  { time: "12 PM", bookings: 2.5 },
  { time: "2 PM", bookings: 1.0 },
  { time: "4 PM", bookings: 0.5 },
  { time: "6 PM", bookings: 1.0 },
  { time: "8 PM", bookings: 0.6 },
  { time: "10 PM", bookings: 0.1 },
]

export function RestaurantDashboard() {
  const { t, i18n } = useTranslation()
  const { selectedBranchId } = useBranchContext()
  const { partnerId, partner } = usePartner()
  const [stats, setStats] = useState({
    todayTotal: 1,
    seated: 0,
    completed: 0,
    cancelled: 0,
    capacityUtilized: 0
  })

  const restaurantName = partner?.businessName || "La Bohem"

  const dateLocale = i18n.language === 'am' || i18n.language === 'hy' ? 'hy-AM' : i18n.language === 'ru' ? 'ru-RU' : 'en-US'
  const displayDate = new Date().toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })

  useEffect(() => {
    if (partnerId) {
      const fetchStats = async () => {
        try {
          const dateStr = new Date().toISOString()
          const isValidObjectId = (id: any) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
          const branchQuery = isValidObjectId(selectedBranchId) ? `&branchId=${selectedBranchId}` : ''
          const partnerQuery = `partnerId=${partnerId}`
          
          const [resData, tablesData] = await Promise.all([
            api.get(`/restaurant/reservations?${partnerQuery}${branchQuery}&date=${dateStr}`),
            api.get(`/restaurant/tables?${partnerQuery}${branchQuery}`)
          ])
          
          const reservations = resData.data || []
          const tables = tablesData.data || []
          
          const seated = reservations.filter((r: any) => r.status === 'seated').length
          const completed = reservations.filter((r: any) => r.status === 'completed').length
          const cancelled = reservations.filter((r: any) => r.status === 'cancelled' || r.status === 'no_show').length
          
          const totalSeats = tables.reduce((sum: number, t: any) => sum + (t.capacity || 0), 0)
          const occupiedSeats = reservations
            .filter((r: any) => r.status === 'seated' || r.status === 'confirmed')
            .reduce((sum: number, r: any) => sum + (r.partySize || 0), 0)
            
          setStats({
            todayTotal: reservations.length > 0 ? reservations.length : 1,
            seated,
            completed,
            cancelled,
            capacityUtilized: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0
          })
        } catch (err) {
          console.error("Failed to fetch dashboard stats", err)
        }
      }
      fetchStats()
    }
  }, [selectedBranchId, partnerId])

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex font-sans">
      <DashboardSidebar activePath="/dashboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Header Greeting Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <span>{t("dashboard.goodMorning", "Good morning")}, {restaurantName}!</span>
                  <span className="inline-block animate-bounce">👋</span>
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  {t("dashboard.title", "Restaurant Dashboard")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  {t("dashboard.subtitle", "Here's what's happening at your restaurant today.")}
                </p>
              </div>

              {/* Main CTA Add Booking Button */}
              <a
                href="/dashboard/restaurant/reservations?add=true"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FF3B30] hover:bg-[#E0322A] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-[#FF3B30]/30 transition-all active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t("dashboard.addBooking", "Add Booking")}</span>
              </a>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {t("dashboard.quickActions", "Quick Actions")}
              </h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
                
                {/* Manage Reservations */}
                <a
                  href="/dashboard/restaurant/reservations"
                  className="bg-[#FFF5F5] hover:bg-[#FFEAEA] border border-[#FFE6E8] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-[130px] sm:h-[136px] relative group transition-all shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#FF3B30] group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug pr-4 sm:pr-6 break-normal hyphens-none">
                    {t("dashboard.manageReservations", "Manage Reservations")}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-2xs text-[#FF3B30] flex items-center justify-center absolute bottom-3 sm:bottom-3.5 right-3 sm:right-3.5 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </a>

                {/* Edit Floor Plan */}
                <a
                  href="/dashboard/restaurant/floor-plan"
                  className="bg-[#F7F5FF] hover:bg-[#EFEAFF] border border-[#EFEAFF] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-[130px] sm:h-[136px] relative group transition-all shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#7C3AED] group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug pr-4 sm:pr-6 break-normal hyphens-none">
                    {t("dashboard.editFloorPlan", "Edit Floor Plan")}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-2xs text-[#7C3AED] flex items-center justify-center absolute bottom-3 sm:bottom-3.5 right-3 sm:right-3.5 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </a>

                {/* Manage Menu */}
                <a
                  href="/dashboard/restaurant/menu"
                  className="bg-[#FFFBF0] hover:bg-[#FFF4D6] border border-[#FFF4D6] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-[130px] sm:h-[136px] relative group transition-all shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#D97706] group-hover:scale-105 transition-transform">
                    <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug pr-4 sm:pr-6 break-normal hyphens-none">
                    {t("dashboard.manageMenu", "Manage Menu")}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-2xs text-[#D97706] flex items-center justify-center absolute bottom-3 sm:bottom-3.5 right-3 sm:right-3.5 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </a>

                {/* View Gallery */}
                <a
                  href="/dashboard/restaurant/gallery"
                  className="bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#DCFCE7] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-[130px] sm:h-[136px] relative group transition-all shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#059669] group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug pr-4 sm:pr-6 break-normal hyphens-none">
                    {t("dashboard.viewGallery", "View Gallery")}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-2xs text-[#059669] flex items-center justify-center absolute bottom-3 sm:bottom-3.5 right-3 sm:right-3.5 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </a>

                {/* Add Booking Card */}
                <a
                  href="/dashboard/restaurant/reservations?add=true"
                  className="bg-[#FFF5F5]/60 hover:bg-[#FFEAEA]/80 border-2 border-dashed border-[#FFCCD2] rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center h-[130px] sm:h-[136px] group transition-all cursor-pointer col-span-2 lg:col-span-1"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFEBEB] text-[#FF3B30] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-2xs">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-[#FF3B30] break-normal hyphens-none">
                    {t("dashboard.addBooking", "Add Booking")}
                  </span>
                </a>

              </div>
            </div>
            
            {/* Stat Cards (4 Columns desktop, 2 Columns mobile) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Today's Bookings */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 truncate">
                      {t("dashboard.todaysBookings", "Today's Bookings")}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight mt-2">{stats.todayTotal}</div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <span>+ 100%</span>
                    <span className="font-normal text-slate-400">{t("dashboard.vsYesterday", "vs yesterday")}</span>
                  </span>
                  {/* Sparkline curve */}
                  <svg className="w-16 h-7 text-emerald-500 overflow-visible" viewBox="0 0 60 24" fill="none">
                    <path d="M 2 20 Q 20 22, 35 10 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Currently Seated */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 truncate">
                      {t("dashboard.currentlySeated", "Currently Seated")}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight mt-2">{stats.seated}</div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span>&mdash; 0%</span>
                    <span className="font-normal text-slate-400">{t("dashboard.vsYesterday", "vs yesterday")}</span>
                  </span>
                  {/* Sparkline curve */}
                  <svg className="w-16 h-7 text-emerald-400 overflow-visible" viewBox="0 0 60 24" fill="none">
                    <path d="M 2 16 Q 20 18, 38 12 T 58 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 truncate">
                      {t("dashboard.completed", "Completed")}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight mt-2">{stats.completed}</div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span>&mdash; 0%</span>
                    <span className="font-normal text-slate-400">{t("dashboard.vsYesterday", "vs yesterday")}</span>
                  </span>
                  {/* Sparkline curve */}
                  <svg className="w-16 h-7 text-purple-400 overflow-visible" viewBox="0 0 60 24" fill="none">
                    <path d="M 2 18 Q 25 14, 40 18 T 58 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Capacity Utilized */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 truncate">
                      {t("dashboard.capacityUtilized", "Capacity Utilized")}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight mt-2">{stats.capacityUtilized}%</div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span>&mdash; 0%</span>
                    <span className="font-normal text-slate-400">{t("dashboard.vsYesterday", "vs yesterday")}</span>
                  </span>
                  {/* Sparkline curve */}
                  <svg className="w-16 h-7 text-amber-500 overflow-visible" viewBox="0 0 60 24" fill="none">
                    <path d="M 2 20 Q 25 22, 42 16 T 58 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Bottom Row Grid: Today's Overview (Chart) & Today's Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Today's Overview Chart (Takes 2 Columns) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {t("dashboard.todaysOverview", "Today's Overview")}
                  </h3>

                  {/* Date Selector Button */}
                  <button
                    type="button"
                    className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{displayDate}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-64 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={overviewChartData}
                      margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} 
                        dy={10}
                      />
                      <YAxis 
                        domain={[0, 4]} 
                        ticks={[0, 1, 2, 3, 4]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} 
                      />
                      <Tooltip content={<CustomTooltip t={t} />} />
                      <Area 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#8B5CF6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#purpleGradient)" 
                        activeDot={{ r: 6, fill: "#7C3AED", stroke: "#FFFFFF", strokeWidth: 3 }}
                      />
                      <ReferenceDot x="2 PM" y={1.0} r={5} fill="#7C3AED" stroke="#FFFFFF" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Highlight Tooltip Box rendered at 2 PM point (Matches screenshot) */}
                  <div className="absolute top-[38%] left-[45%] transform -translate-x-1/2 -translate-y-full mb-2 bg-white border border-slate-200/80 shadow-lg rounded-xl px-3 py-1.5 text-center pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-xs font-black text-slate-900 leading-tight">{t("dashboard.oneBooking", "1 Booking")}</p>
                    <p className="text-[10px] font-bold text-slate-400">2:00 PM</p>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-200/80 rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Today's Alerts (Takes 1 Column) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs flex flex-col justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-4">
                  {t("dashboard.todaysAlerts", "Today's Alerts")}
                </h3>

                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
                  {/* Pink Graphic Backdrop with Bell */}
                  <div className="w-24 h-24 rounded-full bg-[#FFEAEA]/70 flex items-center justify-center mb-4 relative shadow-2xs">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF4D4D] text-white flex items-center justify-center shadow-md shadow-[#FF4D4D]/30 relative">
                      <Bell className="w-7 h-7 stroke-[2.2]" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-slate-900 rounded-full border-2 border-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {t("dashboard.noAlerts", "No alerts for today")}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {t("dashboard.allSmooth", "Everything is running smoothly.")}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, t }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200/80 shadow-lg rounded-xl px-3 py-1.5 text-center">
        <p className="text-xs font-black text-slate-900 leading-tight">
          {t ? t("dashboard.oneBooking", "1 Booking") : "1 Booking"}
        </p>
        <p className="text-[10px] font-bold text-slate-400">{data.time}</p>
      </div>
    )
  }
  return null
}

