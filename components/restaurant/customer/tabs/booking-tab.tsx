"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Calendar } from "@/components/ui/calendar"
import { FloorPlanCanvas } from "@/components/restaurant/floor-plan-canvas"
import { format } from "date-fns"
import { X, Clock, Users, Calendar as CalendarIcon, Info, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

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
  const [manualZoom, setManualZoom] = useState<number | null>(null)
  const [manualPan, setManualPan] = useState<{ x: number; y: number } | null>(null)
  
  // Responsive Canvas Container Measurement using Callback Ref
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const canvasContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
      resizeObserverRef.current = null
    }

    if (node) {
      const update = () => {
        const rect = node.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          setContainerDimensions({ width: rect.width, height: rect.height })
        }
      }

      update()
      const observer = new ResizeObserver(update)
      observer.observe(node)
      resizeObserverRef.current = observer
    }
  }, [])
  
  // Modal State
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [modalError, setModalError] = useState("")

  const uniqueFloors = useMemo(() => {
    const map = new Map()
    floors.forEach(f => {
      if (f && f.name) {
        const key = f.name.trim().toLowerCase()
        if (!map.has(key)) map.set(key, f)
      } else if (f && (f._id || f.id)) {
        map.set(f._id || f.id, f)
      }
    })
    return Array.from(map.values()) as any[]
  }, [floors])

  useEffect(() => {
    if (uniqueFloors.length > 0) {
      const currentFloorExists = uniqueFloors.some(f => (f._id || f.id) === activeFloorId)
      if (!activeFloorId || !currentFloorExists) {
        setActiveFloorId(uniqueFloors[0]._id || uniqueFloors[0].id)
      }
    } else {
      setActiveFloorId(null)
    }
  }, [uniqueFloors, activeFloorId])

  const activeFloor = useMemo(() => {
    return uniqueFloors.find(f => (f._id || f.id) === activeFloorId) || uniqueFloors[0]
  }, [uniqueFloors, activeFloorId])

  const activeFloorIdResolved = activeFloor?._id || activeFloor?.id

  const processedTables = useMemo(() => {
    if (!activeFloorIdResolved) return []
    return tables.filter(t => t.floorId === activeFloorIdResolved).map(table => {
      return { ...table, status: "available" }
    })
  }, [tables, activeFloorIdResolved])

  const floorElements: any[] = useMemo(() => {
    if (!activeFloor) return []
    return activeFloor.elements || []
  }, [activeFloor])

  const autoFitTransform = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    // 1. Processed Tables
    processedTables.forEach(tItem => {
      const x = tItem.position?.x ?? tItem.x
      const y = tItem.position?.y ?? tItem.y
      const w = tItem.dimensions?.width ?? tItem.width ?? 120
      const h = tItem.dimensions?.height ?? tItem.height ?? 120
      if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + w)
        maxY = Math.max(maxY, y + h)
      }
    })

    // 2. Floor Elements
    floorElements.forEach((eItem: any) => {
      const x = eItem.position?.x ?? eItem.x
      const y = eItem.position?.y ?? eItem.y
      const w = eItem.width ?? 100
      const h = eItem.height ?? 100
      if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + w)
        maxY = Math.max(maxY, y + h)
      }
    })

    // 3. Floor Areas (Room polygons & walls)
    const floorAreas: any[] = activeFloor?.areas || []
    floorAreas.forEach((area: any) => {
      if (area.points && Array.isArray(area.points) && area.points.length > 0) {
        area.points.forEach((p: any) => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y)) {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
          }
        })
      } else {
        const ax = area.position?.x ?? area.x
        const ay = area.position?.y ?? area.y
        const aw = area.width ?? 100
        const ah = area.height ?? 100
        if (typeof ax === 'number' && typeof ay === 'number' && !isNaN(ax) && !isNaN(ay)) {
          minX = Math.min(minX, ax)
          minY = Math.min(minY, ay)
          maxX = Math.max(maxX, ax + aw)
          maxY = Math.max(maxY, ay + ah)
        }
      }
    })

    // 4. Floor Walls (Lines)
    const floorWalls: any[] = activeFloor?.walls || []
    floorWalls.forEach((wall: any) => {
      if (wall.points && Array.isArray(wall.points)) {
        wall.points.forEach((p: any) => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y)) {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
          }
        })
      }
    })

    if (minX === Infinity || isNaN(minX) || maxX === -Infinity || isNaN(maxX)) {
      return { scale: 0.8, pan: { x: 40, y: 40 } }
    }

    const screenFallbackW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 360
    const screenFallbackH = typeof window !== 'undefined' ? (window.innerWidth < 640 ? 380 : 500) : 400

    const containerW = containerDimensions.width > 0 ? containerDimensions.width : screenFallbackW
    const containerH = containerDimensions.height > 0 ? containerDimensions.height : screenFallbackH

    // Small outer margin to ensure the full room boundary & walls fit inside
    const padding = containerW < 500 ? 16 : 30

    const boundingW = Math.max(maxX - minX, 100)
    const boundingH = Math.max(maxY - minY, 100)

    const scaleX = (containerW - padding * 2) / boundingW
    const scaleY = (containerH - padding * 2) / boundingH
    // Allow scaling down to 0.05 so even large room plans fit completely without cropping
    const calcScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.05), 1.25)

    const calcPanX = (containerW - (maxX + minX) * calcScale) / 2
    const calcPanY = (containerH - (maxY + minY) * calcScale) / 2

    return { scale: calcScale, pan: { x: calcPanX, y: calcPanY } }
  }, [processedTables, floorElements, activeFloor, containerDimensions])

  const activeScale = manualZoom ?? autoFitTransform.scale
  const activePan = manualPan ?? autoFitTransform.pan

  const selectedTable = processedTables.find(t => t._id === selectedTableId || t.id === selectedTableId)

  const addHoursToTime = (timeStr: string, hoursToAdd: number = 2) => {
    if (!timeStr) return ""
    const parts = timeStr.split(':')
    if (parts.length < 2) return ""
    let h = parseInt(parts[0], 10)
    let m = parseInt(parts[1], 10)
    if (isNaN(h) || isNaN(m)) return ""

    let totalMins = h * 60 + m + Math.round(hoursToAdd * 60)
    totalMins = (totalMins + 1440) % 1440
    const newH = String(Math.floor(totalMins / 60)).padStart(2, '0')
    const newM = String(totalMins % 60).padStart(2, '0')
    return `${newH}:${newM}`
  }

  const parseMinutes = (tStr: string) => {
    if (!tStr) return 0
    const parts = tStr.split(':')
    if (parts.length < 2) return 0
    const h = parseInt(parts[0], 10) || 0
    const m = parseInt(parts[1], 10) || 0
    return h * 60 + m
  }

  const tableReservations = useMemo(() => {
    if (!selectedTableId) return []
    return reservations.filter(r => {
      const tId = r.tableId?._id || r.tableId || r.table
      return tId === selectedTableId && r.status !== 'cancelled' && r.status !== 'rejected'
    })
  }, [reservations, selectedTableId])

  const availableTimeSlots = useMemo(() => {
    const slots: { time: string; label: string; isBooked: boolean; conflictInfo?: string }[] = []
    for (let hour = 10; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        const timeMin = hour * 60 + min

        const conflict = tableReservations.find(r => {
          let rStart = parseMinutes(r.startTime)
          let rEnd = parseMinutes(r.endTime)
          if (rEnd <= rStart) rEnd += 1440
          return timeMin >= rStart && timeMin < rEnd
        })

        const h12 = hour % 12 === 0 ? 12 : hour % 12
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const label = `${h12}:${min.toString().padStart(2, '0')} ${ampm}`

        slots.push({
          time: timeStr,
          label,
          isBooked: !!conflict,
          conflictInfo: conflict ? `${conflict.startTime} - ${conflict.endTime}` : undefined
        })
      }
    }
    return slots
  }, [tableReservations])

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

    // Default arrival time if empty
    const defaultArr = selectedTime || "19:00"
    if (!selectedTime) {
      setSelectedTime(defaultArr)
    }
    if (setSelectedEndTime && (!selectedEndTime || selectedEndTime <= defaultArr)) {
      setSelectedEndTime(addHoursToTime(defaultArr, 2))
    }
  }

  const handleArrivalChange = (newArr: string) => {
    setSelectedTime(newArr)
    if (setSelectedEndTime) {
      setSelectedEndTime(addHoursToTime(newArr, 2))
    }
    setModalError("")
  }

  const handleDurationClick = (durHours: number) => {
    if (selectedTime && setSelectedEndTime) {
      setSelectedEndTime(addHoursToTime(selectedTime, durHours))
    }
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

    let startMin = parseMinutes(selectedTime)
    let endMin = parseMinutes(selectedEndTime || "")

    // Midnight rollover (e.g. 23:00 to 01:00)
    if (endMin <= startMin) {
      endMin += 1440
    }

    if (endMin <= startMin) {
      setModalError("Departure time must be after arrival time.")
      return
    }

    const hasConflict = reservations.some(r => {
      if (r.tableId?._id !== selectedTableId && r.tableId !== selectedTableId) return false
      if (r.status === 'cancelled' || r.status === 'rejected') return false
      
      let rStart = parseMinutes(r.startTime)
      let rEnd = parseMinutes(r.endTime)
      if (rEnd <= rStart) rEnd += 1440

      return (rStart < endMin && startMin < rEnd)
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
            {uniqueFloors.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                {uniqueFloors.map((f: any) => {
                  const fId = f._id || f.id
                  return (
                    <button
                      key={fId}
                      onClick={() => {
                        setActiveFloorId(fId)
                        setSelectedTableId(null)
                        setShowBookingModal(false)
                        setManualZoom(null)
                        setManualPan(null)
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        activeFloorIdResolved === fId 
                          ? 'bg-[#E5555E] text-white shadow-md' 
                          : 'bg-white border border-border/60 text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      {f.name}
                    </button>
                  )
                })}
              </div>
            )}

            {activeFloor && (
              <div ref={canvasContainerRef} className="relative h-[400px] sm:h-[520px] w-full border border-border/60 rounded-3xl overflow-hidden shadow-inner bg-[#FAF9F6] group">
                {/* Floating Canvas Controls */}
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
                  floor={activeFloor}
                  tables={processedTables}
                  elements={floorElements}
                  selectedElementIds={selectedTableId ? [selectedTableId] : []}
                  onSelectElement={handleTableClick}
                  onUpdateTable={() => {}}
                  onUpdateArea={() => {}}
                  scale={activeScale}
                  pan={activePan}
                  readOnly={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border/40">
            
            {/* Elegant Light Header */}
            <div className="relative bg-gradient-to-r from-rose-50/90 via-white to-red-50/60 text-gray-900 p-3.5 px-4 sm:p-4 sm:px-5 border-b border-rose-100/80">
              <button 
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="absolute top-3.5 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
                <span className="bg-[#E5555E] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Table {selectedTable.tableNumber}
                </span>
                <span className="bg-rose-100/80 border border-rose-200/60 text-[#E5555E] text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Up to {selectedTable.capacity} guests
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">Reserve Table {selectedTable.tableNumber}</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-[#E5555E]" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleModalSubmit} className="p-3.5 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto max-h-[82vh] bg-[#FAFAFA]">
              {modalError && (
                <div className="p-3 bg-red-50/90 border border-red-200/90 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2 shadow-sm animate-in fade-in">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                  <p className="leading-relaxed">{modalError}</p>
                </div>
              )}

              {/* Available Hours Section */}
              <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-border/60 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-[11px] sm:text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5 text-[#E5555E]" /> Available Hours Today
                  </label>
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-300" /> Booked
                    </span>
                  </div>
                </div>

                {/* Time Slot Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-0.5 custom-scrollbar">
                  {availableTimeSlots.map(slot => {
                    const isSelected = selectedTime === slot.time
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => handleArrivalChange(slot.time)}
                        className={`py-1.5 px-1.5 sm:px-2 rounded-xl text-xs font-bold transition-all border text-center flex flex-col items-center justify-center ${
                          slot.isBooked
                            ? "bg-gray-100/80 border-gray-200 text-gray-400 cursor-not-allowed line-through"
                            : isSelected
                            ? "bg-[#E5555E] border-[#E5555E] text-white shadow-md scale-[1.02]"
                            : "bg-[#FAFAFA] border-border/60 text-gray-800 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 shadow-2xs"
                        }`}
                      >
                        <span className="text-[11px] leading-tight font-extrabold">{slot.label}</span>
                        {slot.isBooked ? (
                          <span className="text-[8.5px] font-semibold no-underline text-gray-400">Booked</span>
                        ) : (
                          <span className={`text-[8.5px] font-semibold ${isSelected ? "text-white/90" : "text-emerald-600"}`}>
                            {isSelected ? "Selected" : "Free"}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Existing Bookings Banner if table has bookings on this date */}
                {tableReservations.length > 0 && (
                  <div className="pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-amber-800 bg-amber-50/90 p-2 sm:p-2.5 rounded-xl border border-amber-200/90 flex items-center gap-1.5">
                    <span className="shrink-0 font-extrabold">ℹ️ Booked:</span>
                    <div className="flex flex-wrap gap-1">
                      {tableReservations.map((r, i) => (
                        <span key={i} className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md font-extrabold text-[9.5px]">
                          {r.startTime} - {r.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Selection with Auto-Adjust & Duration Pills */}
              <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-border/60 shadow-2xs space-y-2.5">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-gray-700 flex items-center gap-1 uppercase tracking-wider">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#E5555E]" /> Arrival Time
                    </label>
                    <input 
                      type="time" 
                      required
                      value={selectedTime || ""}
                      onChange={(e) => handleArrivalChange(e.target.value)}
                      className="w-full h-10 px-2 sm:px-3 rounded-xl border border-border/60 bg-[#FAFAFA] text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] shadow-2xs transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-gray-700 flex items-center gap-1 uppercase tracking-wider">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#E5555E]" /> Departure Time
                    </label>
                    <input 
                      type="time" 
                      required
                      value={selectedEndTime || ""}
                      onChange={(e) => setSelectedEndTime && setSelectedEndTime(e.target.value)}
                      className="w-full h-10 px-2 sm:px-3 rounded-xl border border-border/60 bg-[#FAFAFA] text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] shadow-2xs transition-all"
                    />
                  </div>
                </div>

                {/* Duration Presets */}
                <div className="pt-2 flex items-center gap-1.5 border-t border-border/40">
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Duration:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                    {[1.5, 2, 2.5, 3].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleDurationClick(dur)}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-gray-100 text-gray-700 hover:bg-[#E5555E] hover:text-white transition-all shadow-2xs"
                      >
                        {dur}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Party Size Selector */}
              <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-border/60 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-[11px] sm:text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5 text-[#E5555E]" /> Party Size
                  </label>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                    Capacity: <strong className="text-gray-900">{selectedTable.capacity} guests</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-[#FAFAFA] p-1 rounded-xl border border-border/60">
                    <button 
                      type="button"
                      onClick={() => setPartySize(Math.max(1, partySize - 1))}
                      className="h-8 w-8 rounded-lg bg-white border border-border hover:bg-gray-100 flex items-center justify-center font-bold text-foreground shadow-2xs transition-colors"
                    >-</button>
                    <span className="w-8 text-center text-base font-black text-foreground">{partySize}</span>
                    <button 
                      type="button"
                      onClick={() => setPartySize(partySize + 1)}
                      className="h-8 w-8 rounded-lg bg-white border border-border hover:bg-gray-100 flex items-center justify-center font-bold text-foreground shadow-2xs transition-colors"
                    >+</button>
                  </div>

                  <div className="text-xs font-semibold">
                    {partySize > selectedTable.capacity ? (
                      <span className="inline-flex items-center text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-200 text-[10px] sm:text-[11px] whitespace-nowrap">
                        ⚠️ Exceeds capacity
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200 text-[10px] sm:text-[11px] whitespace-nowrap">
                        ✓ Fits table
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">Additional Notes</label>
                <textarea 
                  value={reservationNotes || ""}
                  onChange={(e) => setReservationNotes && setReservationNotes(e.target.value)}
                  placeholder="Any special requests, seating preferences, or allergies?"
                  className="w-full h-16 sm:h-20 p-2.5 sm:p-3 rounded-2xl border border-border/60 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] resize-none shadow-2xs"
                />
              </div>

              {/* Submit Section */}
              <div className="pt-1 space-y-1.5">
                <button 
                  type="submit"
                  className="w-full py-3 sm:py-3.5 bg-[#E5555E] text-white rounded-2xl font-extrabold text-sm sm:text-base hover:bg-[#D4444D] transition-all active:scale-[0.98] shadow-md flex justify-center items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Request Reservation
                </button>
                <p className="text-[10px] sm:text-[11px] text-center text-muted-foreground font-medium">
                  Your request will be sent to the restaurant for instant approval.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
