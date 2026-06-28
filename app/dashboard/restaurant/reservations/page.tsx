"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, User, Phone, CheckCircle, XCircle, ArrowRightLeft } from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"

export default function ReservationsManagementPage() {
  const { partnerId } = usePartner()
  const { selectedBranchId } = useBranchContext()

  const [reservations, setReservations] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [reassignDialog, setReassignDialog] = useState<{isOpen: boolean, reservationId: string | null, newTableId: string, reason: string}>({ isOpen: false, reservationId: null, newTableId: "", reason: "" })
  const [isReassigning, setIsReassigning] = useState(false)

  useEffect(() => {
    if (selectedBranchId && partnerId) {
      loadData()
    }
  }, [selectedBranchId, partnerId, date])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
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

  const handleReassign = async () => {
    if (!reassignDialog.reservationId || !reassignDialog.newTableId || !reassignDialog.reason) {
      toast.error("Please fill in all fields")
      return
    }
    setIsReassigning(true)
    try {
      await api.patch(`/restaurant/reservations/${reassignDialog.reservationId}/reassign`, {
        tableId: reassignDialog.newTableId,
        reason: reassignDialog.reason
      })
      toast.success("Table reassigned successfully")
      setReassignDialog({ isOpen: false, reservationId: null, newTableId: "", reason: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reassign table")
    } finally {
      setIsReassigning(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-blue-50 text-blue-700 border-blue-200",
    confirmed: "bg-amber-50 text-amber-700 border-amber-200",
    seated: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
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
                <p className="text-muted-foreground mt-1">Manage today&apos;s bookings and seated guests.</p>
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
                              {res.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusChange(res._id, 'confirmed')}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(res._id, 'rejected')}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
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
                                  onClick={() => setReassignDialog({ isOpen: true, reservationId: res._id, newTableId: res.tableId?._id || "", reason: "" })}
                                  className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  title="Reassign Table"
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                </button>
                              )}
                              {(res.status === 'confirmed' || res.status === 'seated' || res.status === 'pending') && (
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

            {/* Reassign Dialog */}
            {reassignDialog.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-border/40">
                    <h3 className="text-xl font-bold text-foreground">Reassign Table</h3>
                    <p className="text-sm text-muted-foreground mt-1">Move this reservation to another table.</p>
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">New Table</label>
                      <select 
                        value={reassignDialog.newTableId}
                        onChange={(e) => setReassignDialog(prev => ({...prev, newTableId: e.target.value}))}
                        className="w-full h-10 px-3 rounded-lg border border-border/60 bg-[#FAFAFA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                      >
                        <option value="" disabled>Select a table</option>
                        {tables.map(t => (
                          <option key={t._id} value={t._id}>{t.tableNumber} (Capacity: {t.capacity})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Reason for Reassignment</label>
                      <textarea
                        value={reassignDialog.reason}
                        onChange={(e) => setReassignDialog(prev => ({...prev, reason: e.target.value}))}
                        placeholder="e.g. Previous table had a leak, accommodating a larger group..."
                        className="w-full h-24 p-3 rounded-lg border border-border/60 bg-[#FAFAFA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">This reason will be sent to the customer.</p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-border/40 flex justify-end gap-3 bg-[#FAFAFA]/50">
                    <button
                      onClick={() => setReassignDialog({ isOpen: false, reservationId: null, newTableId: "", reason: "" })}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground bg-white border border-border/60 hover:bg-gray-50 transition-colors"
                      disabled={isReassigning}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReassign}
                      disabled={isReassigning || !reassignDialog.newTableId || !reassignDialog.reason.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E5555E] hover:bg-[#D4444D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReassigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                      Reassign
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
