"use client"

import { useState, useRef, useEffect } from "react"
import { Users } from "lucide-react"

interface Point { x: number; y: number }

interface FloorPlanCanvasProps {
  floor: any
  tables: any[]
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onUpdateTable: (id: string, updates: any) => void
  onUpdateArea: (id: string, updates: any) => void
  onCanvasClick?: (p: Point) => void
  scale: number
  readOnly?: boolean
  mode?: "select" | "draw_room" | "place_table"
  drawingPoints?: Point[]
}

const statusColors = {
  available: { stroke: "#10b981", fill: "#d1fae5", text: "#047857" },
  reserved: { stroke: "#f59e0b", fill: "#fef3c7", text: "#b45309" },
  occupied: { stroke: "#3b82f6", fill: "#dbeafe", text: "#1d4ed8" },
  cleaning: { stroke: "#a855f7", fill: "#f3e8ff", text: "#7e22ce" },
  out_of_service: { stroke: "#9ca3af", fill: "#f3f4f6", text: "#4b5563" },
  blocked: { stroke: "#ef4444", fill: "#fee2e2", text: "#b91c1c" },
}

export function FloorPlanCanvas({
  floor,
  tables,
  selectedElementId,
  onSelectElement,
  onUpdateTable,
  onUpdateArea,
  onCanvasClick,
  scale,
  readOnly = false,
  mode = "select",
  drawingPoints = []
}: FloorPlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Dragging State
  const [dragTarget, setDragTarget] = useState<{ id: string, type: 'table' | 'area' | 'vertex', index?: number } | null>(null)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<Point>({ x: 0, y: 0 })

  const width = floor?.dimensions?.width || 2000
  const height = floor?.dimensions?.height || 2000

  // Coordinate Conversion
  const getMousePos = (e: React.PointerEvent | PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const CTM = svgRef.current.getScreenCTM()
    if (!CTM) return { x: 0, y: 0 }
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    }
  }

  // Snap to grid (20px)
  const snap = (val: number) => Math.round(val / 20) * 20

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.altKey) {
      // Middle click or Alt+click to pan
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      svgRef.current?.setPointerCapture(e.pointerId)
      return
    }

    if (mode === "draw_room") {
      const pos = getMousePos(e)
      onCanvasClick?.({ x: snap(pos.x), y: snap(pos.y) })
      return
    }
    
    // If clicked on empty space in select mode
    if (e.target === svgRef.current) {
      onSelectElement(null)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      })
      return
    }

    if (!dragTarget || readOnly) return

    const pos = getMousePos(e)
    const snappedX = snap(pos.x - dragOffset.x)
    const snappedY = snap(pos.y - dragOffset.y)

    if (dragTarget.type === 'table') {
      onUpdateTable(dragTarget.id, { position: { x: snappedX, y: snappedY } })
    } else if (dragTarget.type === 'area') {
      const area = floor.areas.find((a: any) => a.id === dragTarget.id)
      if (area) {
        // Find bounding box to drag all points
        if (area.points && area.points.length > 0) {
          const minX = Math.min(...area.points.map((p: any) => p.x))
          const minY = Math.min(...area.points.map((p: any) => p.y))
          const dx = snappedX - minX
          const dy = snappedY - minY
          const newPoints = area.points.map((p: any) => ({ x: p.x + dx, y: p.y + dy }))
          onUpdateArea(dragTarget.id, { points: newPoints, x: snappedX, y: snappedY })
        } else {
           onUpdateArea(dragTarget.id, { x: snappedX, y: snappedY })
        }
      }
    } else if (dragTarget.type === 'vertex') {
      const area = floor.areas.find((a: any) => a.id === dragTarget.id)
      if (area && dragTarget.index !== undefined && area.points) {
        const newPoints = [...area.points]
        // Center of the handle is exactly the snapped position
        newPoints[dragTarget.index] = { x: snap(pos.x), y: snap(pos.y) }
        onUpdateArea(dragTarget.id, { points: newPoints })
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false)
    setDragTarget(null)
    svgRef.current?.releasePointerCapture(e.pointerId)
  }

  const startDrag = (e: React.PointerEvent, id: string, type: 'table' | 'area', elementPos: Point) => {
    e.stopPropagation()
    if (readOnly) {
      onSelectElement(id)
      return
    }
    if (mode !== "select") return
    onSelectElement(id)
    const pos = getMousePos(e)
    setDragTarget({ id, type })
    setDragOffset({ x: pos.x - elementPos.x, y: pos.y - elementPos.y })
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const startVertexDrag = (e: React.PointerEvent, id: string, index: number) => {
    if (readOnly || mode !== "select") return
    e.stopPropagation()
    onSelectElement(id)
    setDragTarget({ id, type: 'vertex', index })
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  // Draw Chairs function
  const renderChairs = (table: any) => {
    const chairs = []
    const count = table.capacity
    if (!count || count < 1) return null

    const w = table.size?.width || 80
    const h = table.size?.height || 80
    const chairSize = 14
    const offset = 10 // distance from table edge

    if (table.shape === 'round') {
      const radius = w / 2 + offset
      const cx = w / 2
      const cy = h / 2
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count
        const cx_chair = cx + radius * Math.cos(angle)
        const cy_chair = cy + radius * Math.sin(angle)
        chairs.push(<circle key={i} cx={cx_chair} cy={cy_chair} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
      }
    } else {
       // Simple rectangular distribution for square/rect
       // Top, Bottom, Left, Right
       const perSide = Math.ceil(count / 4)
       // top
       for(let i=0; i<perSide && chairs.length < count; i++) {
         chairs.push(<circle key={`t${i}`} cx={(w/(perSide+1))*(i+1)} cy={-offset} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
       // bottom
       for(let i=0; i<perSide && chairs.length < count; i++) {
         chairs.push(<circle key={`b${i}`} cx={(w/(perSide+1))*(i+1)} cy={h+offset} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
       // left
       for(let i=0; i<perSide && chairs.length < count; i++) {
         chairs.push(<circle key={`l${i}`} cx={-offset} cy={(h/(perSide+1))*(i+1)} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
       // right
       for(let i=0; i<perSide && chairs.length < count; i++) {
         chairs.push(<circle key={`r${i}`} cx={w+offset} cy={(h/(perSide+1))*(i+1)} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
    }
    return chairs
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#EAEAEA] relative select-none">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={isPanning ? "cursor-grabbing" : (mode === "draw_room" || mode === "draw_event") ? "cursor-crosshair" : "cursor-default"}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Scaled and Panned Container */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          
          {/* Canvas Background / Grid */}
          <rect width={width} height={height} fill="white" />
          {!readOnly && <rect width={width} height={height} fill="url(#grid)" />}

          {/* Render Areas */}
          {floor?.areas?.map((area: any) => {
            const isSelected = selectedElementId === area.id
            const points = area.points && area.points.length > 0 
              ? area.points 
              : [{x: area.x||0, y: area.y||0}, {x: (area.x||0)+(area.width||100), y: area.y||0}, {x: (area.x||0)+(area.width||100), y: (area.y||0)+(area.height||100)}, {x: area.x||0, y: (area.y||0)+(area.height||100)}]
            
            const pointsStr = points.map((p: any) => `${p.x},${p.y}`).join(" ")
            
            return (
              <g key={area.id}>
                <polygon
                  points={pointsStr}
                  fill={area.color || "rgba(200, 200, 200, 0.2)"}
                  stroke={isSelected ? "#3b82f6" : "#9ca3af"}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={area.type === "event" ? "none" : "5,5"}
                  className={readOnly ? "" : "cursor-move hover:stroke-gray-500"}
                  onPointerDown={(e) => startDrag(e, area.id, 'area', points[0])}
                />
                
                {/* Area Label */}
                <text 
                  x={points[0].x + 10} 
                  y={points[0].y + 20} 
                  fontSize="14" 
                  fontWeight="bold" 
                  fill="#4b5563"
                  className="pointer-events-none"
                >
                  {area.name}
                </text>

                {/* Vertex Editing Handles */}
                {isSelected && !readOnly && points.map((p: Point, i: number) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    className="cursor-pointer hover:fill-blue-100"
                    onPointerDown={(e) => startVertexDrag(e, area.id, i)}
                  />
                ))}
              </g>
            )
          })}

          {/* Render Active Drawing Polygon */}
          {mode === "draw_room" && drawingPoints.length > 0 && (
            <g>
              <polyline
                points={drawingPoints.map(p => `${p.x},${p.y}`).join(" ")}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
              {drawingPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
              ))}
            </g>
          )}

          {/* Render Tables */}
          {tables.map((table: any) => {
            const isSelected = selectedElementId === (table._id || table.id)
            const pos = table.position || { x: 0, y: 0 }
            const w = table.size?.width || 80
            const h = table.size?.height || 80
            const rot = table.rotation || 0
            const colors = statusColors[table.status as keyof typeof statusColors] || statusColors.available

            return (
              <g
                key={table._id || table.id}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${rot}, ${w/2}, ${h/2})`}
                onPointerDown={(e) => startDrag(e, table._id || table.id, 'table', pos)}
                className={readOnly ? "cursor-pointer" : isSelected ? "cursor-grabbing" : "cursor-grab"}
              >
                {/* Render Chairs */}
                {renderChairs(table)}

                {/* Render Table Shape */}
                {table.shape === 'round' ? (
                  <circle cx={w/2} cy={h/2} r={w/2} fill={colors.fill} stroke={isSelected ? "#3b82f6" : colors.stroke} strokeWidth={isSelected ? 3 : 2} />
                ) : table.shape === 'oval' ? (
                  <ellipse cx={w/2} cy={h/2} rx={w/2} ry={h/2} fill={colors.fill} stroke={isSelected ? "#3b82f6" : colors.stroke} strokeWidth={isSelected ? 3 : 2} />
                ) : table.shape === 'banquet' ? (
                  <rect x={0} y={0} width={w} height={h} rx={h/2} fill={colors.fill} stroke={isSelected ? "#3b82f6" : colors.stroke} strokeWidth={isSelected ? 3 : 2} />
                ) : (
                  // Square, Rectangular, Custom fallback
                  <rect x={0} y={0} width={w} height={h} rx={8} fill={colors.fill} stroke={isSelected ? "#3b82f6" : colors.stroke} strokeWidth={isSelected ? 3 : 2} />
                )}

                {/* Table Number */}
                <text x={w/2} y={h/2} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize="14" fontWeight="bold" className="pointer-events-none">
                  {table.tableNumber}
                </text>
                
                {/* VIP Badge */}
                {table.isVip && (
                  <g transform={`translate(${w - 15}, -15)`}>
                    <rect width="30" height="16" rx="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                    <text x="15" y="11" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f" className="pointer-events-none">VIP</text>
                  </g>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
