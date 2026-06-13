"use client"

import { useState, useRef, useEffect } from "react"
import { Users } from "lucide-react"

interface Point { x: number; y: number }

interface FloorPlanCanvasProps {
  floor: any
  tables: any[]
  elements?: any[]
  selectedElementIds: string[]
  onSelectElement: (id: string | null | string[], shiftKey?: boolean) => void
  onUpdateTable: (id: string, updates: any) => void
  onUpdateArea: (id: string, updates: any) => void
  onUpdateElement?: (id: string, updates: any) => void
  onCanvasClick?: (p: Point) => void
  onDragEnd?: () => void
  scale?: number
  pan?: Point
  onPanChange?: (pan: Point) => void
  readOnly?: boolean
  mode?: "select" | "draw_room" | "draw_event" | "pan"
  drawingPoints?: Point[]
  onDropItem?: (payload: any, pos: Point) => void
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
  elements = [],
  selectedElementIds = [],
  onSelectElement = () => {},
  onUpdateTable = () => {},
  onUpdateArea = () => {},
  onUpdateElement,
  onCanvasClick,
  onDragEnd,
  scale = 1,
  pan = { x: 0, y: 0 },
  onPanChange,
  readOnly = false,
  mode = "select",
  drawingPoints = [],
  onDropItem
}: FloorPlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Dragging State
  const [interactionState, setInteractionState] = useState<{
    id: string,
    type: 'table' | 'area' | 'element',
    action: 'move' | 'resize' | 'rotate' | 'vertex',
    startPos: Point,
    originalSize?: {w: number, h: number},
    originalAngle?: number,
    centerPos?: Point,
    index?: number
  } | null>(null)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<Point>({ x: 0, y: 0 })
  
  // Lasso Selection State
  const [lassoStart, setLassoStart] = useState<Point | null>(null)
  const [lassoEnd, setLassoEnd] = useState<Point | null>(null)

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

  // Get position relative to the scaled/panned workspace
  const getWorkspacePos = (e: React.PointerEvent | PointerEvent) => {
    const pos = getMousePos(e)
    return {
      x: (pos.x - pan.x) / scale,
      y: (pos.y - pan.y) / scale
    }
  }

  // Snap to grid (20px)
  const snap = (val: number) => Math.round(val / 20) * 20

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.altKey || mode === "pan") {
      // Middle click or Alt+click or Pan mode to pan
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      svgRef.current?.setPointerCapture(e.pointerId)
      return
    }

    if (mode === "draw_room" || mode === "draw_event") {
      const pos = getWorkspacePos(e)
      onCanvasClick?.({ x: snap(pos.x), y: snap(pos.y) })
      return
    }
    
    // If clicked on empty space in select mode
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect' && (e.target as Element).getAttribute('fill') === 'url(#grid)') {
      onSelectElement(null)
      if (mode === "select" && !readOnly) {
        const pos = getWorkspacePos(e)
        setLassoStart(pos)
        setLassoEnd(pos)
        svgRef.current?.setPointerCapture(e.pointerId)
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      onPanChange({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      })
      return
    }

    if (lassoStart) {
      setLassoEnd(getWorkspacePos(e))
      return
    }

    if (!interactionState || readOnly) return

    const pos = getWorkspacePos(e)

    if (interactionState.action === 'move') {
      const snappedX = snap(pos.x - dragOffset.x)
      const snappedY = snap(pos.y - dragOffset.y)

      if (interactionState.type === 'table') {
        onUpdateTable(interactionState.id, { position: { x: snappedX, y: snappedY } })
      } else if (interactionState.type === 'area') {
        const area = floor.areas.find((a: any) => a.id === interactionState.id)
        if (area) {
          if (area.points && area.points.length > 0) {
            const minX = Math.min(...area.points.map((p: any) => p.x))
            const minY = Math.min(...area.points.map((p: any) => p.y))
            const dx = snappedX - minX
            const dy = snappedY - minY
            const newPoints = area.points.map((p: any) => ({ x: p.x + dx, y: p.y + dy }))
            onUpdateArea(interactionState.id, { points: newPoints, x: snappedX, y: snappedY })
          } else {
            onUpdateArea(interactionState.id, { x: snappedX, y: snappedY })
          }
        }
      } else if (interactionState.type === 'element' && onUpdateElement) {
        onUpdateElement(interactionState.id, { x: snappedX, y: snappedY })
      }
    } else if (interactionState.action === 'vertex') {
      const area = floor.areas.find((a: any) => a.id === interactionState.id)
      if (area && interactionState.index !== undefined && area.points) {
        const newPoints = [...area.points]
        newPoints[interactionState.index] = { x: snap(pos.x), y: snap(pos.y) }
        onUpdateArea(interactionState.id, { points: newPoints })
      }
    } else if (interactionState.action === 'resize' && interactionState.originalSize) {
      const dx = pos.x - interactionState.startPos.x
      const dy = pos.y - interactionState.startPos.y
      
      const angleRad = -(interactionState.originalAngle || 0) * Math.PI / 180
      const localDx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad)
      const localDy = dx * Math.sin(angleRad) + dy * Math.cos(angleRad)

      const newW = Math.max(20, Math.round((interactionState.originalSize.w + localDx) / 10) * 10)
      const newH = Math.max(20, Math.round((interactionState.originalSize.h + localDy) / 10) * 10)
      
      if (interactionState.type === 'table') {
        onUpdateTable(interactionState.id, { size: { width: newW, height: newH } })
      } else if (interactionState.type === 'element' && onUpdateElement) {
        onUpdateElement(interactionState.id, { width: newW, height: newH })
      }
    } else if (interactionState.action === 'rotate' && interactionState.centerPos) {
       const dy = pos.y - interactionState.centerPos.y
       const dx = pos.x - interactionState.centerPos.x
       let angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90
       if (angle < 0) angle += 360
       angle = Math.round(angle / 15) * 15 // snap to 15 degrees

       if (interactionState.type === 'table') {
         onUpdateTable(interactionState.id, { rotation: angle })
       } else if (interactionState.type === 'element' && onUpdateElement) {
         onUpdateElement(interactionState.id, { rotation: angle })
       }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false)
    if (interactionState) {
      onDragEnd?.()
    }
    
    if (lassoStart && lassoEnd) {
      const minX = Math.min(lassoStart.x, lassoEnd.x)
      const minY = Math.min(lassoStart.y, lassoEnd.y)
      const maxX = Math.max(lassoStart.x, lassoEnd.x)
      const maxY = Math.max(lassoStart.y, lassoEnd.y)

      const isInside = (x: number, y: number, w: number, h: number) => {
        return x < maxX && (x+w) > minX && y < maxY && (y+h) > minY
      }

      const selectedIds: string[] = []
      tables.forEach(t => {
        const w = t.size?.width || 80
        const h = t.size?.height || 80
        if (isInside(t.position.x, t.position.y, w, h)) {
          selectedIds.push(t._id || t.id)
        }
      })
      elements.forEach(el => {
        const w = el.width || 40
        const h = el.height || 40
        if (isInside(el.x, el.y, w, h)) {
          selectedIds.push(el.id)
        }
      })
      
      if (selectedIds.length > 0) {
        onSelectElement(selectedIds)
      }
      
      setLassoStart(null)
      setLassoEnd(null)
    }

    setInteractionState(null)
    svgRef.current?.releasePointerCapture(e.pointerId)
  }

  const startDrag = (e: React.PointerEvent, id: string, type: 'table' | 'area' | 'element', elementPos: Point) => {
    e.stopPropagation()
    if (readOnly) {
      onSelectElement(id, e.shiftKey)
      return
    }
    if (mode !== "select") return
    if (!selectedElementIds.includes(id)) {
      onSelectElement(id, e.shiftKey)
    }
    const pos = getWorkspacePos(e)
    setInteractionState({ id, type, action: 'move', startPos: pos })
    setDragOffset({ x: pos.x - elementPos.x, y: pos.y - elementPos.y })
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const startVertexDrag = (e: React.PointerEvent, id: string, index: number) => {
    if (readOnly || mode !== "select") return
    e.stopPropagation()
    onSelectElement(id)
    setInteractionState({ id, type: 'area', action: 'vertex', index, startPos: getWorkspacePos(e) })
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const startRotate = (e: React.PointerEvent, id: string, type: 'table' | 'element', centerPos: Point) => {
    if (readOnly || mode !== "select") return
    e.stopPropagation()
    setInteractionState({ id, type, action: 'rotate', startPos: getWorkspacePos(e), centerPos })
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const startResize = (e: React.PointerEvent, id: string, type: 'table' | 'element', originalSize: {w: number, h: number}, originalAngle: number) => {
    if (readOnly || mode !== "select") return
    e.stopPropagation()
    setInteractionState({ id, type, action: 'resize', startPos: getWorkspacePos(e), originalSize, originalAngle })
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

    if (table.shape === 'round' || table.shape === 'oval') {
      const rx = (w / 2) + offset
      const ry = (h / 2) + offset
      const cx = w / 2
      const cy = h / 2
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count - (Math.PI / 2)
        const cx_chair = cx + rx * Math.cos(angle)
        const cy_chair = cy + ry * Math.sin(angle)
        chairs.push(<circle key={i} cx={cx_chair} cy={cy_chair} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
      }
    } else if (table.shape === 'banquet') {
      // Perimeter math to wrap chairs perfectly around flat edges and rounded corners
      const R = Math.min(w, h) / 2
      const R_out = R + offset
      const L_straight_w = Math.max(0, w - 2*R)
      const L_straight_h = Math.max(0, h - 2*R)
      const L_arc = (Math.PI / 2) * R_out
      const P = 2 * L_straight_w + 2 * L_straight_h + 4 * L_arc
      
      for (let i = 0; i < count; i++) {
        let d = (i / count) * P
        let current = 0
        let pt = { x: w/2, y: -offset }

        // 1. Top-Right straight
        let len = L_straight_w / 2
        if (d <= current + len + 0.001) {
          pt = { x: w/2 + d - current, y: -offset }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 2. TR arc
        len = L_arc
        if (d <= current + len + 0.001) {
          let t = (d - current) / len
          let angle = -Math.PI/2 + t * (Math.PI/2)
          pt = { x: w - R + R_out * Math.cos(angle), y: R + R_out * Math.sin(angle) }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 3. Right straight
        len = L_straight_h
        if (d <= current + len + 0.001) {
          pt = { x: w + offset, y: R + d - current }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 4. BR arc
        len = L_arc
        if (d <= current + len + 0.001) {
          let t = (d - current) / len
          let angle = 0 + t * (Math.PI/2)
          pt = { x: w - R + R_out * Math.cos(angle), y: h - R + R_out * Math.sin(angle) }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 5. Bottom straight
        len = L_straight_w
        if (d <= current + len + 0.001) {
          pt = { x: w - R - (d - current), y: h + offset }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 6. BL arc
        len = L_arc
        if (d <= current + len + 0.001) {
          let t = (d - current) / len
          let angle = Math.PI/2 + t * (Math.PI/2)
          pt = { x: R + R_out * Math.cos(angle), y: h - R + R_out * Math.sin(angle) }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 7. Left straight
        len = L_straight_h
        if (d <= current + len + 0.001) {
          pt = { x: -offset, y: h - R - (d - current) }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 8. TL arc
        len = L_arc
        if (d <= current + len + 0.001) {
          let t = (d - current) / len
          let angle = Math.PI + t * (Math.PI/2)
          pt = { x: R + R_out * Math.cos(angle), y: R + R_out * Math.sin(angle) }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
        current += len

        // 9. Top-Left straight
        len = L_straight_w / 2
        if (d <= current + len + 0.001) {
          pt = { x: R + (d - current), y: -offset }
          chairs.push(<circle key={i} cx={pt.x} cy={pt.y} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
          continue
        }
      }
    } else {
       // Proportional rectangular distribution for square/rect
       let tb_total = Math.round(count * (w / (w + h)))
       
       // Keep symmetry for even counts
       if (count % 2 === 0 && tb_total % 2 !== 0) {
         if (tb_total < count) tb_total += 1
         else tb_total -= 1
       }
       
       let lr_total = count - tb_total

       let top = Math.ceil(tb_total / 2)
       let bottom = Math.floor(tb_total / 2)
       let left = Math.ceil(lr_total / 2)
       let right = Math.floor(lr_total / 2)

       // top
       for(let i=0; i<top; i++) {
         chairs.push(<circle key={`t${i}`} cx={(w/(top+1))*(i+1)} cy={-offset} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
       // bottom
       for(let i=0; i<bottom; i++) {
         chairs.push(<circle key={`b${i}`} cx={(w/(bottom+1))*(i+1)} cy={h+offset} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
       // left
       for(let i=0; i<left; i++) {
         chairs.push(<circle key={`l${i}`} cx={-offset} cy={(h/(left+1))*(i+1)} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
       // right
       for(let i=0; i<right; i++) {
         chairs.push(<circle key={`r${i}`} cx={w+offset} cy={(h/(right+1))*(i+1)} r={chairSize/2} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)
       }
    }
    return chairs
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (readOnly) return
    const data = e.dataTransfer.getData("floor-plan-item")
    if (data && onDropItem) {
      try {
        const payload = JSON.parse(data)
        const pos = getWorkspacePos(e)
        onDropItem(payload, { x: snap(pos.x), y: snap(pos.y) })
      } catch (err) {
        console.error("Invalid drop payload", err)
      }
    }
  }

  return (
    <div className="flex-1 w-full h-full overflow-hidden bg-white relative select-none">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ width: '100%', height: '100%', display: 'block', minHeight: '100%' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={mode === "pan" ? (isPanning ? "cursor-grabbing" : "cursor-grab") : isPanning ? "cursor-grabbing" : (mode === "draw_room" || mode === "draw_event") ? "cursor-crosshair" : "cursor-default"}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Infinite Background Grid */}
        {!readOnly && <rect width="100%" height="100%" fill="url(#grid)" />}

        {/* Scaled and Panned Container */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          
          {/* Floor boundary indicator */}
          <rect width={width} height={height} fill="transparent" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="8,8" />

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

          {/* Render Lasso Selection Box */}
          {lassoStart && lassoEnd && (
            <rect
              x={Math.min(lassoStart.x, lassoEnd.x)}
              y={Math.min(lassoStart.y, lassoEnd.y)}
              width={Math.abs(lassoEnd.x - lassoStart.x)}
              height={Math.abs(lassoEnd.y - lassoStart.y)}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="4,4"
              className="pointer-events-none"
            />
          )}

          {/* Render Areas */}
          {floor?.areas?.map((area: any) => {
            const isSelected = selectedElementIds.includes(area.id)
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
            const isSelected = selectedElementIds.includes(table._id || table.id)
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

                {/* Selection Highlight & Handles */}
                {isSelected && !readOnly && (
                  <g>
                    <rect x="-4" y="-4" width={w+8} height={h+8} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" />
                    {/* Rotate Handle */}
                    <line x1={w/2} y1="-4" x2={w/2} y2="-24" stroke="#3b82f6" strokeWidth="1" />
                    <circle cx={w/2} cy="-24" r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-crosshair" onPointerDown={(e) => startRotate(e, table._id || table.id, 'table', {x: pos.x + w/2, y: pos.y + h/2})} />
                    
                    {/* Resize Corner Handle (Bottom Right) */}
                    <circle cx={w+4} cy={h+4} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-nwse-resize" onPointerDown={(e) => startResize(e, table._id || table.id, 'table', {w, h}, rot)} />
                  </g>
                )}
              </g>
            )
          })}

          {/* Render Elements */}
          {elements.map((element: any) => {
            const isSelected = selectedElementIds.includes(element.id)
            const pos = { x: element.x, y: element.y }
            const w = element.width || 40
            const h = element.height || 40
            const rot = element.rotation || 0
            const color = element.color || "#4b5563"

            return (
              <g
                key={element.id}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${rot}, ${w/2}, ${h/2})`}
                onPointerDown={(e) => startDrag(e, element.id, 'element', pos)}
                className={readOnly ? "cursor-pointer" : isSelected ? "cursor-grabbing" : "cursor-grab"}
              >
                {element.type === 'plant' && (
                  <g>
                    <circle cx={w/2} cy={h/2} r={w/2} fill={color} opacity="0.3" stroke={isSelected ? "#3b82f6" : color} strokeWidth={isSelected ? 3 : 2} />
                    <circle cx={w/2} cy={h/2} r={w/4} fill={color} />
                  </g>
                )}
                {element.type === 'wall' && (
                  <rect width={w} height={h} fill={color} stroke={isSelected ? "#3b82f6" : "none"} strokeWidth={2} />
                )}
                {element.type === 'door' && (
                  <g>
                    <rect width={8} height={h} fill={color} />
                    <rect x={w-8} width={8} height={h} fill={color} />
                    <path d={`M 8 ${h} Q ${w/2} 0 ${w-8} ${h}`} fill="none" stroke={isSelected ? "#3b82f6" : color} strokeWidth={2} strokeDasharray="4,4" />
                  </g>
                )}
                {element.type === 'partition' && (
                  <rect width={w} height={h} fill="none" stroke={isSelected ? "#3b82f6" : color} strokeWidth={4} strokeDasharray="10,5" />
                )}
                {element.type === 'bar_counter' && (
                  <rect width={w} height={h} rx={4} fill={color} opacity="0.8" stroke={isSelected ? "#3b82f6" : "#d97706"} strokeWidth={isSelected ? 3 : 2} />
                )}
                {element.type === 'bar_section' && (
                  <path d={`M 0 0 L ${w} 0 L ${w} ${h} A ${w} ${h} 0 0 1 0 0`} fill={color} opacity="0.8" stroke={isSelected ? "#3b82f6" : "#d97706"} strokeWidth={isSelected ? 3 : 2} />
                )}
                {element.type === 'chair' && (
                  <circle cx={w/2} cy={h/2} r={w/2} fill="#f3f4f6" stroke={isSelected ? "#3b82f6" : "#9ca3af"} strokeWidth={isSelected ? 3 : 2} />
                )}
                {element.type === 'bar_stool' && (
                  <circle cx={w/2} cy={h/2} r={w/2} fill="#e5e7eb" stroke={isSelected ? "#3b82f6" : "#6b7280"} strokeWidth={isSelected ? 3 : 2} />
                )}
                {element.type === 'booth' && (
                  <path d={`M 0 ${h} L 0 0 L ${w} 0 L ${w} ${h}`} fill="none" stroke={isSelected ? "#3b82f6" : color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                )}
                
                {/* Selection Highlight & Handles */}
                {isSelected && !readOnly && (
                  <g>
                    <rect x="-4" y="-4" width={w+8} height={h+8} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" />
                    {/* Rotate Handle */}
                    <line x1={w/2} y1="-4" x2={w/2} y2="-24" stroke="#3b82f6" strokeWidth="1" />
                    <circle cx={w/2} cy="-24" r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-crosshair" onPointerDown={(e) => startRotate(e, element.id, 'element', {x: pos.x + w/2, y: pos.y + h/2})} />
                    
                    {/* Resize Corner Handle (Bottom Right) */}
                    <circle cx={w+4} cy={h+4} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-nwse-resize" onPointerDown={(e) => startResize(e, element.id, 'element', {w, h}, rot)} />
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
