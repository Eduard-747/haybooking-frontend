"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { DateTimePicker } from "@/components/booking/date-time-picker"
import { FloorPlanCanvas } from "@/components/restaurant/floor-plan-canvas"

interface BookingTabProps {
  branches: any[]
  selectedBranch: string | null
  onBranchSelect: (id: string) => void
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  selectedTime: string | null
  setSelectedTime: (t: string | null) => void
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

  // Smart Filtering
  const getProcessedTables = () => {
    if (!activeFloorId) return []
    
    return tables
      .filter(t => t.floorId === activeFloorId)
      .map(table => {
        let status = table.status || "available"

        // 1. Check Capacity Restriction
        if (partySize > table.capacity) {
          status = "blocked" // Gray out / unselectable
        }

        // 2. Check Reservation Conflicts
        if (selectedTime) {
           const hasConflict = reservations.some(r => {
             if (r.tableId?._id !== table._id && r.tableId !== table._id) return false
             
             // Time overlap logic
             const rStart = r.startTime
             const rEnd = r.endTime
             const reqStart = selectedTime
             
             // Calculate 90 min duration for reqEnd
             const [hh, mm] = selectedTime.split(':')
             const reqEndObj = new Date()
             reqEndObj.setHours(parseInt(hh, 10), parseInt(mm, 10) + 90)
             const reqEnd = `${reqEndObj.getHours().toString().padStart(2, '0')}:${reqEndObj.getMinutes().toString().padStart(2, '0')}`
             
             return (rStart < reqEnd && reqStart < rEnd)
           })
           if (hasConflict) {
             status = "occupied"
           }
        }

        return { ...table, status }
      })
  }

  const processedTables = getProcessedTables()
  const selectedTable = processedTables.find(t => t._id === selectedTableId || t.id === selectedTableId)

  const handleTableClick = (id: string | null) => {
    if (!id) {
      setSelectedTableId(null)
      return
    }
    const table = processedTables.find(t => t._id === id || t.id === id)
    if (table && table.status === 'blocked') {
      // Too small, cannot select
      return
    }
    if (table && table.status === 'occupied') {
       // Already booked
       return
    }
    setSelectedTableId(id)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-32">
      
      <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex flex-wrap items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Party Size</span>
            <div className="flex items-center gap-3 bg-[#FAFAFA] p-1.5 rounded-xl border border-border/60">
              <button 
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="h-8 w-8 rounded-lg bg-white border border-border hover:bg-gray-50 flex items-center justify-center font-bold text-foreground transition-colors shadow-sm"
              >-</button>
              <span className="w-8 text-center text-lg font-bold text-foreground">{partySize}</span>
              <button 
                onClick={() => setPartySize(partySize + 1)}
                className="h-8 w-8 rounded-lg bg-white border border-border hover:bg-gray-50 flex items-center justify-center font-bold text-foreground transition-colors shadow-sm"
              >+</button>
            </div>
          </div>
        </div>

        <div className="w-full md:flex-1 min-w-0 md:min-w-[280px]">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Date & Time</span>
          <DateTimePicker
            selectedDate={selectedDate}
            onDateChange={(d) => d && setSelectedDate(d)}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            bookedSlots={bookedSlots}
            workingHours={branches.find(b => b._id === selectedBranch)?.workingHours || []}
            breaks={branches.find(b => b._id === selectedBranch)?.breaks || []}
            totalDuration={90}
          />
        </div>
      </div>

      {selectedTime ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground">Select a Table</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-border/60 shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]" /> Available</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> Reserved</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /> Too Small</div>
            </div>
          </div>
          
          {floors.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center bg-gray-50 border border-border/60 rounded-2xl border-dashed">
              <span className="text-4xl mb-3">🛠️</span>
              <h3 className="font-bold text-foreground">No Floor Plan Available</h3>
              <p className="text-muted-foreground text-sm max-w-sm text-center mt-1">This restaurant hasn't set up their floor plan yet.</p>
            </div>
          ) : (
            <>
              {floors.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                  {floors.map(f => (
                    <button
                      key={f._id}
                      onClick={() => { setActiveFloorId(f._id); setSelectedTableId(null) }}
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
                    selectedElementId={selectedTableId}
                    onSelectElement={handleTableClick}
                    onUpdateTable={() => {}}
                    onUpdateArea={() => {}}
                    scale={0.8}
                    readOnly={true}
                  />

                  {selectedTable && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-border p-4 w-80 flex flex-col gap-3 animate-in slide-in-from-bottom-4">
                       <div className="flex justify-between items-start">
                         <div>
                           <h3 className="font-bold text-lg">Table {selectedTable.tableNumber}</h3>
                           <p className="text-sm text-muted-foreground">{activeFloor.name}</p>
                         </div>
                         <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">Available</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs font-semibold">Capacity</span>
                            <span className="font-bold">{selectedTable.capacity} Guests</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs font-semibold">Location</span>
                            <span className="font-bold capitalize">{selectedTable.location || "Indoor"}</span>
                          </div>
                       </div>
                       <button 
                         onClick={() => onBookTable(selectedTable._id || selectedTable.id)}
                         className="w-full py-2.5 bg-[#E5555E] text-white rounded-lg font-bold text-sm hover:bg-[#d44850] transition-colors"
                       >
                         Confirm Reservation
                       </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center bg-gray-50 border border-border/60 rounded-2xl border-dashed">
          <span className="text-4xl mb-3">🕒</span>
          <h3 className="font-bold text-foreground">Select a Time First</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center mt-1">Please select your preferred date and time above to view real-time table availability.</p>
        </div>
      )}

    </div>
  )
}
