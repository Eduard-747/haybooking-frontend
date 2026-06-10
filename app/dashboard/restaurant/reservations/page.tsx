"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, User, Phone, CheckCircle, XCircle } from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"

export default function ReservationsManagementPage() {
  const { partnerId } = usePartner()
  const { selectedBranchId } = useBranchContext()

  const [reservations, setReservations] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (selectedBranchId && partnerId) {
      loadData()
    }
  }, [selectedBranchId, partnerId, date])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const dateStr = date.toISOString()
      const branchQuery = selectedBranchId ? `&branchId=${selectedBranchId}` : ''
      const partnerQuery = partnerId ? `partnerId=${partnerId}` : ''
      
      const [resData, tablesData] = await Promise.all([
        api.get(`/restaurant/reservations?${partnerQuery}${branchQuery}&date=${dateStr}`),
        api.get(`/restaurant/tables?${partnerQuery}${branchQuery}`)
      ])
      
      setReservations(resData.data)
      setTables(tablesData.data)
    } catch (err) {
      toast.error("Failed to load reservations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/restaurant/reservations/${id}/status`, { status: newStatus })
      toast.success("Status updated")
      loadData()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const statusColors: Record<string, string> = {
    confirmed: "bg-amber-50 text-amber-700 border-amber-200",
    seated: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    no_show: "bg-gray-100 text-gray-500 border-gray-200",
  }

  return (
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardSidebar activePath="/dashboard/restaurant/reservations" />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
                <p className="text-muted-foreground mt-1">Manage today's bookings and seated guests.</p>
              </div>
              
              <div className="flex items-center gap-3 bg-white px-4 py-2 border border-border/60 rounded-lg shadow-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <input 
                  type="date" 
                  className="border-none bg-transparent outline-none text-sm font-semibold text-foreground cursor-pointer"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(e) => setDate(new Date(e.target.value))}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-border/60 border-dashed">
                <p className="text-muted-foreground">No reservations found for this date.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAFA] border-b border-border/60 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Time</th>
                      <th className="px-6 py-3 font-semibold">Guest</th>
                      <th className="px-6 py-3 font-semibold">Table</th>
                      <th className="px-6 py-3 font-semibold">Party</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {reservations.map(res => {
                      const guestName = res.guestName || (res.userId ? `${res.userId.name} ${res.userId.surname}` : "Guest")
                      const guestPhone = res.guestPhone || res.userId?.phoneNumber
                      const tableName = res.tableId?.tableNumber || "Unknown"
                      
                      return (
                        <tr key={res._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {res.startTime}</span>
                              <span className="text-xs text-muted-foreground">until {res.endTime}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-bold text-foreground truncate max-w-[150px]">{guestName}</p>
                                {guestPhone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {guestPhone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-foreground">{tableName}</span>
                            {res.source === "walk_in" && <span className="ml-2 bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Walk-in</span>}
                          </td>
                          <td className="px-6 py-4 font-bold text-foreground">
                            {res.partySize} {res.partySize === 1 ? 'person' : 'people'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[res.status] || "bg-gray-100 border-gray-200 text-gray-600"}`}>
                              {res.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {res.status === 'confirmed' && (
                                <button 
                                  onClick={() => handleStatusChange(res._id, 'seated')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  Seat Guest
                                </button>
                              )}
                              {res.status === 'seated' && (
                                <button 
                                  onClick={() => handleStatusChange(res._id, 'completed')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" /> Complete
                                </button>
                              )}
                              {(res.status === 'confirmed' || res.status === 'seated') && (
                                <button 
                                  onClick={() => handleStatusChange(res._id, 'cancelled')}
                                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                  title="Cancel"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
