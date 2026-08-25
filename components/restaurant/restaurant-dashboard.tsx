"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useTranslation } from "react-i18next"
import { Users, Clock, CalendarCheck, CalendarX, CheckCircle, TrendingUp, Plus } from "lucide-react"
import api from "@/lib/api"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { format } from "date-fns"

export function RestaurantDashboard() {
  const { t } = useTranslation()
  const { selectedBranchId } = useBranchContext()
  const { partnerId } = usePartner()
  const [stats, setStats] = useState({
    todayTotal: 0,
    seated: 0,
    completed: 0,
    cancelled: 0,
    capacityUtilized: 0
  })

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
            todayTotal: reservations.length,
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
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardSidebar activePath="/dashboard" />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title", "Restaurant Dashboard")}</h1>
              <p className="text-muted-foreground mt-2">{t("dashboard.subtitle", "Welcome back. Here's what's happening at your restaurant today.")}</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Stat Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">{t("dashboard.todaysBookings", "Today's Bookings")}</h3>
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <CalendarCheck className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{stats.todayTotal}</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">{t("dashboard.currentlySeated", "Currently Seated")}</h3>
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{stats.seated}</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">{t("dashboard.completed", "Completed")}</h3>
                  <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{stats.completed}</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">{t("dashboard.capacityUtilized", "Capacity Utilized")}</h3>
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{stats.capacityUtilized}%</div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
               <div className="bg-white rounded-2xl shadow-xs border border-border/40 p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-4">{t("dashboard.quickActions", "Quick Actions")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <a href="/dashboard/restaurant/reservations" className="flex flex-row sm:flex-col items-center justify-start sm:justify-center p-3.5 sm:p-4 rounded-xl border border-border/60 hover:bg-gray-50 transition-colors gap-3 text-left sm:text-center w-full">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF4444] shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-foreground leading-tight">{t("dashboard.manageReservations", "Manage Reservations")}</span>
                  </a>
                  <a href="/dashboard/restaurant/floor-plan" className="flex flex-row sm:flex-col items-center justify-start sm:justify-center p-3.5 sm:p-4 rounded-xl border border-border/60 hover:bg-gray-50 transition-colors gap-3 text-left sm:text-center w-full">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF4444] shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-foreground leading-tight">{t("dashboard.editFloorPlan", "Edit Floor Plan")}</span>
                  </a>
                  <a href="/dashboard/restaurant/reservations?add=true" className="flex flex-row sm:flex-col items-center justify-start sm:justify-center p-3.5 sm:p-4 rounded-xl border border-border/60 hover:bg-gray-50 transition-colors gap-3 text-left sm:text-center w-full">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF4444] shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-foreground leading-tight">{t("dashboard.addBooking", "Add Booking")}</span>
                  </a>
                </div>
               </div>
               
               <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 flex flex-col items-center justify-center text-center">
                  <CalendarX className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="font-semibold text-foreground">{t("dashboard.noAlerts", "No alerts for today")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("dashboard.allSmooth", "Everything is running smoothly.")}</p>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
