"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DateTimePicker } from "@/components/booking/date-time-picker"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, User, Phone, CheckCircle, XCircle, ArrowRightLeft, Plus, Layers, List, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { FloorPlanCanvas } from "@/components/restaurant/floor-plan-canvas"

export default function ReservationsManagementPage() {
  const { t } = useTranslation()
  const { partnerId } = usePartner()
  const { selectedBranchId } = useBranchContext()

  const [reservations, setReservations] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [floors, setFloors] = useState<any[]>([])
  const [elements, setElements] = useState<any[]>([])
  const [modalActiveFloorId, setModalActiveFloorId] = useState<string | null>(null)
  const [tableSelectMode, setTableSelectMode] = useState<"visual" | "list">("visual")
  const [manualZoom, setManualZoom] = useState<number | null>(null)
  const [manualPan, setManualPan] = useState<{ x: number; y: number } | null>(null)

  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [reassignDialog, setReassignDialog] = useState<{isOpen: boolean, reservationId: string | null, newTableId: string, reason: string}>({ isOpen: false, reservationId: null, newTableId: "", reason: "" })
  const [isReassigning, setIsReassigning] = useState(false)

  const [addDialog, setAddDialog] = useState({
    isOpen: false,
    selectedDate: new Date(),
    guestName: "",
    guestPhone: "",
    partySize: 2,
    tableId: "",
    startTime: "",
    endTime: "",
    source: "phone",
    notes: ""
  })
  const [isAdding, setIsAdding] = useState(false)
  const [branchDetails, setBranchDetails] = useState<any>(null)
  const [addDialogReservations, setAddDialogReservations] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('add') === 'true') {
        setAddDialog(prev => ({ ...prev, isOpen: true, selectedDate: new Date() }));
      }
    }
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      api.get(`/branches/${selectedBranchId}`)
        .then(res => setBranchDetails(res.data))
        .catch(console.error)
    }
  }, [selectedBranchId])

  useEffect(() => {
    if (addDialog.isOpen && selectedBranchId && partnerId && addDialog.selectedDate) {
      const dateStr = format(addDialog.selectedDate, 'yyyy-MM-dd')
      api.get(`/restaurant/reservations?partnerId=${partnerId}&branchId=${selectedBranchId}&date=${dateStr}`)
        .then(res => setAddDialogReservations(res.data))
        .catch(console.error)
    }
  }, [addDialog.isOpen, selectedBranchId, partnerId, addDialog.selectedDate])

  const bookedSlots = useMemo(() => {
    if (!addDialog.tableId) return []
    const slots: string[] = []
    
    const tableRes = addDialogReservations.filter(r => 
      (r.tableId?._id === addDialog.tableId || r.tableId === addDialog.tableId) && 
      r.status !== 'cancelled' && r.status !== 'rejected'
    )
    
    tableRes.forEach(r => {
      const [sh, sm] = r.startTime.split(':').map(Number)
      const [eh, em] = r.endTime.split(':').map(Number)
      let startMin = sh * 60 + sm
      const endMin = eh * 60 + em
      
      while(startMin < endMin) {
        const h = Math.floor(startMin / 60).toString().padStart(2, '0')
        const mins = (startMin % 60).toString().padStart(2, '0')
        slots.push(`${h}:${mins}`)
        startMin += 30
      }
    })
    
    return slots
  }, [addDialogReservations, addDialog.tableId])

  const handleTimeSelect = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const endH = (h + 2).toString().padStart(2, '0')
    const endM = m.toString().padStart(2, '0')
    setAddDialog(prev => ({ ...prev, startTime: time, endTime: `${endH}:${endM}` }))
  }

  useEffect(() => {
    if (selectedBranchId && partnerId) {
      loadData()
    }
  }, [selectedBranchId, partnerId, date])

  const selectedTableObj = useMemo(() => {
    return tables.find(tItem => tItem._id === addDialog.tableId || tItem.id === addDialog.tableId)
  }, [tables, addDialog.tableId])

  const uniqueFloors = useMemo(() => {
    const map = new Map()
    floors.forEach(f => {
      if (f && f.name) {
        const key = f.name.trim().toLowerCase()
        if (!map.has(key)) {
          map.set(key, f)
        }
      } else if (f && (f._id || f.id)) {
        map.set(f._id || f.id, f)
      }
    })
    return Array.from(map.values()) as any[]
  }, [floors])

  const currentActiveFloorId = modalActiveFloorId || uniqueFloors[0]?._id || uniqueFloors[0]?.id

  const currentFloorTables = useMemo(() => {
    return tables.filter(tItem => tItem.floorId === currentActiveFloorId)
  }, [tables, currentActiveFloorId])

  const currentFloorElements = useMemo(() => {
    return elements.filter(eItem => eItem.floorId === currentActiveFloorId)
  }, [elements, currentActiveFloorId])

  const autoFitTransform = useMemo(() => {
    if (currentFloorTables.length === 0 && currentFloorElements.length === 0) {
      return { scale: 0.75, pan: { x: 50, y: 50 } }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    currentFloorTables.forEach(tItem => {
      const x = tItem.position?.x ?? tItem.x ?? 100
      const y = tItem.position?.y ?? tItem.y ?? 100
      const w = tItem.dimensions?.width ?? tItem.width ?? 120
      const h = tItem.dimensions?.height ?? tItem.height ?? 120
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + w)
      maxY = Math.max(maxY, y + h)
    })

    currentFloorElements.forEach(eItem => {
      const x = eItem.position?.x ?? eItem.x ?? 100
      const y = eItem.position?.y ?? eItem.y ?? 100
      const w = eItem.width ?? 100
      const h = eItem.height ?? 100
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + w)
      maxY = Math.max(maxY, y + h)
    })

    if (minX === Infinity || isNaN(minX)) {
      return { scale: 0.75, pan: { x: 50, y: 50 } }
    }

    const containerW = 950
    const containerH = 460
    const padding = 60

    const boundingW = Math.max(maxX - minX + padding * 2, 300)
    const boundingH = Math.max(maxY - minY + padding * 2, 300)

    const scaleX = containerW / boundingW
    const scaleY = containerH / boundingH
    const calcScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25)

    const calcPanX = (containerW - (maxX + minX) * calcScale) / 2
    const calcPanY = (containerH - (maxY + minY) * calcScale) / 2

    return { scale: calcScale, pan: { x: calcPanX, y: calcPanY } }
  }, [currentFloorTables, currentFloorElements])

  const activeScale = manualZoom ?? autoFitTransform.scale
  const activePan = manualPan ?? autoFitTransform.pan

  const loadData = async () => {
    setIsLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const branchQuery = selectedBranchId ? `&branchId=${selectedBranchId}` : ''
      const partnerQuery = partnerId ? `partnerId=${partnerId}` : ''
      
      const [resData, tablesData, floorsData] = await Promise.all([
        api.get(`/restaurant/reservations?${partnerQuery}${branchQuery}&date=${dateStr}`),
        api.get(`/restaurant/tables?${partnerQuery}${branchQuery}`),
        selectedBranchId ? api.get(`/restaurant/floors?branchId=${selectedBranchId}`) : Promise.resolve({ data: [] })
      ])
      
      setReservations(resData.data)
      setTables(tablesData.data)
      const fetchedFloors = floorsData.data || []
      setFloors(fetchedFloors)

      const allElements: any[] = []
      if (Array.isArray(fetchedFloors)) {
        fetchedFloors.forEach((f: any) => {
          if (f.elements) {
            f.elements.forEach((e: any) => {
              allElements.push({ ...e, floorId: f._id })
            })
          }
        })
      }
      setElements(allElements)

      if (fetchedFloors.length > 0 && !modalActiveFloorId) {
        setModalActiveFloorId(fetchedFloors[0]._id)
      }
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

  const handleAddBooking = async () => {
    if (!addDialog.guestName || !addDialog.tableId || !addDialog.startTime || !addDialog.endTime) {
      toast.error("Please fill in required fields (Name, Table, Start Time, End Time)")
      return
    }
    
    setIsAdding(true)
    try {
      const selectedTable = tables.find(t => t._id === addDialog.tableId)
      
      await api.post(`/restaurant/reservations`, {
        partnerId,
        branchId: selectedBranchId,
        tableId: addDialog.tableId,
        floorId: selectedTable?.floorId,
        date: format(addDialog.selectedDate, 'yyyy-MM-dd'),
        startTime: addDialog.startTime,
        endTime: addDialog.endTime,
        partySize: addDialog.partySize,
        guestName: addDialog.guestName,
        guestPhone: addDialog.guestPhone,
        notes: addDialog.notes,
        source: addDialog.source,
        status: "confirmed"
      })
      toast.success("Booking created successfully")
      setAddDialog(prev => ({ ...prev, isOpen: false, guestName: "", guestPhone: "", notes: "" }))
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create booking")
    } finally {
      setIsAdding(false)
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
                <h1 className="text-2xl font-bold text-foreground">{t("restaurant.reservations.title", "Reservations")}</h1>
                <p className="text-muted-foreground mt-1">{t("restaurant.reservations.subtitle", "Manage today's bookings and seated guests.")}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-white px-4 py-2 border border-border/60 rounded-lg shadow-sm">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <input 
                    type="date" 
                    className="border-none bg-transparent outline-none text-sm font-semibold text-foreground cursor-pointer"
                    value={format(date, "yyyy-MM-dd")}
                    onChange={(e) => setDate(new Date(e.target.value))}
                  />
                </div>
                {selectedBranchId && (
                  <button
                    onClick={() => setAddDialog(prev => ({ ...prev, isOpen: true }))}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E5555E] hover:bg-[#D4444D] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    {t("restaurant.reservations.addBooking", "Add Booking")}
                  </button>
                )}
              </div>
            </div>

            {!selectedBranchId ? (
              <div className="bg-white rounded-xl border border-border/40 p-12 flex flex-col items-center justify-center text-center shadow-sm mt-6">
                <div className="w-20 h-20 bg-[#FDF6F6] rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-[#C69C9B]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("restaurant.floorPlan.selectBranchTitle", "Select a Branch")}</h2>
                <p className="text-muted-foreground max-w-md">{t("restaurant.reservations.selectBranchSubtitle", "Please select a specific branch from the top menu to view and manage its reservations.")}</p>
              </div>
            ) : (
              <>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-border/60 border-dashed">
                <p className="text-muted-foreground">{t("restaurant.reservations.noReservations", "No reservations found for this date.")}</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAFA] border-b border-border/60 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.reservations.time", "Time")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.reservations.guest", "Guest")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.reservations.table", "Table")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.reservations.party", "Party")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.reservations.status", "Status")}</th>
                      <th className="px-6 py-3 font-semibold text-right">{t("restaurant.reservations.actions", "Actions")}</th>
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
            </>
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

            {/* Add Booking Dialog */}
            {addDialog.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] border border-border/40">
                  <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
                    <div>
                      <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{t("restaurant.reservations.addDialogTitle", "Add New Booking")}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{t("restaurant.reservations.addDialogSubtitle", "Create a manual reservation.")}</p>
                    </div>
                    {selectedTableObj && (
                      <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-4 py-2 rounded-2xl shadow-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider">Table {selectedTableObj.tableNumber}</span>
                        <span className="text-xs text-emerald-600 font-medium">• {selectedTableObj.capacity} {t("restaurant.tables.seats", "seats")}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    
                    {/* Step 1: Visual Floor Plan & Party Size */}
                    <div className="space-y-4 bg-[#FAF9F6]/80 p-5 sm:p-6 rounded-3xl border border-border/60 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <label className="text-base font-extrabold text-foreground">{t("restaurant.reservations.selectTable", "1. Select Table *")}</label>
                          {selectedTableObj && (
                            <span className="sm:hidden bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                              Table {selectedTableObj.tableNumber} ({selectedTableObj.capacity} seats)
                            </span>
                          )}
                        </div>

                        {/* Mode Switcher & Party Size Input */}
                        <div className="flex items-center gap-3">
                          <div className="flex bg-gray-200/80 p-1 rounded-2xl text-xs font-medium">
                            <button
                              type="button"
                              onClick={() => setTableSelectMode("visual")}
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                                tableSelectMode === "visual" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                              {t("restaurant.floorPlan.visualPlan", "Visual Plan")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTableSelectMode("list")}
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                                tableSelectMode === "list" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <List className="w-3.5 h-3.5" />
                              {t("restaurant.tables.dropdownList", "Dropdown List")}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
                            <label className="text-xs font-bold text-foreground whitespace-nowrap">{t("restaurant.reservations.partySize", "Party Size *")}:</label>
                            <input
                              type="number"
                              min="1"
                              value={addDialog.partySize}
                              onChange={(e) => setAddDialog(prev => ({ ...prev, partySize: parseInt(e.target.value) || 1 }))}
                              className="w-16 h-8 px-2 rounded-xl border border-border/60 bg-white text-sm font-extrabold text-center focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {tableSelectMode === "visual" ? (
                        <div className="space-y-4">
                          {/* Clean Unique Floor Switcher (Only shown if restaurant has multiple floors) */}
                          {uniqueFloors.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                              <span className="text-xs font-bold text-muted-foreground shrink-0 uppercase tracking-wider">{t("restaurant.floorPlan.selectFloor", "Floor")}:</span>
                              {uniqueFloors.map((f: any) => {
                                const fId = f._id || f.id
                                const fTablesCount = tables.filter(tItem => tItem.floorId === fId).length
                                return (
                                  <button
                                    key={fId}
                                    type="button"
                                    onClick={() => {
                                      setModalActiveFloorId(fId)
                                      setManualZoom(null)
                                      setManualPan(null)
                                    }}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                      currentActiveFloorId === fId
                                        ? "bg-gray-900 text-white shadow-md"
                                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-2xs"
                                    }`}
                                  >
                                    <span>{f.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                      currentActiveFloorId === fId ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-600"
                                    }`}>
                                      {fTablesCount} {t("restaurant.tables.tablesCountBadge", "tables")}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {/* Visual Floor Canvas Container */}
                          <div className="relative w-full h-[460px] sm:h-[500px] bg-[#FAF9F6] rounded-2xl border border-gray-200 overflow-hidden shadow-inner flex flex-col group">
                            {/* Floating Controls */}
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-200/80 shadow-md">
                              <button
                                type="button"
                                title="Zoom In"
                                onClick={() => setManualZoom((prev => (prev ?? autoFitTransform.scale) * 1.18))}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Zoom Out"
                                onClick={() => setManualZoom((prev => (prev ?? autoFitTransform.scale) * 0.85))}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                              >
                                <ZoomOut className="w-4 h-4" />
                              </button>
                              <div className="h-4 w-px bg-gray-200 mx-0.5" />
                              <button
                                type="button"
                                title="Fit Full Plan"
                                onClick={() => {
                                  setManualZoom(null)
                                  setManualPan(null)
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Fit Plan</span>
                              </button>
                            </div>

                            <FloorPlanCanvas
                              floor={uniqueFloors.find(f => (f._id || f.id) === currentActiveFloorId) || uniqueFloors[0]}
                              tables={currentFloorTables}
                              elements={currentFloorElements}
                              selectedElementIds={addDialog.tableId ? [addDialog.tableId] : []}
                              onSelectElement={(id) => {
                                if (!id) return
                                const targetId = Array.isArray(id) ? id[0] : id
                                const selTable = tables.find(tItem => tItem._id === targetId || tItem.id === targetId)
                                if (selTable) {
                                  setAddDialog(prev => ({
                                    ...prev,
                                    tableId: selTable._id || selTable.id,
                                    partySize: selTable.capacity ? selTable.capacity : prev.partySize,
                                    startTime: "",
                                    endTime: ""
                                  }))
                                  toast.info(`Selected Table ${selTable.tableNumber} (${selTable.capacity} seats)`)
                                }
                              }}
                              onUpdateTable={() => {}}
                              onUpdateArea={() => {}}
                              readOnly={true}
                              mode="select"
                              scale={activeScale}
                              pan={activePan}
                              gridEnabled={true}
                              snapEnabled={false}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span>👈</span> {t("restaurant.reservations.clickTableHint", "Click any table directly on the floor plan to select it")}
                            </span>
                            {addDialog.tableId && (
                              <span className="font-extrabold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                ✓ Table {selectedTableObj?.tableNumber} {t("restaurant.reservations.selected", "Selected")}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Dropdown Selector Mode */
                        <div className="space-y-2">
                          <select 
                            value={addDialog.tableId}
                            onChange={(e) => setAddDialog(prev => ({...prev, tableId: e.target.value, startTime: "", endTime: ""}))}
                            className="w-full h-11 px-3 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                          >
                            <option value="" disabled>{t("restaurant.reservations.selectTablePlaceholder", "Select a table...")}</option>
                            {tables.map(tItem => (
                              <option key={tItem._id} value={tItem._id}>
                                Table {tItem.tableNumber} (Capacity: {tItem.capacity} seats)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Date & Time (Conditional) */}
                    {addDialog.tableId && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-foreground">{t("restaurant.reservations.selectDateTime", "2. Select Date & Time *")}</label>
                        </div>
                        <div className="border border-border/60 rounded-2xl p-4 sm:p-6 bg-[#FAFAFA] shadow-sm">
                          <DateTimePicker
                            selectedDate={addDialog.selectedDate}
                            onDateChange={(d) => d && setAddDialog(prev => ({ ...prev, selectedDate: d, startTime: "", endTime: "" }))}
                            selectedTime={addDialog.startTime}
                            onTimeChange={handleTimeSelect}
                            bookedSlots={bookedSlots}
                            workingHours={branchDetails?.workingHours || []}
                            breaks={branchDetails?.breaks || []}
                            totalDuration={30}
                          />
                          
                          {/* Manual End Time adjust */}
                          {addDialog.startTime && (
                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/40 animate-in fade-in duration-300">
                              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-4 w-4" /> {t("restaurant.reservations.departureTime", "Departure Time:")}
                              </label>
                              <input
                                type="time"
                                value={addDialog.endTime}
                                onChange={(e) => setAddDialog(prev => ({...prev, endTime: e.target.value}))}
                                className="w-32 h-10 px-3 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Guest Details */}
                    {addDialog.startTime && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <label className="text-sm font-semibold text-foreground">{t("restaurant.reservations.guestDetails", "3. Guest Details *")}</label>
                        <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-border/60 shadow-sm space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={addDialog.guestName}
                                onChange={(e) => setAddDialog(prev => ({...prev, guestName: e.target.value}))}
                                className="w-full h-11 px-3 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                                placeholder={t("restaurant.reservations.guestName", "Guest Name *")}
                              />
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={addDialog.guestPhone}
                                onChange={(e) => setAddDialog(prev => ({...prev, guestPhone: e.target.value}))}
                                className="w-full h-11 px-3 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                                placeholder={t("restaurant.reservations.guestPhone", "Phone Number")}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                              <select
                                value={addDialog.source}
                                onChange={(e) => setAddDialog(prev => ({...prev, source: e.target.value}))}
                                className="w-full h-11 px-3 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                              >
                                <option value="phone">{t("restaurant.reservations.sourcePhone", "Source: Phone")}</option>
                                <option value="walk_in">{t("restaurant.reservations.sourceWalkIn", "Source: Walk-in")}</option>
                                <option value="online">{t("restaurant.reservations.sourceOnline", "Source: Online")}</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <textarea
                              value={addDialog.notes}
                              onChange={(e) => setAddDialog(prev => ({...prev, notes: e.target.value}))}
                              placeholder={t("restaurant.reservations.specialRequests", "Any special requests or allergies...")}
                              className="w-full h-24 p-3 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-border/40 flex justify-end gap-3 bg-[#FAFAFA]/50">
                    <button
                      onClick={() => setAddDialog(prev => ({ ...prev, isOpen: false }))}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-white border border-border/60 hover:bg-gray-50 transition-colors shadow-sm"
                      disabled={isAdding}
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                    <button
                      onClick={handleAddBooking}
                      disabled={isAdding || !addDialog.guestName || !addDialog.tableId || !addDialog.startTime}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E5555E] hover:bg-[#D4444D] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {t("restaurant.reservations.addBooking", "Add Booking")}
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
