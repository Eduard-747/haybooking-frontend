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
  const getMousePos = (e: { clientX: number; clientY: number }) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const CTM = svgRef.current.getScreenCTM()
    if (!CTM) return { x: 0, y: 0 }
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    }
  }

  // Get position relative to the scaled/panned workspace
  const getWorkspacePos = (e: { clientX: number; clientY: number }) => {
    const pos = getMousePos(e)
    return {
      x: (pos.x - pan.x) / scale,
      y: (pos.y - pan.y) / scale
    }
  }

  // Snap to grid (5px for finer alignment of architectural elements)
  const snap = (val: number) => Math.round(val / 5) * 5

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
      onPanChange?.({
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
      let snappedX = snap(pos.x - dragOffset.x)
      let snappedY = snap(pos.y - dragOffset.y)

      if (interactionState.type === 'element') {
        const w = interactionState.originalSize?.w || 40;
        const h = interactionState.originalSize?.h || 40;
        const movingEl = elements.find((e: any) => e.id === interactionState.id);
        const movingRot = movingEl?.rotation || 0;
        
        const getAABB = (x: number, y: number, w: number, h: number, rot: number) => {
          if (rot % 180 === 0) return { vx: x, vy: y, vw: w, vh: h };
          if (rot % 90 === 0) return { vx: x + w/2 - h/2, vy: y + h/2 - w/2, vw: h, vh: w };
          const rad = rot * Math.PI / 180;
          const cx = x + w/2;
          const cy = y + h/2;
          const pts = [
            {x: -w/2, y: -h/2}, {x: w/2, y: -h/2},
            {x: w/2, y: h/2}, {x: -w/2, y: h/2}
          ].map(p => ({
            x: cx + p.x * Math.cos(rad) - p.y * Math.sin(rad),
            y: cy + p.x * Math.sin(rad) + p.y * Math.cos(rad)
          }));
          const minX = Math.min(...pts.map(p => p.x));
          const maxX = Math.max(...pts.map(p => p.x));
          const minY = Math.min(...pts.map(p => p.y));
          const maxY = Math.max(...pts.map(p => p.y));
          return { vx: minX, vy: minY, vw: maxX - minX, vh: maxY - minY };
        };

        const movingAABB = getAABB(snappedX, snappedY, w, h, movingRot);

        let bestDistX = 15;
        let bestDistY = 15;
        let dx = 0;
        let dy = 0;

        elements.forEach((other: any) => {
          if (other.id === interactionState.id) return;
          const ow = other.width || 40;
          const oh = other.height || 40;
          const orot = other.rotation || 0;
          
          const otherAABB = getAABB(other.x, other.y, ow, oh, orot);
          
          const movingXs = [movingAABB.vx, movingAABB.vx + movingAABB.vw];
          const movingYs = [movingAABB.vy, movingAABB.vy + movingAABB.vh];
          const otherXs = [otherAABB.vx, otherAABB.vx + otherAABB.vw, otherAABB.vx + 10, otherAABB.vx + otherAABB.vw - 10];
          const otherYs = [otherAABB.vy, otherAABB.vy + otherAABB.vh, otherAABB.vy + 10, otherAABB.vy + otherAABB.vh - 10];

          movingXs.forEach(mx => {
            otherXs.forEach(ox => {
              if (Math.abs(mx - ox) < bestDistX) {
                bestDistX = Math.abs(mx - ox);
                dx = ox - mx;
              }
            });
          });

          movingYs.forEach(my => {
            otherYs.forEach(oy => {
              if (Math.abs(my - oy) < bestDistY) {
                bestDistY = Math.abs(my - oy);
                dy = oy - my;
              }
            });
          });
        });

        if (bestDistX < 15) snappedX += dx;
        if (bestDistY < 15) snappedY += dy;
      }

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
    let size = {w: 40, h: 40};
    if (type === 'element') {
      const el = elements.find((el: any) => el.id === id);
      if (el) size = {w: el.width || 40, h: el.height || 40};
    } else if (type === 'table') {
      const tb = tables.find((t: any) => t._id === id || t.id === id);
      if (tb) size = {w: tb.size?.width || 80, h: tb.size?.height || 80};
    }
    
    setInteractionState({ id, type, action: 'move', startPos: pos, originalSize: size })
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

  // ── Unified Realistic Beige Fabric Chair ──────────────────────────────
  const ChairSVG = ({
    cx, cy, angleDeg, scale = 1, shadow = true,
  }: { cx: number; cy: number; angleDeg: number; scale?: number; shadow?: boolean }) => {
    const W = 20, H = 20  // chair footprint
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scale})`} filter={shadow ? "url(#chair-shadow)" : undefined}>
        {/* Outer wrap (armrests and back) outline/shadow */}
        <path d={`M${-W / 2 + 1},${H / 2} L${-W / 2 + 1},${-H / 2 + 5} Q${-W / 2 + 1},${-H / 2 - 1} 0,${-H / 2 - 1} Q${W / 2 - 1},${-H / 2 - 1} ${W / 2 - 1},${-H / 2 + 5} L${W / 2 - 1},${H / 2}`}
          fill="none" stroke="#6b5b4a" strokeWidth="8" strokeLinecap="round" opacity="0.6" filter="url(#drop-shadow-sm)"/>
        
        {/* Outer wrap inner fill (warm beige) */}
        <path d={`M${-W / 2 + 1},${H / 2} L${-W / 2 + 1},${-H / 2 + 5} Q${-W / 2 + 1},${-H / 2 - 1} 0,${-H / 2 - 1} Q${W / 2 - 1},${-H / 2 - 1} ${W / 2 - 1},${-H / 2 + 5} L${W / 2 - 1},${H / 2}`}
          fill="none" stroke="#e6dbcc" strokeWidth="7" strokeLinecap="round" />
          
        {/* Wrap highlight (top edge) */}
        <path d={`M${-W / 2 + 1},${H / 2} L${-W / 2 + 1},${-H / 2 + 5} Q${-W / 2 + 1},${-H / 2 - 1} 0,${-H / 2 - 1} Q${W / 2 - 1},${-H / 2 - 1} ${W / 2 - 1},${-H / 2 + 5} L${W / 2 - 1},${H / 2}`}
          fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>

        {/* Central Cushion */}
        <rect x={-W / 2 + 4} y={-H / 2 + 2} width={W - 8} height={H - 2} rx={3} ry={3}
          fill="#dcd1c2" stroke="#a4937e" strokeWidth="0.8"/>
          
        {/* Cushion Tufting/Creases */}
        <line x1={0} y1={-H / 2 + 4} x2={0} y2={H / 2 - 1} stroke="#a4937e" strokeWidth="0.5" opacity="0.6" />
        <line x1={-W / 2 + 6} y1={0} x2={W / 2 - 6} y2={0} stroke="#a4937e" strokeWidth="0.5" opacity="0.6" />
      </g>
    )
  }



  // ── renderChairs: place realistic chairs around any table shape ──────────
  const renderChairs = (table: any) => {
    const chairs: React.ReactNode[] = []
    const count = table.capacity
    if (!count || count < 1) return null

    const w = table.size?.width || 80
    const h = table.size?.height || 80
    const GAP = 2   // tight gap for unified chairs

    // Calculate chair scaling based on current table size vs default required size
    let baseW = 80;
    let baseH = 80;
    if (['rectangular', 'banquet'].includes(table.shape)) {
      baseW = Math.max(80, count * 20);
      baseH = 80;
    } else {
      const sq = Math.max(80, Math.ceil(Math.sqrt(count) * 40));
      baseW = sq;
      baseH = sq;
    }
    // Cap at 1.1 so chairs don't get comically huge, but allow them to shrink infinitely
    const chairScale = Math.min(1.1, Math.min(w / baseW, h / baseH));

    if (table.shape === 'u_conf') {
      // U-shape chair layout (Outer perimeter only: left, top, right)
      // Assume top is closed, bottom is open.
      // Left side, top side, right side.
      const sideCapacity = Math.floor((count - 2) / 2) // e.g. 10 total -> 4 left, 2 top, 4 right
      const topCapacity = count - (sideCapacity * 2)

      // Left column
      for (let i = 0; i < sideCapacity; i++) {
        chairs.push(<ChairSVG key={`l${i}`} cx={-GAP} cy={(h / (sideCapacity + 1)) * (i + 1)} angleDeg={90} scale={chairScale} />)
      }
      // Right column
      for (let i = 0; i < sideCapacity; i++) {
        chairs.push(<ChairSVG key={`r${i}`} cx={w + GAP} cy={(h / (sideCapacity + 1)) * (i + 1)} angleDeg={-90} scale={chairScale} />)
      }
      // Top row
      for (let i = 0; i < topCapacity; i++) {
        chairs.push(<ChairSVG key={`t${i}`} cx={(w / (topCapacity + 1)) * (i + 1)} cy={-GAP} angleDeg={180} scale={chairScale} />)
      }
    }
    // ── Round / Oval ──────────────────────────────────────────────
    else if (['round', 'oval'].includes(table.shape)) {
      const rx = w / 2 + GAP
      const ry = h / 2 + GAP
      const cx = w / 2, cy = h / 2
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count - Math.PI / 2
        const px = cx + rx * Math.cos(angle)
        const py = cy + ry * Math.sin(angle)
        const deg = (angle * 180) / Math.PI + 90   // face toward table centre
        chairs.push(<ChairSVG key={i} cx={px} cy={py} angleDeg={deg} scale={chairScale} />)
      }
    }
    // ── Rectangular / Square / Banquet ──────────────────────────────────────────────
    else if (['rectangular', 'square', 'banquet'].includes(table.shape)) {
      let tb_total = Math.round(count * (w / (w + h)))
      if (count % 2 === 0 && tb_total % 2 !== 0) {
        tb_total = tb_total < count ? tb_total + 1 : tb_total - 1
      }
      const lr_total = count - tb_total
      const top = Math.ceil(tb_total / 2)
      const bottom = Math.floor(tb_total / 2)
      const left = Math.ceil(lr_total / 2)
      const right = Math.floor(lr_total / 2)

      for (let i = 0; i < top; i++) {
        chairs.push(<ChairSVG key={`t${i}`} cx={(w / (top + 1)) * (i + 1)} cy={-GAP} angleDeg={180} scale={chairScale} />)
      }
      for (let i = 0; i < bottom; i++) {
        chairs.push(<ChairSVG key={`b${i}`} cx={(w / (bottom + 1)) * (i + 1)} cy={h + GAP} angleDeg={0} scale={chairScale} />)
      }
      for (let i = 0; i < left; i++) {
        chairs.push(<ChairSVG key={`l${i}`} cx={-GAP} cy={(h / (left + 1)) * (i + 1)} angleDeg={90} scale={chairScale} />)
      }
      for (let i = 0; i < right; i++) {
        chairs.push(<ChairSVG key={`r${i}`} cx={w + GAP} cy={(h / (right + 1)) * (i + 1)} angleDeg={-90} scale={chairScale} />)
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
          {/* Shadows */}
          <filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dx="0" dy="10" result="offsetblur" />
            <feFlood floodColor="#000000" floodOpacity="0.3" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="drop-shadow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="5" result="offsetblur" />
            <feFlood floodColor="#000000" floodOpacity="0.25" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="chair-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feFlood floodColor="#0f172a" floodOpacity="0.2" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Realistic Wood Grain pattern ── */}
          <radialGradient id="wood-base" cx="42%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#8a5a3a" />
            <stop offset="50%" stopColor="#613c23" />
            <stop offset="100%" stopColor="#402615" />
          </radialGradient>
          <pattern id="wood-grain-pat" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#wood-base)" />
            <path d="M0 20 Q 30 10 60 30 T 120 40 M0 60 Q 40 50 80 70 T 120 80" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M0 40 Q 20 30 50 60 T 120 50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
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
                {/* Render Unified Realistic Wood Tables & Custom Shapes */}
                {table.shape === 'u_conf' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Dark borders */}
                    <path d={`M 0 0 L ${w} 0 L ${w} ${h} L ${w-30} ${h} L ${w-30} 30 L 30 30 L 30 ${h} L 0 ${h} Z`} fill="#301a0e" />
                    {/* Wood grain */}
                    <path d={`M 2 2 L ${w-2} 2 L ${w-2} ${h-2} L ${w-28} ${h-2} L ${w-28} 28 L 28 28 L 28 ${h-2} L 2 ${h-2} Z`} fill="url(#wood-grain-pat)" />
                    {/* Bevel highlight */}
                    <path d={`M 4 4 L ${w-4} 4 L ${w-4} ${h-4} L ${w-26} ${h-4} L ${w-26} 26 L 26 26 L 26 ${h-4} L 4 ${h-4} Z`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Joints (simulating 3 pieces) */}
                    <line x1={30} y1={2} x2={30} y2={28} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                    <line x1={w-30} y1={2} x2={w-30} y2={28} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                    {isSelected && <path d={`M -4 -4 L ${w+4} -4 L ${w+4} ${h+4} L ${w-34} ${h+4} L ${w-34} 34 L 34 34 L 34 ${h+4} L -4 ${h+4} Z`} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,3" />}
                  </g>
                ) : table.shape === 'round' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Base dark wood border */}
                    <circle cx={w / 2} cy={h / 2} r={w / 2} fill="#301a0e" />
                    {/* Wood grain surface */}
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 2} fill="url(#wood-grain-pat)" />
                    {/* Inner highlight ring */}
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Selection ring */}
                    {isSelected && <circle cx={w / 2} cy={h / 2} r={w / 2 + 4} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,3" />}
                  </g>
                ) : table.shape === 'oval' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Base dark wood border */}
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill="#301a0e" />
                    {/* Wood grain surface */}
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} fill="url(#wood-grain-pat)" />
                    {/* Inner highlight ring */}
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Selection ring */}
                    {isSelected && <ellipse cx={w / 2} cy={h / 2} rx={w / 2 + 4} ry={h / 2 + 4} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,3" />}
                  </g>
                ) : table.shape === 'square' || table.shape === 'rectangular' || table.shape === 'banquet' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Base dark wood border */}
                    <rect x={0} y={0} width={w} height={h} rx={6} fill="#301a0e" />
                    {/* Wood grain surface */}
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={4} fill="url(#wood-grain-pat)" />
                    {/* Inner bevel highlight */}
                    <rect x={4} y={4} width={w - 8} height={h - 8} rx={2} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Selection outline */}
                    {isSelected && <rect x={-4} y={-4} width={w + 8} height={h + 8} rx={8} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,3" />}
                  </g>
                ) : (
                  <rect x={0} y={0} width={w} height={h} rx={8} fill="url(#wood-grain-pat)" stroke="#301a0e" strokeWidth={2} filter="url(#drop-shadow-sm)" />
                )}

                {/* Chairs rendered OVER table for correct depth */}
                {renderChairs(table)}

                {/* Table Number */}
                <text x={w/2} y={h/2} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.9)" fontSize="14" fontWeight="600" className="pointer-events-none" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
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
                  <g>
                    <rect width={w} height={h} fill="#4b5563" stroke={isSelected ? "#3b82f6" : "none"} strokeWidth={2} />
                    {/* Dimension line */}
                    <g transform={`translate(0, ${-20})`}>
                      <path d={`M 0 0 L ${w} 0`} fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3,3" />
                      <path d={`M 0 -3 L 0 3`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                      <path d={`M ${w} -3 L ${w} 3`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                      <polygon points={`0,0 4,-3 4,3`} fill="#9ca3af" />
                      <polygon points={`${w},0 ${w-4},-3 ${w-4},3`} fill="#9ca3af" />
                      <rect x={w/2 - 15} y={-8} width={30} height={16} fill="white" />
                      <text x={w/2} y={3} fontSize={10} fill="#4b5563" textAnchor="middle" fontWeight="500">{Math.floor(w/10)}&apos; {Math.round(w%10)}&quot;</text>
                    </g>
                  </g>
                )}
                {element.type === 'door' && (
                  <g>
                    {/* Threshold line connecting the opening */}
                    <line x1={0} y1={0} x2={w} y2={0} stroke="#9ca3af" strokeWidth={1} />
                    {/* Swing arc (solid line) */}
                    <path d={`M 4 ${w} A ${w} ${w} 0 0 0 ${w} 0`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                    {/* Door leaf (OPEN 90 degrees DOWN inside bounding box) */}
                    <rect x={0} y={0} width={4} height={w} fill="#ffffff" stroke="#9ca3af" strokeWidth={1} />
                  </g>
                )}
                {element.type === 'window' && (
                  <g>
                    <rect width={w} height={h} fill="#4b5563" />
                    <rect x={4} y={2} width={(w-8)/2} height={h-4} fill="#e0f2fe" stroke="#0ea5e9" strokeWidth={1} />
                    <rect x={4 + (w-8)/2} y={2} width={(w-8)/2} height={h-4} fill="#e0f2fe" stroke="#0ea5e9" strokeWidth={1} />
                  </g>
                )}
                {element.type === 'corner_wall' && (
                  <g>
                    {/* Vertical part */}
                    <rect x={0} y={0} width={10} height={h} fill="#4b5563" />
                    {/* Horizontal part */}
                    <rect x={0} y={h-10} width={w} height={10} fill="#4b5563" />
                    
                    {/* Vertical dimension */}
                    <g transform={`translate(${-20}, 0)`}>
                      <path d={`M 0 0 L 0 ${h}`} fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3,3" />
                      <path d={`M -3 0 L 3 0`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                      <path d={`M -3 ${h} L 3 ${h}`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                      <polygon points={`0,0 -3,4 3,4`} fill="#9ca3af" />
                      <polygon points={`0,${h} -3,${h-4} 3,${h-4}`} fill="#9ca3af" />
                      <rect x={-12} y={h/2 - 15} width={24} height={30} fill="white" />
                      <text x={0} y={h/2} fontSize={10} fill="#4b5563" textAnchor="middle" dominantBaseline="central" transform={`rotate(-90, 0, ${h/2})`} fontWeight="500">{Math.floor(h/10)}&apos; {Math.round(h%10)}&quot;</text>
                    </g>
                  </g>
                )}
                {element.type === 'level_marker' && (
                  <g>
                    <circle cx={w/2} cy={h/2} r={w/2-2} fill="white" stroke="#4b5563" strokeWidth={1.5} />
                    <line x1={w/2} y1={0} x2={w/2} y2={h} stroke="#4b5563" strokeWidth={1.5} />
                    <line x1={0} y1={h/2} x2={w} y2={h/2} stroke="#4b5563" strokeWidth={1.5} />
                    <circle cx={w/2} cy={h/2} r={3} fill="#4b5563" />
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
