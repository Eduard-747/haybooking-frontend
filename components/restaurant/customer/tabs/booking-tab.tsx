"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Calendar } from "@/components/ui/calendar"
import { FloorPlanCanvas } from "@/components/restaurant/floor-plan-canvas"
import { format } from "date-fns"
import { X, Clock, Users, Calendar as CalendarIcon, Info } from "lucide-react"

interface BookingTabProps {
  branches: any[]
  selectedBranch: string | null
  onBranchSelect: (id: string) => void
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  selectedTime: string | null
  setSelectedTime: (t: string | null) => void
  selectedEndTime?: string | null
  setSelectedEndTime?: (t: string | null) => void
  reservationNotes?: string
  setReservationNotes?: (n: string) => void
  partySize: number
  setPartySize: (s: number) => void
  floors: any[]
  tables: any[]
  reservations: any[]
  bookedSlots: string[]
  onBookTable: (tableId: string) => void
}

export function BookingTab({
  branches,
  selectedBranch,
  onBranchSelect,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  selectedEndTime,
  setSelectedEndTime,
  reservationNotes,
  setReservationNotes,
  partySize,
  setPartySize,
  floors,
  tables,
  reservations,
  bookedSlots,
  onBookTable
}: BookingTabProps) {
  const { t } = useTranslation()
  const [activeFloorId, setActiveFloorId] = useState<string | null>(floors[0]?._id || null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  
  // Modal State
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [modalError, setModalError] = useState("")

  useEffect(() => {
    if (floors.length > 0) {
      const currentFloorExists = floors.some(f => f._id === activeFloorId)
      if (!activeFloorId || !currentFloorExists) {
        setActiveFloorId(floors[0]._id)
      }
    } else {
      setActiveFloorId(null)
    }
  }, [floors, activeFloorId])

  const activeFloor = floors.find(f => f._id === activeFloorId)

  // In this new flow, tables are just shown as their default status on the floor plan.
  // The specific time conflict is validated in the Modal.
  const getProcessedTables = () => {
    if (!activeFloorId) return []
    return tables.filter(t => t.floorId === activeFloorId).map(table => {
      return { ...table, status: "available" }
    })
  }

  const processedTables = getProcessedTables()
  const selectedTable = processedTables.find(t => t._id === selectedTableId || t.id === selectedTableId)

  const handleTableClick = (id: string | string[] | null, shiftKey?: boolean) => {
    const finalId = Array.isArray(id) ? id[0] : id;
    if (!finalId) {
      setSelectedTableId(null)
      setShowBookingModal(false)
      return
    }
    setSelectedTableId(finalId)
    setShowBookingModal(true)
    setModalError("")
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError("")
    if (!selectedTime || (setSelectedEndTime && !selectedEndTime)) {
      setModalError("Please select both arrival and departure times.")
      return
    }
    
    if (selectedTable && partySize > selectedTable.capacity) {
      setModalError(`This table has a maximum capacity of ${selectedTable.capacity} guests.`)
      return
    }

    // Overlap check
    const reqStart = selectedTime
    const reqEnd = selectedEndTime || ""
    
    if (reqStart >= reqEnd) {
      setModalError("Departure time must be after arrival time.")
      return
    }

    const hasConflict = reservations.some(r => {
      if (r.tableId?._id !== selectedTableId && r.tableId !== selectedTableId) return false
      if (r.status === 'cancelled' || r.status === 'rejected') return false
      
      const rStart = r.startTime
      const rEnd = r.endTime
      return (rStart < reqEnd && reqStart < rEnd)
    })

    if (hasConflict) {
      setModalError("This table is already booked during the selected time range. Please choose another time or table.")
      return
    }

    onBookTable(selectedTableId!)
    setShowBookingModal(false)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-32">
      
      <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex flex-col items-center">
        <h2 className="text-xl font-bold text-foreground mb-4">Select Date</h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          className="rounded-md border shadow"
          classNames={{
            day_selected: "bg-[#E5555E] text-white hover:bg-[#E5555E] hover:text-white focus:bg-[#E5555E] focus:text-white rounded-full",
            day_today: "bg-accent text-accent-foreground rounded-full",
            day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-full transition-colors text-lg",
            head_cell: "text-muted-foreground font-semibold tracking-wider uppercase w-10",
          }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">Select a Table</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-border/60 shadow-sm">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]" /> Available</div>
          </div>
        </div>
        
        {floors.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center bg-gray-50 border border-border/60 rounded-2xl border-dashed">
            <span className="text-4xl mb-3">🛠️</span>
            <h3 className="font-bold text-foreground">No Floor Plan Available</h3>
            <p className="text-muted-foreground text-sm max-w-sm text-center mt-1">This restaurant hasn&apos;t set up their floor plan yet.</p>
          </div>
        ) : (
          <>
            {floors.length > 0 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                {floors.map(f => (
                  <button
                    key={f._id}
                    onClick={() => { setActiveFloorId(f._id); setSelectedTableId(null); setShowBookingModal(false) }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                      activeFloorId === f._id 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white border border-border/60 text-muted-foreground hover:bg-gray-50'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {activeFloor && (
              <div className="relative h-[500px] w-full border border-border/60 rounded-2xl overflow-hidden shadow-inner bg-[#EAEAEA]">
                <FloorPlanCanvas
                  floor={activeFloor}
                  tables={processedTables}
                  selectedElementIds={selectedTableId ? [selectedTableId] : []}
                  onSelectElement={handleTableClick}
                  onUpdateTable={() => {}}
                  onUpdateArea={() => {}}
                  scale={0.8}
                  readOnly={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div>
                <h3 className="text-xl font-bold text-foreground">Table {selectedTable.tableNumber}</h3>
                <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{modalError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground"/> Arrival Time</label>
                  <input 
                    type="time" 
                    required
                    value={selectedTime || ""}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border/60 bg-[#FAFAFA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground"/> Departure Time</label>
                  <input 
                    type="time" 
                    required
                    value={selectedEndTime || ""}
                    onChange={(e) => setSelectedEndTime && setSelectedEndTime(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border/60 bg-[#FAFAFA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Users className="h-4 w-4 text-muted-foreground"/> Party Size</label>
                <div className="flex items-center gap-3 bg-[#FAFAFA] p-1.5 rounded-xl border border-border/60 w-fit">
                  <button 
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="h-9 w-9 rounded-lg bg-white border border-border hover:bg-gray-50 flex items-center justify-center font-bold text-foreground shadow-sm"
                  >-</button>
                  <span className="w-8 text-center text-lg font-bold text-foreground">{partySize}</span>
                  <button 
                    type="button"
                    onClick={() => setPartySize(partySize + 1)}
                    className="h-9 w-9 rounded-lg bg-white border border-border hover:bg-gray-50 flex items-center justify-center font-bold text-foreground shadow-sm"
                  >+</button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Table capacity: {selectedTable.capacity} guests</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Additional Notes</label>
                <textarea 
                  value={reservationNotes || ""}
                  onChange={(e) => setReservationNotes && setReservationNotes(e.target.value)}
                  placeholder="Any special requests or allergies?"
                  className="w-full h-24 p-3 rounded-xl border border-border/60 bg-[#FAFAFA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#E5555E] text-white rounded-xl font-bold hover:bg-[#D4444D] transition-all active:scale-[0.98] shadow-sm flex justify-center items-center gap-2"
                >
                  <CalendarIcon className="h-5 w-5" /> Request Reservation
                </button>
                <p className="text-xs text-center text-muted-foreground mt-3">Your request will be sent to the restaurant for approval.</p>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
