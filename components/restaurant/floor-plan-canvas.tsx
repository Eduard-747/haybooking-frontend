"use client"

import { useState, useRef, useEffect } from "react"
import { Users, ChefHat, Utensils, Crown, TreePine, Cigarette, Martini, Clock, DoorOpen, Coffee } from "lucide-react"

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
  mode?: "select" | "pan" | "draw_wall" | "draw_room" | "add_table" | "add_label"
  drawingPoints?: Point[]
  onDropItem?: (payload: any, pos: Point) => void
  gridEnabled?: boolean
  snapEnabled?: boolean
  onMouseMove?: (pos: Point) => void
}

// Upgraded status colors with outer glow effects
const statusColors = {
  available: { stroke: "#10b981", fill: "#d1fae5", text: "#047857", glow: "rgba(16, 185, 129, 0.4)" },
  reserved: { stroke: "#f59e0b", fill: "#fef3c7", text: "#b45309", glow: "rgba(245, 158, 11, 0.4)" },
  occupied: { stroke: "#ef4444", fill: "#fee2e2", text: "#b91c1c", glow: "rgba(239, 68, 68, 0.4)" },
  cleaning: { stroke: "#a855f7", fill: "#f3e8ff", text: "#7e22ce", glow: "rgba(168, 85, 247, 0.4)" },
  out_of_service: { stroke: "#9ca3af", fill: "#f3f4f6", text: "#4b5563", glow: "rgba(156, 163, 175, 0.4)" },
  blocked: { stroke: "#6b7280", fill: "#e5e7eb", text: "#374151", glow: "rgba(107, 114, 128, 0.4)" },
}

export function FloorPlanCanvas({
  floor,
  tables,
  elements = [],
  selectedElementIds = [],
  onSelectElement = () => { },
  onUpdateTable = () => { },
  onUpdateArea = () => { },
  onUpdateElement,
  onCanvasClick,
  onDragEnd,
  scale = 1,
  pan = { x: 0, y: 0 },
  onPanChange,
  readOnly = false,
  mode = "select",
  drawingPoints = [],
  onDropItem,
  gridEnabled = true,
  snapEnabled = true,
  onMouseMove
}: FloorPlanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Dragging State
  const [interactionState, setInteractionState] = useState<{
    id: string,
    type: 'table' | 'area' | 'element',
    action: 'move' | 'resize' | 'rotate' | 'vertex',
    startPos: Point,
    originalSize?: { w: number, h: number },
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

  const getWorkspacePos = (e: { clientX: number; clientY: number }) => {
    const pos = getMousePos(e)
    return {
      x: (pos.x - pan.x) / scale,
      y: (pos.y - pan.y) / scale
    }
  }

  // Snap to grid (5px or fine-grained)
  const snap = (val: number) => snapEnabled ? Math.round(val / 5) * 5 : val

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.altKey || mode === "pan") {
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      svgRef.current?.setPointerCapture(e.pointerId)
      return
    }

    if (mode === "draw_room" || mode === "draw_wall") {
      const pos = getWorkspacePos(e)
      onCanvasClick?.({ x: snap(pos.x), y: snap(pos.y) })
      return
    }

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
    const currentWorkspacePos = getWorkspacePos(e)
    onMouseMove?.(currentWorkspacePos)

    if (isPanning) {
      onPanChange?.({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      })
      return
    }

    if (lassoStart) {
      setLassoEnd(currentWorkspacePos)
      return
    }

    if (!interactionState || readOnly) return

    const pos = currentWorkspacePos

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
          if (rot % 90 === 0) return { vx: x + w / 2 - h / 2, vy: y + h / 2 - w / 2, vw: h, vh: w };
          const rad = rot * Math.PI / 180;
          const cx = x + w / 2;
          const cy = y + h / 2;
          const pts = [
            { x: -w / 2, y: -h / 2 }, { x: w / 2, y: -h / 2 },
            { x: w / 2, y: h / 2 }, { x: -w / 2, y: h / 2 }
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
      angle = Math.round(angle / 15) * 15

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
        return x < maxX && (x + w) > minX && y < maxY && (y + h) > minY
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
    let size = { w: 40, h: 40 };
    if (type === 'element') {
      const el = elements.find((el: any) => el.id === id);
      if (el) size = { w: el.width || 40, h: el.height || 40 };
    } else if (type === 'table') {
      const tb = tables.find((t: any) => t._id === id || t.id === id);
      if (tb) size = { w: tb.size?.width || 80, h: tb.size?.height || 80 };
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

  const startResize = (e: React.PointerEvent, id: string, type: 'table' | 'element', originalSize: { w: number, h: number }, originalAngle: number) => {
    if (readOnly || mode !== "select") return
    e.stopPropagation()
    setInteractionState({ id, type, action: 'resize', startPos: getWorkspacePos(e), originalSize, originalAngle })
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  // ── Unified Realistic Chair Styles ──────────────────────────────────────
  const ChairWood = ({ cx, cy, angleDeg, scale = 1, shadow = false }: any) => {
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scale})`} filter={shadow ? "url(#chair-shadow)" : "url(#drop-shadow-sm)"}>
        <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#eaddcd" stroke="#d4b895" strokeWidth="1" />
        <rect x="-8" y="-13" width="4" height="6" rx="1" fill="#8a5a3a" />
        <rect x="4" y="-13" width="4" height="6" rx="1" fill="#8a5a3a" />
      </g>
    )
  }

  const ChairGrey = ({ cx, cy, angleDeg, scale = 1, shadow = false }: any) => {
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scale})`} filter={shadow ? "url(#chair-shadow)" : "url(#drop-shadow-sm)"}>
        <path d="M-11,11 L-11,-5 Q-11,-12 0,-12 Q11,-12 11,-5 L11,11" fill="none" stroke="#3f3f46" strokeWidth="5" strokeLinecap="round" />
        <rect x="-9" y="-7" width="18" height="16" rx="4" fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="1" />
      </g>
    )
  }

  const ChairIron = ({ cx, cy, angleDeg, scale = 1, shadow = false }: any) => {
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scale})`} filter={shadow ? "url(#chair-shadow)" : "url(#drop-shadow-sm)"}>
        <path d="M-10,10 L-10,-8 Q-10,-14 0,-14 Q10,-14 10,-8 L10,10" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="-6" r="4" fill="none" stroke="#0f172a" strokeWidth="1" />
        <rect x="-8" y="-4" width="16" height="14" rx="7" fill="#334155" stroke="#0f172a" strokeWidth="1" />
      </g>
    )
  }

  const StoolBar = ({ cx, cy, angleDeg, scale = 1, shadow = false }: any) => {
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scale})`} filter={shadow ? "url(#chair-shadow)" : "url(#drop-shadow-sm)"}>
        <circle cx="0" cy="0" r="10" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
        <circle cx="0" cy="0" r="8" fill="#52525b" />
        <path d="M-6,-4 Q0,-8 6,-4" fill="none" stroke="#18181b" strokeWidth="1" opacity="0.3" />
      </g>
    )
  }

  // ── renderChairs: dynamic placement exactly matching capacity ──────────
  const renderChairs = (table: any) => {
    const chairs: React.ReactNode[] = []
    const count = table.capacity
    if (!count || count < 1) return null

    const w = table.size?.width || 80
    const h = table.size?.height || 80
    const GAP = 2

    let baseW = 80;
    let baseH = 80;
    if (['rectangular', 'banquet', 'two_seat', 'four_seat', 'six_seat', 'connectable', 'expandable', 'foldable', 'coffee_table', 'sofa_table', 'bench_seating', 'banquette', 'corner_booth', 'bar', 'high', 'picnic_table', 'chef_table', 'private_dining', 'family_table', 'event_table'].includes(table.shape)) {
      baseW = Math.max(80, count * 20);
      baseH = 80;
    } else {
      const sq = Math.max(80, Math.ceil(Math.sqrt(count) * 40));
      baseW = sq;
      baseH = sq;
    }
    const chairScale = Math.min(1.1, Math.min(w / baseW, h / baseH));

    let ChairComponent = ChairWood;
    if (['coffee_table', 'sofa_table', 'lounge_chair', 'armchair'].includes(table.shape)) ChairComponent = ChairGrey;
    if (['garden_table'].includes(table.shape)) ChairComponent = ChairIron;
    if (['bar', 'high', 'bar_counter'].includes(table.shape)) ChairComponent = StoolBar;

    if (table.shape === 'u_conf') {
      const sideCapacity = Math.floor((count - 2) / 2)
      const topCapacity = count - (sideCapacity * 2)
      for (let i = 0; i < sideCapacity; i++) chairs.push(<ChairComponent key={`l${i}`} cx={-GAP} cy={(h / (sideCapacity + 1)) * (i + 1)} angleDeg={90} scale={chairScale} />)
      for (let i = 0; i < sideCapacity; i++) chairs.push(<ChairComponent key={`r${i}`} cx={w + GAP} cy={(h / (sideCapacity + 1)) * (i + 1)} angleDeg={-90} scale={chairScale} />)
      for (let i = 0; i < topCapacity; i++) chairs.push(<ChairComponent key={`t${i}`} cx={(w / (topCapacity + 1)) * (i + 1)} cy={-GAP} angleDeg={180} scale={chairScale} />)
    }
    else if (['round', 'oval', 'capsule', 'umbrella_table', 'garden_table', 'patio_table', 'private_dining'].includes(table.shape)) {
      const rx = w / 2 + GAP
      const ry = h / 2 + GAP
      const cx = w / 2, cy = h / 2
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count - Math.PI / 2
        const px = cx + rx * Math.cos(angle)
        const py = cy + ry * Math.sin(angle)
        const deg = (angle * 180) / Math.PI + 90
        chairs.push(<ChairComponent key={i} cx={px} cy={py} angleDeg={deg} scale={chairScale} />)
      }
    }
    else if (['rectangular', 'square', 'banquet', 'booth', 'custom', 'two_seat', 'four_seat', 'six_seat', 'connectable', 'expandable', 'foldable', 'coffee_table', 'sofa_table', 'bench_seating', 'banquette', 'corner_booth', 'bar', 'high', 'picnic_table', 'chef_table', 'private_dining', 'family_table', 'event_table'].includes(table.shape)) {
      if (['connectable', 'expandable', 'foldable', 'chef_table', 'family_table'].includes(table.shape)) {
        const top = Math.ceil(count / 2)
        const bottom = Math.floor(count / 2)
        for (let i = 0; i < top; i++) chairs.push(<ChairComponent key={`t${i}`} cx={(w / (top + 1)) * (i + 1)} cy={-GAP} angleDeg={180} scale={chairScale} />)
        for (let i = 0; i < bottom; i++) chairs.push(<ChairComponent key={`b${i}`} cx={(w / (bottom + 1)) * (i + 1)} cy={h + GAP} angleDeg={0} scale={chairScale} />)
      } else if (table.shape === 'high') {
        // High tables have all stools on the bottom edge
        for (let i = 0; i < count; i++) chairs.push(<ChairComponent key={`b${i}`} cx={(w / (count + 1)) * (i + 1)} cy={h + GAP} angleDeg={0} scale={chairScale} />)
      } else {
        // Intelligent perimeter placement
        let tb_total = Math.round(count * (w / (w + h)))
        if (count % 2 === 0 && tb_total % 2 !== 0) tb_total = tb_total < count ? tb_total + 1 : tb_total - 1
        const lr_total = count - tb_total
        const top = Math.ceil(tb_total / 2)
        const bottom = Math.floor(tb_total / 2)
        const left = Math.ceil(lr_total / 2)
        const right = Math.floor(lr_total / 2)

        for (let i = 0; i < top; i++) chairs.push(<ChairComponent key={`t${i}`} cx={(w / (top + 1)) * (i + 1)} cy={-GAP} angleDeg={180} scale={chairScale} />)
        for (let i = 0; i < bottom; i++) chairs.push(<ChairComponent key={`b${i}`} cx={(w / (bottom + 1)) * (i + 1)} cy={h + GAP} angleDeg={0} scale={chairScale} />)
        for (let i = 0; i < left; i++) chairs.push(<ChairComponent key={`l${i}`} cx={-GAP} cy={(h / (left + 1)) * (i + 1)} angleDeg={90} scale={chairScale} />)
        for (let i = 0; i < right; i++) chairs.push(<ChairComponent key={`r${i}`} cx={w + GAP} cy={(h / (right + 1)) * (i + 1)} angleDeg={-90} scale={chairScale} />)
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
        className={mode === "pan" ? (isPanning ? "cursor-grabbing" : "cursor-grab") : isPanning ? "cursor-grabbing" : (mode === "draw_room" || mode === "draw_wall") ? "cursor-crosshair" : "cursor-default"}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5" />
          </pattern>
          {/* Status Glow Filters */}
          <filter id="glow-available"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glow-reserved"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glow-occupied"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glow-blocked"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glow-selected"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>

          {/* Shadows */}
          <filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dx="0" dy="10" result="offsetblur" />
            <feFlood floodColor="#000000" floodOpacity="0.3" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="drop-shadow-high" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />
            <feOffset dx="0" dy="18" result="offsetblur" />
            <feFlood floodColor="#000000" floodOpacity="0.4" />
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

          {/* Premium Textures */}
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
          <pattern id="slat-wood-pat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#b45309" />
            <line x1="0" y1="0" x2="10" y2="0" stroke="#78350f" strokeWidth="1" />
          </pattern>
          <pattern id="garden-iron-pat" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#334155" />
            <circle cx="2" cy="2" r="1" fill="none" stroke="#0f172a" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="marble-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
          <linearGradient id="booth-leather-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="fabric-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(186,230,253,0.5)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.2)" />
          </linearGradient>
        </defs>

        {!readOnly && gridEnabled && <rect width="100%" height="100%" fill="url(#grid)" />}

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
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
              : [{ x: area.x || 0, y: area.y || 0 }, { x: (area.x || 0) + (area.width || 100), y: area.y || 0 }, { x: (area.x || 0) + (area.width || 100), y: (area.y || 0) + (area.height || 100) }, { x: area.x || 0, y: (area.y || 0) + (area.height || 100) }]
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
                <text x={points[0].x + 10} y={points[0].y + 20} fontSize="14" fontWeight="bold" fill="#4b5563" className="pointer-events-none">
                  {area.name}
                </text>
                {isSelected && !readOnly && points.map((p: Point, i: number) => (
                  <circle key={i} cx={p.x} cy={p.y} r={6} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer hover:fill-blue-100" onPointerDown={(e) => startVertexDrag(e, area.id, i)} />
                ))}
              </g>
            )
          })}

          {/* Render Tables */}
          {tables.map((table: any) => {
            const isSelected = selectedElementIds.includes(table._id || table.id)
            const pos = table.position || { x: 0, y: 0 }
            const w = table.size?.width || 80
            const h = table.size?.height || 80
            const rot = table.rotation || 0
            const statusConfig = statusColors[table.status as keyof typeof statusColors] || statusColors.available

            // Outer Glow Path Setup based on shape
            let glowPath = "";
            if (table.shape === 'round' || table.shape === 'patio_table' || table.shape === 'umbrella_table' || table.shape === 'garden_table') {
              glowPath = `M ${w / 2} 0 A ${w / 2} ${w / 2} 0 1 1 ${w / 2 - 0.1} 0 Z`;
            } else if (table.shape === 'oval') {
              glowPath = `M ${w / 2} 0 A ${w / 2} ${h / 2} 0 1 1 ${w / 2 - 0.1} 0 Z`;
            } else if (table.shape === 'capsule') {
              const r = Math.min(w, h) / 2;
              if (w > h) glowPath = `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`;
              else glowPath = `M 0 ${r} A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 1 0 ${h - r} Z`;
            } else {
              glowPath = `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
            }

            return (
              <g
                key={table._id || table.id}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${rot}, ${w / 2}, ${h / 2})`}
                onPointerDown={(e) => startDrag(e, table._id || table.id, 'table', pos)}
                className={readOnly ? "cursor-pointer" : isSelected ? "cursor-grabbing" : "cursor-grab"}
              >
                {/* Status Glow */}
                <path d={glowPath} fill="none" stroke={isSelected ? "#3b82f6" : statusConfig.glow} strokeWidth="12" opacity="0.6" filter={isSelected ? "url(#glow-selected)" : `url(#glow-${table.status})`} />

                {table.shape === 'u_conf' ? (
                  <g filter="url(#drop-shadow)">
                    <path d={`M 0 0 L ${w} 0 L ${w} ${h} L ${w - 30} ${h} L ${w - 30} 30 L 30 30 L 30 ${h} L 0 ${h} Z`} fill="#301a0e" />
                    <path d={`M 2 2 L ${w - 2} 2 L ${w - 2} ${h - 2} L ${w - 28} ${h - 2} L ${w - 28} 28 L 28 28 L 28 ${h - 2} L 2 ${h - 2} Z`} fill="url(#wood-grain-pat)" />
                    <path d={`M 4 4 L ${w - 4} 4 L ${w - 4} ${h - 4} L ${w - 26} ${h - 4} L ${w - 26} 26 L 26 26 L 26 ${h - 4} L 4 ${h - 4} Z`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <line x1={30} y1={2} x2={30} y2={28} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                    <line x1={w - 30} y1={2} x2={w - 30} y2={28} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                  </g>
                ) : table.shape === 'round' || table.shape === 'private_dining' ? (
                  <g filter="url(#drop-shadow)">
                    <circle cx={w / 2} cy={h / 2} r={w / 2} fill="#301a0e" />
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 2} fill="url(#wood-grain-pat)" />
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  </g>
                ) : table.shape === 'umbrella_table' ? (
                  <g filter="url(#drop-shadow)">
                    <circle cx={w / 2} cy={h / 2} r={w / 2} fill="#301a0e" />
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 2} fill="url(#wood-grain-pat)" />
                    {/* Umbrella Top */}
                    <circle cx={w / 2} cy={h / 2} r={w / 2 + 10} fill="#65a30d" stroke="#4d7c0f" strokeWidth="2" opacity="0.9" />
                    <path d={`M ${w / 2} ${-10} L ${w / 2} ${h + 10} M ${-10} ${h / 2} L ${w + 10} ${h / 2} M ${w / 2 - (w / 2 + 10) * 0.707} ${h / 2 - (w / 2 + 10) * 0.707} L ${w / 2 + (w / 2 + 10) * 0.707} ${h / 2 + (w / 2 + 10) * 0.707} M ${w / 2 - (w / 2 + 10) * 0.707} ${h / 2 + (w / 2 + 10) * 0.707} L ${w / 2 + (w / 2 + 10) * 0.707} ${h / 2 - (w / 2 + 10) * 0.707}`} stroke="#4d7c0f" strokeWidth="1" opacity="0.5" />
                    <circle cx={w / 2} cy={h / 2} r={4} fill="#14532d" />
                  </g>
                ) : table.shape === 'garden_table' ? (
                  <g filter="url(#drop-shadow)">
                    <circle cx={w / 2} cy={h / 2} r={w / 2} fill="#334155" stroke="#0f172a" strokeWidth="2" />
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 2} fill="none" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx={w / 2} cy={h / 2} r={w / 4} fill="none" stroke="#0f172a" strokeWidth="1" />
                    <circle cx={w / 2} cy={h / 2} r={w / 2} fill="url(#garden-iron-pat)" />
                  </g>
                ) : table.shape === 'oval' ? (
                  <g filter="url(#drop-shadow)">
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill="#301a0e" />
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} fill="url(#wood-grain-pat)" />
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  </g>
                ) : table.shape === 'capsule' ? (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={Math.min(w, h) / 2} fill="#301a0e" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={Math.min(w - 4, h - 4) / 2} fill="url(#wood-grain-pat)" />
                    <rect x={4} y={4} width={w - 8} height={h - 8} rx={Math.min(w - 8, h - 8) / 2} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  </g>
                ) : table.shape === 'event_table' ? (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={10} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={8} fill="#ffffff" />
                  </g>
                ) : table.shape === 'coffee_table' ? (
                  <g filter="url(#drop-shadow)">
                    <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 - 4} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2} fill="url(#marble-grad)" />
                  </g>
                ) : table.shape === 'picnic_table' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Benches */}
                    <rect x={0} y={-10} width={w} height={10} rx={2} fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
                    <rect x={0} y={h} width={w} height={10} rx={2} fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
                    {/* Table */}
                    <rect x={0} y={0} width={w} height={h} rx={2} fill="#d97706" stroke="#78350f" strokeWidth="2" />
                    <line x1={0} y1={h / 3} x2={w} y2={h / 3} stroke="#78350f" strokeWidth="1" />
                    <line x1={0} y1={(h / 3) * 2} x2={w} y2={(h / 3) * 2} stroke="#78350f" strokeWidth="1" />
                  </g>
                ) : table.shape === 'patio_table' ? (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={4} fill="#b45309" stroke="#78350f" strokeWidth="2" />
                    <rect x={0} y={0} width={w} height={h} rx={4} fill="url(#slat-wood-pat)" />
                  </g>
                ) : table.shape === 'booth' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Booth Seating Wraparound */}
                    <path d={`M -10 -10 L ${w + 10} -10 L ${w + 10} ${h / 2} L ${w - 5} ${h / 2} L ${w - 5} 5 L 5 5 L 5 ${h / 2} L -10 ${h / 2} Z`} fill="url(#booth-leather-grad)" stroke="#022c22" strokeWidth="2" />
                    {/* Table Surface */}
                    <rect x={10} y={10} width={w - 20} height={h - 10} rx={4} fill="#301a0e" />
                    <rect x={12} y={12} width={w - 24} height={h - 14} rx={2} fill="url(#wood-grain-pat)" />
                    <rect x={14} y={14} width={w - 28} height={h - 18} rx={1} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  </g>
                ) : table.shape === 'corner_booth' ? (
                  <g filter="url(#drop-shadow)">
                    {/* L-Shaped Booth Seating */}
                    <path d={`M -15 -15 L ${w + 5} -15 L ${w + 5} 0 L 0 0 L 0 ${h + 15} L -15 ${h + 15} Z`} fill="url(#booth-leather-grad)" stroke="#022c22" strokeWidth="2" />
                    {/* Table Surface */}
                    <rect x={5} y={5} width={w - 10} height={h - 10} rx={4} fill="#301a0e" />
                    <rect x={7} y={7} width={w - 14} height={h - 14} rx={2} fill="url(#wood-grain-pat)" />
                  </g>
                ) : table.shape === 'banquette' ? (
                  <g filter="url(#drop-shadow)">
                    {/* Linear Booth Seating Top */}
                    <rect x={-5} y={-15} width={w + 10} height={20} rx={2} fill="url(#fabric-grad)" stroke="#3f3f46" strokeWidth="2" />
                    {/* Table Surface */}
                    <rect x={0} y={15} width={w} height={h - 15} rx={4} fill="#301a0e" />
                    <rect x={2} y={17} width={w - 4} height={h - 19} rx={2} fill="url(#wood-grain-pat)" />
                  </g>
                ) : table.shape === 'bar' ? (
                  <g filter="url(#drop-shadow-high)">
                    {/* Metallic base ring visible underneath for pub feel */}
                    <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 + 4} fill="none" stroke="#94a3b8" strokeWidth="3" opacity="0.6" />
                    <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 + 2} fill="none" stroke="#475569" strokeWidth="1" opacity="0.8" />

                    <rect x={0} y={0} width={w} height={h} rx={Math.min(w, h) / 2} fill="#1e293b" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={Math.min(w, h) / 2 - 2} fill="url(#wood-grain-pat)" />
                    {/* Inner metallic rim */}
                    <rect x={6} y={6} width={w - 12} height={h - 12} rx={Math.min(w, h) / 2 - 6} fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.4" />
                  </g>
                ) : table.shape === 'high' ? (
                  <g filter="url(#drop-shadow-high)">
                    {/* Metallic footrest rail along the bottom */}
                    <line x1={10} y1={h + 6} x2={w - 10} y2={h + 6} stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                    <line x1={10} y1={h + 6} x2={w - 10} y2={h + 6} stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                    <line x1={20} y1={h} x2={20} y2={h + 6} stroke="#475569" strokeWidth="3" />
                    <line x1={w - 20} y1={h} x2={w - 20} y2={h + 6} stroke="#475569" strokeWidth="3" />

                    {/* Table Surface */}
                    <rect x={0} y={0} width={w} height={h} rx={4} fill="#301a0e" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={2} fill="url(#wood-grain-pat)" />
                  </g>
                ) : table.shape === 'connectable' ? (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={12} fill="#301a0e" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={10} fill="url(#wood-grain-pat)" />
                    <line x1={w / 2} y1={2} x2={w / 2} y2={h - 2} stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                    {/* Left and Right connectors */}
                    <rect x={-8} y={h / 2 - 6} width={10} height={12} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                    <rect x={-4} y={h / 2 - 4} width={4} height={8} fill="#8a5a3a" />
                    <rect x={w - 2} y={h / 2 - 6} width={10} height={12} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                    <rect x={w} y={h / 2 - 4} width={4} height={8} fill="#8a5a3a" />
                  </g>
                ) : table.shape === 'expandable' ? (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={12} fill="#301a0e" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={10} fill="url(#wood-grain-pat)" />
                    <line x1={w * 0.3} y1={2} x2={w * 0.3} y2={h - 2} stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="6,4" />
                    <line x1={w * 0.7} y1={2} x2={w * 0.7} y2={h - 2} stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="6,4" />
                    {/* Left and Right connectors */}
                    <rect x={-8} y={h / 2 - 6} width={10} height={12} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                    <rect x={-4} y={h / 2 - 4} width={4} height={8} fill="#8a5a3a" />
                    <rect x={w - 2} y={h / 2 - 6} width={10} height={12} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                    <rect x={w} y={h / 2 - 4} width={4} height={8} fill="#8a5a3a" />
                  </g>
                ) : table.shape === 'foldable' ? (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={12} fill="#301a0e" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={10} fill="url(#wood-grain-pat)" />
                    <line x1={w / 2} y1={2} x2={w / 2} y2={h - 2} stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                    {/* Fold line handles */}
                    <rect x={w / 2 - 8} y={h - 4} width={16} height={6} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                    <rect x={w / 2 - 4} y={h - 2} width={8} height={4} fill="#8a5a3a" />
                    <rect x={-8} y={h / 2 - 6} width={10} height={12} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                    <rect x={w - 2} y={h / 2 - 6} width={10} height={12} rx={2} fill="#d4b895" stroke="#a46f44" strokeWidth="1" />
                  </g>
                ) : (
                  <g filter="url(#drop-shadow)">
                    <rect x={0} y={0} width={w} height={h} rx={6} fill="#301a0e" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={4} fill="url(#wood-grain-pat)" />
                    <rect x={4} y={4} width={w - 8} height={h - 8} rx={2} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  </g>
                )}

                {renderChairs(table)}

                <text x={w / 2} y={h / 2} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.9)" fontSize="14" fontWeight="600" className="pointer-events-none" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                  {table.tableNumber}
                </text>

                {table.isVip && (
                  <g transform={`translate(${w - 15}, -15)`}>
                    <rect width="30" height="16" rx="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                    <text x="15" y="11" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f" className="pointer-events-none">VIP</text>
                  </g>
                )}

                {isSelected && !readOnly && (
                  <g>
                    <rect x="-4" y="-4" width={w + 8} height={h + 8} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" />
                    <line x1={w / 2} y1="-4" x2={w / 2} y2="-24" stroke="#3b82f6" strokeWidth="1" />
                    <circle cx={w / 2} cy="-24" r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-crosshair" onPointerDown={(e) => startRotate(e, table._id || table.id, 'table', { x: pos.x + w / 2, y: pos.y + h / 2 })} />
                    <circle cx={w + 4} cy={h + 4} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-nwse-resize" onPointerDown={(e) => startResize(e, table._id || table.id, 'table', { w, h }, rot)} />
                  </g>
                )}
              </g>
            )
          })}

          {/* Render High-Fidelity Elements */}
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
                transform={`translate(${pos.x}, ${pos.y}) rotate(${rot}, ${w / 2}, ${h / 2})`}
                onPointerDown={(e) => startDrag(e, element.id, 'element', pos)}
                className={readOnly ? "cursor-pointer" : isSelected ? "cursor-grabbing" : "cursor-grab"}
              >
                {/* ARCHITECTURE */}
                {element.type === 'wall' && (
                  <g>
                    <rect width={w} height={h} fill="#334155" />
                    <rect x={1} y={1} width={w - 2} height={h - 2} fill="#475569" />
                    <g transform={`translate(0, ${-20})`}>
                      <path d={`M 0 0 L ${w} 0`} fill="none" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3,3" />
                      <path d={`M 0 -3 L 0 3`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                      <path d={`M ${w} -3 L ${w} 3`} fill="none" stroke="#9ca3af" strokeWidth={1} />
                      <rect x={w / 2 - 15} y={-8} width={30} height={16} fill="white" />
                      <text x={w / 2} y={3} fontSize={10} fill="#4b5563" textAnchor="middle" fontWeight="500">{Math.floor(w / 10)}' {Math.round(w % 10)}"</text>
                    </g>
                  </g>
                )}
                {element.type === 'corner_wall' && (
                  <g>
                    <path d={`M 0 0 L 10 0 L 10 ${h - 10} L ${w} ${h - 10} L ${w} ${h} L 0 ${h} Z`} fill="#334155" />
                    <path d={`M 1 1 L 9 1 L 9 ${h - 9} L ${w - 1} ${h - 9} L ${w - 1} ${h - 1} L 1 ${h - 1} Z`} fill="#475569" />
                  </g>
                )}
                {element.type === 'curved_wall' && (
                  <g>
                    <path d={`M 0 ${h} Q ${w / 2} 0 ${w} ${h} L ${w} ${h - 10} Q ${w / 2} -10 0 ${h - 10} Z`} fill="#475569" stroke="#334155" strokeWidth="2" />
                  </g>
                )}
                {element.type === 'divider' && (
                  <rect width={w} height={h} fill="none" stroke="#64748b" strokeWidth={h} strokeDasharray="10,5" />
                )}
                {element.type === 'glass_wall' && (
                  <g>
                    <rect width={w} height={h} fill="#94a3b8" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} fill="url(#glass-grad)" stroke="#0ea5e9" strokeWidth="1" />
                    <line x1={w / 3} y1={2} x2={w / 3} y2={h - 2} stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />
                    <line x1={(w / 3) * 2} y1={2} x2={(w / 3) * 2} y2={h - 2} stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />
                  </g>
                )}
                {element.type === 'door' && (
                  <g>
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="#cbd5e1" strokeWidth="4" />
                    <path d={`M 0 ${h / 2} A ${w} ${w} 0 0 1 ${w} ${h / 2 + w}`} fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
                    <rect x={0} y={h / 2} width={4} height={w} fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                  </g>
                )}
                {element.type === 'double_door' && (
                  <g>
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="#cbd5e1" strokeWidth="4" />
                    <path d={`M 0 ${h / 2} A ${w / 2} ${w / 2} 0 0 1 ${w / 2} ${h / 2 + w / 2}`} fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
                    <path d={`M ${w} ${h / 2} A ${w / 2} ${w / 2} 0 0 0 ${w / 2} ${h / 2 + w / 2}`} fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
                    <rect x={0} y={h / 2} width={4} height={w / 2} fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                    <rect x={w - 4} y={h / 2} width={4} height={w / 2} fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                  </g>
                )}
                {element.type === 'sliding_door' && (
                  <g>
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="#94a3b8" strokeWidth="2" />
                    <rect x={0} y={h / 2 - 3} width={w / 2 + 5} height={3} fill="url(#glass-grad)" stroke="#0ea5e9" strokeWidth="0.5" />
                    <rect x={w / 2 - 5} y={h / 2} width={w / 2 + 5} height={3} fill="url(#glass-grad)" stroke="#0ea5e9" strokeWidth="0.5" />
                    <line x1={10} y1={h / 2 - 2} x2={20} y2={h / 2 - 2} stroke="#0284c7" strokeWidth="1" />
                  </g>
                )}
                {element.type === 'window' && (
                  <g>
                    <rect width={w} height={h} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                    <rect x={4} y={2} width={w / 2 - 4} height={h - 4} fill="url(#glass-grad)" stroke="#0ea5e9" strokeWidth="0.5" />
                    <rect x={w / 2} y={2} width={w / 2 - 4} height={h - 4} fill="url(#glass-grad)" stroke="#0ea5e9" strokeWidth="0.5" />
                    <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#94a3b8" strokeWidth="2" />
                  </g>
                )}
                {element.type === 'arch' && (
                  <g>
                    <rect width={w} height={h} fill="none" />
                    <rect x={0} y={0} width={4} height={h} fill="#475569" />
                    <rect x={w - 4} y={0} width={4} height={h} fill="#475569" />
                    <line x1={4} y1={h / 2} x2={w - 4} y2={h / 2} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                  </g>
                )}
                {element.type === 'column' && (
                  <g filter="url(#drop-shadow-sm)">
                    {w === h ? <rect width={w} height={h} fill="#94a3b8" stroke="#475569" strokeWidth="2" /> : <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2} fill="#94a3b8" stroke="#475569" strokeWidth="2" />}
                    <line x1={0} y1={0} x2={w} y2={h} stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
                  </g>
                )}
                {element.type === 'stairs' && (
                  <g stroke="#64748b" strokeWidth="1" fill="none">
                    <rect width={w} height={h} stroke="#475569" strokeWidth="2" />
                    {[...Array(6)].map((_, i) => <line key={i} x1={(w / 6) * (i + 1)} y1={0} x2={(w / 6) * (i + 1)} y2={h} />)}
                    <path d={`M 10 ${h / 2} L ${w - 10} ${h / 2} L ${w - 15} ${h / 2 - 5} M ${w - 10} ${h / 2} L ${w - 15} ${h / 2 + 5}`} stroke="#3b82f6" strokeWidth="2" />
                  </g>
                )}
                {element.type === 'escalator' && (
                  <g stroke="#64748b" strokeWidth="1" fill="none">
                    <rect width={w} height={h} fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                    <rect x={0} y={0} width={w} height={5} fill="#475569" />
                    <rect x={0} y={h - 5} width={w} height={5} fill="#475569" />
                    {[...Array(10)].map((_, i) => <line key={i} x1={(w / 10) * (i + 1)} y1={5} x2={(w / 10) * (i + 1)} y2={h - 5} />)}
                    <path d={`M 15 ${h / 2} L ${w - 15} ${h / 2} L ${w - 20} ${h / 2 - 4} M ${w - 15} ${h / 2} L ${w - 20} ${h / 2 + 4}`} stroke="#10b981" strokeWidth="2" />
                  </g>
                )}

                {/* FURNITURE */}
                {element.type === 'sofa' && (
                  <g filter="url(#drop-shadow)">
                    <rect width={w} height={h} rx={4} fill="url(#fabric-grad)" stroke="#18181b" strokeWidth="2" />
                    <rect x={w * 0.1} y={5} width={w * 0.8} height={h - 15} rx={2} fill="#52525b" stroke="#3f3f46" strokeWidth="1" />
                    <rect x={0} y={0} width={w * 0.15} height={h} rx={2} fill="#3f3f46" />
                    <rect x={w * 0.85} y={0} width={w * 0.15} height={h} rx={2} fill="#3f3f46" />
                  </g>
                )}
                {element.type === 'bench' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Wooden base */}
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={2} fill="url(#wood-grain-pat)" stroke="#451a03" strokeWidth="2" />
                    {/* Leather cushion top */}
                    <rect x={4} y={4} width={w - 8} height={h - 8} rx={2} fill="url(#fabric-grad)" stroke="#18181b" strokeWidth="1" />
                    {/* Tufting lines */}
                    <line x1={w * 0.25} y1={4} x2={w * 0.25} y2={h - 4} stroke="#18181b" strokeWidth="1" opacity="0.4" />
                    <line x1={w * 0.5} y1={4} x2={w * 0.5} y2={h - 4} stroke="#18181b" strokeWidth="1" opacity="0.4" />
                    <line x1={w * 0.75} y1={4} x2={w * 0.75} y2={h - 4} stroke="#18181b" strokeWidth="1" opacity="0.4" />
                  </g>
                )}
                {element.type === 'lounge_chair' && (
                  <g filter="url(#drop-shadow)">
                    <circle cx={w / 2} cy={h / 2} r={w / 2} fill="url(#fabric-grad)" stroke="#18181b" strokeWidth="2" />
                    <path d={`M ${w * 0.2} ${h * 0.3} Q ${w / 2} ${h * 0.1} ${w * 0.8} ${h * 0.3} L ${w * 0.7} ${h * 0.8} L ${w * 0.3} ${h * 0.8} Z`} fill="#52525b" stroke="#3f3f46" strokeWidth="1" />
                  </g>
                )}
                {element.type === 'wooden_chair' && (
                  <ChairWood cx={w / 2} cy={h / 2} angleDeg={0} scale={w / 20} shadow={true} />
                )}
                {element.type === 'armchair' && (
                  <ChairGrey cx={w / 2} cy={h / 2} angleDeg={0} scale={w / 20} shadow={true} />
                )}
                {element.type === 'sofa_seat' && (
                  <g filter="url(#drop-shadow)">
                    {/* Backrest */}
                    <rect x={0} y={0} width={w} height={h * 0.3} rx={4} fill="#27272a" stroke="#18181b" strokeWidth="2" />
                    {/* Left Armrest */}
                    <rect x={0} y={h * 0.1} width={w * 0.2} height={h * 0.8} rx={4} fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
                    {/* Right Armrest */}
                    <rect x={w * 0.8} y={h * 0.1} width={w * 0.2} height={h * 0.8} rx={4} fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
                    {/* Cushion */}
                    <rect x={w * 0.15} y={h * 0.25} width={w * 0.7} height={h * 0.7} rx={4} fill="#52525b" stroke="#27272a" strokeWidth="2" />
                    {/* Cushion highlight/detail */}
                    <rect x={w * 0.2} y={h * 0.3} width={w * 0.6} height={h * 0.6} rx={2} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  </g>
                )}
                {element.type === 'bar_stool' && (
                  <StoolBar cx={w / 2} cy={h / 2} angleDeg={0} scale={w / 20} shadow={true} />
                )}
                {element.type === 'baby_chair' && (
                  <g filter="url(#drop-shadow)">
                    {/* High Legs splayed out */}
                    <circle cx={w * 0.2} cy={h * 0.2} r={3} fill="#475569" />
                    <circle cx={w * 0.8} cy={h * 0.2} r={3} fill="#475569" />
                    <circle cx={w * 0.1} cy={h * 0.8} r={3} fill="#475569" />
                    <circle cx={w * 0.9} cy={h * 0.8} r={3} fill="#475569" />

                    {/* Seat Back */}
                    <path d={`M ${w * 0.25} ${h * 0.2} L ${w * 0.75} ${h * 0.2} A ${w * 0.25} ${h * 0.25} 0 0 1 ${w * 0.75} ${h * 0.6} L ${w * 0.25} ${h * 0.6} A ${w * 0.25} ${h * 0.25} 0 0 1 ${w * 0.25} ${h * 0.2}`} fill="#0ea5e9" stroke="#0369a1" strokeWidth="2" />
                    {/* Seat bottom */}
                    <rect x={w * 0.3} y={h * 0.4} width={w * 0.4} height={h * 0.3} rx={4} fill="#e0f2fe" />
                    {/* Tray */}
                    <rect x={w * 0.15} y={h * 0.65} width={w * 0.7} height={h * 0.25} rx={6} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    {/* Cup holder */}
                    <circle cx={w * 0.75} cy={h * 0.77} r={4} fill="#e2e8f0" />
                  </g>
                )}
                {element.type === 'bar_counter' && (
                  <g filter="url(#drop-shadow)">
                    <rect width={w} height={h} rx={4} fill="#1e293b" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={2} fill="url(#wood-grain-pat)" />
                    <rect x={4} y={4} width={w - 8} height={h - 8} rx={1} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  </g>
                )}
                {element.type === 'reception_desk' && (
                  <g filter="url(#drop-shadow)">
                    {/* Base wood L-shape */}
                    <path d={`M 0 0 L ${w} 0 L ${w} ${h} L ${w - 20} ${h} L ${w - 20} 20 L 0 20 Z`} fill="url(#wood-grain-pat)" stroke="#301a0e" strokeWidth="2" />
                    {/* Marble top counter (offset) */}
                    <path d={`M 2 2 L ${w - 2} 2 L ${w - 2} ${h - 2} L ${w - 18} ${h - 2} L ${w - 18} 18 L 2 18 Z`} fill="url(#marble-grad)" stroke="#cbd5e1" strokeWidth="1" />
                    {/* Computer monitor */}
                    <rect x={w / 2} y={5} width={24} height={8} rx={1} fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
                    {/* Computer stand */}
                    <rect x={w / 2 + 8} y={13} width={8} height={4} fill="#475569" />
                  </g>
                )}
                {element.type === 'cashier' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Counter base */}
                    <rect width={w} height={h} rx={2} fill="url(#wood-grain-pat)" stroke="#301a0e" strokeWidth="2" />
                    {/* Customer facing raised ledge */}
                    <rect x={0} y={h - 10} width={w} height={10} rx={1} fill="url(#marble-grad)" stroke="#94a3b8" strokeWidth="1" />
                    {/* POS System */}
                    <rect x={w / 2 - 12} y={h / 2 - 10} width={24} height={16} rx={2} fill="#1e293b" />
                    <rect x={w / 2 - 10} y={h / 2 - 8} width={20} height={12} fill="#38bdf8" opacity="0.9" />
                    {/* Receipt printer */}
                    <rect x={w / 2 + 15} y={h / 2 - 6} width={10} height={12} rx={1} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  </g>
                )}
                {element.type === 'buffet' && (
                  <g filter="url(#drop-shadow)">
                    {/* Long wooden table */}
                    <rect width={w} height={h} rx={4} fill="url(#wood-grain-pat)" stroke="#301a0e" strokeWidth="2" />
                    <rect x={4} y={4} width={w - 8} height={h - 8} rx={2} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Chafing dishes (metallic rectangles with glass lids) */}
                    {[...Array(Math.floor(w / 35))].map((_, i) => (
                      <g key={i} transform={`translate(${15 + i * 35}, ${h / 2 - 12})`}>
                        <rect width={24} height={24} rx={2} fill="url(#metal-grad)" stroke="#94a3b8" strokeWidth="1" />
                        <rect x={2} y={2} width={20} height={20} rx={1} fill="#e2e8f0" opacity="0.6" />
                        <line x1={12} y1={4} x2={12} y2={20} stroke="#ffffff" strokeWidth="2" opacity="0.8" />
                      </g>
                    ))}
                  </g>
                )}
                {element.type === 'waiting_bench' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Metal frame */}
                    <rect width={w} height={h} rx={2} fill="none" stroke="#475569" strokeWidth="3" />
                    {/* Tufted Leather cushions */}
                    <rect x={2} y={2} width={w - 4} height={h - 4} rx={2} fill="url(#fabric-grad)" stroke="#18181b" strokeWidth="1" />
                    {[...Array(Math.floor(w / 20))].map((_, i) => <line key={i} x1={20 * (i + 1)} y1={2} x2={20 * (i + 1)} y2={h - 2} stroke="#18181b" strokeWidth="1" opacity="0.4" />)}
                  </g>
                )}
                {element.type === 'coat_rack' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Round heavy base */}
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 4} fill="url(#metal-grad)" stroke="#475569" strokeWidth="2" />
                    <circle cx={w / 2} cy={h / 2} r={w / 2 - 6} fill="none" stroke="#94a3b8" strokeWidth="1" />
                    {/* Hooks projecting outwards */}
                    <path d={`M ${w / 2} 4 L ${w / 2} ${h - 4} M 4 ${h / 2} L ${w - 4} ${h / 2} M ${w * 0.2} ${h * 0.2} L ${w * 0.8} ${h * 0.8} M ${w * 0.2} ${h * 0.8} L ${w * 0.8} ${h * 0.2}`} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                    {/* Central column top */}
                    <circle cx={w / 2} cy={h / 2} r={6} fill="#0f172a" />
                    <circle cx={w / 2} cy={h / 2} r={3} fill="#94a3b8" />
                  </g>
                )}
                {element.type === 'wine_rack' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} fill="#1c1917" stroke="#44403c" strokeWidth="2" />
                    <pattern id="wine-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="3" fill="#78350f" />
                    </pattern>
                    <rect x={2} y={2} width={w - 4} height={h - 4} fill="url(#wine-grid)" />
                  </g>
                )}
                {element.type === 'cabinet' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Cabinet body */}
                    <rect width={w} height={h} fill="#1c1917" stroke="#0c0a09" strokeWidth="2" />
                    {/* Wood top surface */}
                    <rect x={2} y={2} width={w - 4} height={h - 8} fill="url(#wood-grain-pat)" />
                    {/* Doors (seen from top, indicated by front edge division) */}
                    <rect x={0} y={h - 4} width={w / 2} height={4} fill="#44403c" stroke="#1c1917" strokeWidth="1" />
                    <rect x={w / 2} y={h - 4} width={w / 2} height={4} fill="#44403c" stroke="#1c1917" strokeWidth="1" />
                    {/* Front Handles */}
                    <rect x={w / 2 - 10} y={h - 4} width={8} height={2} fill="#d4d4d8" />
                    <rect x={w / 2 + 2} y={h - 4} width={8} height={2} fill="#d4d4d8" />
                  </g>
                )}

                {/* KITCHEN */}
                {element.type === 'kitchen_area' && (
                  <g>
                    <pattern id="tile-pat" width="10" height="10" patternUnits="userSpaceOnUse">
                      <rect width="10" height="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
                    </pattern>
                    <rect width={w} height={h} fill="url(#tile-pat)" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                    <text x={w / 2} y={h / 2} fontSize="14" fill="#94a3b8" textAnchor="middle" dominantBaseline="central" className="pointer-events-none">Kitchen Zone</text>
                  </g>
                )}
                {element.type === 'prep_table' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={2} fill="url(#metal-grad)" stroke="#94a3b8" strokeWidth="1" />
                    <rect x={2} y={2} width={w - 4} height={h - 4} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                  </g>
                )}
                {element.type === 'sink' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={2} fill="url(#metal-grad)" stroke="#94a3b8" strokeWidth="1" />
                    <rect x={w * 0.1} y={h * 0.2} width={w * 0.8} height={h * 0.7} rx={4} fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx={w / 2} cy={h * 0.55} r={4} fill="#1e293b" />
                    <path d={`M ${w / 2} ${h * 0.1} L ${w / 2} ${h * 0.3} Q ${w / 2} ${h * 0.4} ${w / 2} ${h * 0.45}`} fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                  </g>
                )}
                {element.type === 'grill' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={2} fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                    <rect x={2} y={h * 0.2} width={w - 4} height={h * 0.7} fill="#334155" />
                    {[...Array(Math.floor(w / 6))].map((_, i) => <line key={i} x1={6 * (i + 1)} y1={h * 0.2} x2={6 * (i + 1)} y2={h * 0.9} stroke="#0f172a" strokeWidth="2" />)}
                    <circle cx={w * 0.2} cy={h * 0.1} r={2} fill="#ef4444" />
                    <circle cx={w * 0.8} cy={h * 0.1} r={2} fill="#ef4444" />
                  </g>
                )}
                {element.type === 'oven' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={2} fill="url(#metal-grad)" stroke="#94a3b8" strokeWidth="1" />
                    <circle cx={w * 0.3} cy={h * 0.4} r={8} fill="#ef4444" opacity="0.8" />
                    <circle cx={w * 0.7} cy={h * 0.4} r={8} fill="#ef4444" opacity="0.8" />
                    <circle cx={w * 0.3} cy={h * 0.7} r={8} fill="#1e293b" />
                    <circle cx={w * 0.7} cy={h * 0.7} r={8} fill="#1e293b" />
                    <rect x={w * 0.2} y={h * 0.1} width={w * 0.6} height={h * 0.1} rx={1} fill="#0f172a" />
                  </g>
                )}
                {element.type === 'refrigerator' && (
                  <g filter="url(#drop-shadow)">
                    <rect width={w} height={h} rx={2} fill="url(#metal-grad)" stroke="#64748b" strokeWidth="2" />
                    <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#475569" strokeWidth="2" />
                    <rect x={w / 2 - 6} y={h / 2 - 15} width={3} height={30} rx={1} fill="#cbd5e1" />
                    <rect x={w / 2 + 3} y={h / 2 - 15} width={3} height={30} rx={1} fill="#cbd5e1" />
                  </g>
                )}
                {element.type === 'dishwasher' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={2} fill="url(#metal-grad)" stroke="#94a3b8" strokeWidth="1" />
                    <rect x={w * 0.1} y={h * 0.1} width={w * 0.8} height={h * 0.15} rx={1} fill="#1e293b" />
                    <circle cx={w * 0.8} cy={h * 0.175} r={2} fill="#22c55e" />
                    <rect x={w * 0.2} y={h * 0.3} width={w * 0.6} height={h * 0.6} rx={1} fill="#e2e8f0" stroke="#cbd5e1" />
                  </g>
                )}
                {element.type === 'storage_shelf' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} fill="none" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={0} y1={h / 3} x2={w} y2={h / 3} stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={0} y1={(h / 3) * 2} x2={w} y2={(h / 3) * 2} stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#cbd5e1" strokeWidth="2" />
                  </g>
                )}

                {/* FACILITIES */}
                {element.type === 'restroom' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#0284c7" />
                    {/* Split line */}
                    <line x1={w / 2} y1={h * 0.1} x2={w / 2} y2={h * 0.9} stroke="white" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                    {/* Male */}
                    <circle cx={w * 0.28} cy={h * 0.25} r={h * 0.08} fill="white" />
                    <rect x={w * 0.18} y={h * 0.36} width={w * 0.2} height={h * 0.25} rx={2} fill="white" />
                    <rect x={w * 0.21} y={h * 0.6} width={w * 0.06} height={h * 0.25} fill="white" />
                    <rect x={w * 0.29} y={h * 0.6} width={w * 0.06} height={h * 0.25} fill="white" />
                    {/* Female */}
                    <circle cx={w * 0.72} cy={h * 0.25} r={h * 0.08} fill="white" />
                    <path d={`M ${w * 0.72} ${h * 0.36} L ${w * 0.58} ${h * 0.65} L ${w * 0.86} ${h * 0.65} Z`} fill="white" />
                    <rect x={w * 0.65} y={h * 0.65} width={w * 0.06} height={h * 0.2} fill="white" />
                    <rect x={w * 0.73} y={h * 0.65} width={w * 0.06} height={h * 0.2} fill="white" />
                  </g>
                )}
                {element.type === 'mens_toilet' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#0284c7" />
                    <circle cx={w / 2} cy={h * 0.25} r={h * 0.12} fill="white" />
                    <rect x={w * 0.35} y={h * 0.4} width={w * 0.3} height={h * 0.3} rx={2} fill="white" />
                    <rect x={w * 0.4} y={h * 0.7} width={w * 0.08} height={h * 0.2} fill="white" />
                    <rect x={w * 0.52} y={h * 0.7} width={w * 0.08} height={h * 0.2} fill="white" />
                  </g>
                )}
                {element.type === 'womens_toilet' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#be185d" />
                    <circle cx={w / 2} cy={h * 0.25} r={h * 0.12} fill="white" />
                    <path d={`M ${w / 2} ${h * 0.4} L ${w * 0.25} ${h * 0.75} L ${w * 0.75} ${h * 0.75} Z`} fill="white" />
                    <rect x={w * 0.42} y={h * 0.75} width={w * 0.06} height={h * 0.15} fill="white" />
                    <rect x={w * 0.52} y={h * 0.75} width={w * 0.06} height={h * 0.15} fill="white" />
                  </g>
                )}
                {element.type === 'accessible_toilet' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#0284c7" />
                    {/* Wheel */}
                    <circle cx={w * 0.4} cy={h * 0.6} r={h * 0.2} fill="none" stroke="white" strokeWidth={h * 0.05} />
                    {/* Head */}
                    <circle cx={w * 0.55} cy={h * 0.25} r={h * 0.08} fill="white" />
                    {/* Body and legs */}
                    <path d={`M ${w * 0.55} ${h * 0.38} L ${w * 0.55} ${h * 0.55} L ${w * 0.75} ${h * 0.55} L ${w * 0.75} ${h * 0.75}`} fill="none" stroke="white" strokeWidth={h * 0.06} strokeLinecap="round" strokeLinejoin="round" />
                    {/* Arm */}
                    <path d={`M ${w * 0.55} ${h * 0.45} L ${w * 0.4} ${h * 0.55}`} fill="none" stroke="white" strokeWidth={h * 0.05} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
                {element.type === 'utility_room' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#475569" />
                    {/* Wrench symbol */}
                    <path d={`M ${w * 0.65} ${h * 0.25} C ${w * 0.8} ${h * 0.2} ${w * 0.85} ${h * 0.4} ${w * 0.7} ${h * 0.45} L ${w * 0.4} ${h * 0.75} C ${w * 0.3} ${h * 0.85} ${w * 0.15} ${h * 0.75} ${w * 0.25} ${h * 0.6} L ${w * 0.55} ${h * 0.3} C ${w * 0.6} ${h * 0.15} ${w * 0.8} ${h * 0.15} ${w * 0.75} ${h * 0.2} Z`} fill="white" />
                    <circle cx={w * 0.62} cy={h * 0.38} r={w * 0.05} fill="#475569" />
                  </g>
                )}
                {element.type === 'elevator' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#64748b" />
                    {/* Doors */}
                    <rect x={w * 0.2} y={h * 0.2} width={w * 0.28} height={h * 0.6} fill="white" />
                    <rect x={w * 0.52} y={h * 0.2} width={w * 0.28} height={h * 0.6} fill="white" />
                    {/* Up arrow */}
                    <polygon points={`${w / 2},${h * 0.08} ${w * 0.4},${h * 0.16} ${w * 0.6},${h * 0.16}`} fill="white" />
                    {/* Down arrow */}
                    <polygon points={`${w / 2},${h * 0.92} ${w * 0.4},${h * 0.84} ${w * 0.6},${h * 0.84}`} fill="white" />
                  </g>
                )}
                {element.type === 'wheelchair' && (
                  <g>
                    {/* Designated floor zone */}
                    <rect width={w} height={h} rx={4} fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" />
                    {/* Wheelchair top-down graphic */}
                    {/* Large Rear Wheels */}
                    <rect x={w * 0.1} y={h * 0.15} width={w * 0.1} height={h * 0.7} rx={2} fill="#334155" />
                    <rect x={w * 0.8} y={h * 0.15} width={w * 0.1} height={h * 0.7} rx={2} fill="#334155" />
                    {/* Seat */}
                    <rect x={w * 0.25} y={h * 0.3} width={w * 0.5} height={h * 0.45} rx={4} fill="#1e293b" />
                    {/* Backrest */}
                    <rect x={w * 0.2} y={h * 0.1} width={w * 0.6} height={h * 0.2} rx={2} fill="#0f172a" />
                    {/* Footrests */}
                    <rect x={w * 0.3} y={h * 0.8} width={w * 0.15} height={h * 0.15} rx={2} fill="#94a3b8" />
                    <rect x={w * 0.55} y={h * 0.8} width={w * 0.15} height={h * 0.15} rx={2} fill="#94a3b8" />
                  </g>
                )}
                {element.type === 'ramp' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                    <line x1={0} y1={h * 0.2} x2={w} y2={h * 0.2} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={0} y1={h * 0.4} x2={w} y2={h * 0.4} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={0} y1={h * 0.6} x2={w} y2={h * 0.6} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={0} y1={h * 0.8} x2={w} y2={h * 0.8} stroke="#cbd5e1" strokeWidth="1" />
                    <path d={`M ${w * 0.2} ${h / 2} L ${w * 0.8} ${h / 2} M ${w * 0.6} ${h * 0.3} L ${w * 0.8} ${h / 2} L ${w * 0.6} ${h * 0.7}`} stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                )}
                {element.type === 'shaft' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                    <line x1={0} y1={0} x2={w} y2={h} stroke="#475569" strokeWidth="2" />
                    <line x1={0} y1={h} x2={w} y2={0} stroke="#475569" strokeWidth="2" />
                  </g>
                )}
                {element.type === 'emergency_exit' && (
                  <g filter="url(#drop-shadow-sm)">
                    <rect width={w} height={h} rx={4} fill="#16a34a" />
                    {/* Door */}
                    <rect x={w * 0.2} y={h * 0.25} width={w * 0.3} height={h * 0.5} fill="none" stroke="white" strokeWidth="2" />
                    {/* Arrow leaving the door */}
                    <path d={`M ${w * 0.45} ${h * 0.5} L ${w * 0.75} ${h * 0.5} M ${w * 0.65} ${h * 0.4} L ${w * 0.75} ${h * 0.5} L ${w * 0.65} ${h * 0.6}`} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                )}

                {/* OUTDOOR & DECORATION */}
                {element.type === 'plant' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Pot */}
                    <circle cx={w / 2} cy={h / 2} r={w * 0.25} fill="#78350f" stroke="#451a03" strokeWidth="2" />
                    {/* Leaves radiating from center */}
                    {[...Array(6)].map((_, i) => (
                      <g key={i} transform={`rotate(${i * 60}, ${w / 2}, ${h / 2})`}>
                        <path d={`M ${w / 2} ${h / 2} Q ${w * 0.6} ${h * 0.3} ${w / 2} ${h * 0.1} Q ${w * 0.4} ${h * 0.3} ${w / 2} ${h / 2} Z`} fill="#16a34a" stroke="#14532d" strokeWidth="1" />
                        <line x1={w / 2} y1={h / 2} x2={w / 2} y2={h * 0.15} stroke="#14532d" strokeWidth="1" />
                      </g>
                    ))}
                    <circle cx={w / 2} cy={h / 2} r={w * 0.05} fill="#14532d" />
                  </g>
                )}
                {element.type === 'tree' && (
                  <g filter="url(#drop-shadow)">
                    {/* Shadow underneath */}
                    <circle cx={w / 2 + 2} cy={h / 2 + 2} r={w * 0.45} fill="rgba(0,0,0,0.15)" />
                    {/* Main canopy */}
                    <path d={`M ${w / 2} ${h * 0.05} 
                             A ${w * 0.2} ${h * 0.2} 0 0 1 ${w * 0.8} ${h * 0.25} 
                             A ${w * 0.25} ${h * 0.25} 0 0 1 ${w * 0.9} ${h * 0.6}
                             A ${w * 0.2} ${h * 0.2} 0 0 1 ${w * 0.6} ${h * 0.9}
                             A ${w * 0.25} ${h * 0.25} 0 0 1 ${w * 0.2} ${h * 0.8}
                             A ${w * 0.2} ${h * 0.2} 0 0 1 ${w * 0.1} ${h * 0.4}
                             A ${w * 0.25} ${h * 0.25} 0 0 1 ${w / 2} ${h * 0.05} Z`}
                      fill="#15803d" stroke="#14532d" strokeWidth="2" />
                    {/* Inner texture highlights */}
                    <path d={`M ${w * 0.4} ${h * 0.2} A ${w * 0.15} ${h * 0.15} 0 0 1 ${w * 0.7} ${h * 0.4} A ${w * 0.15} ${h * 0.15} 0 0 1 ${w * 0.5} ${h * 0.7} A ${w * 0.15} ${h * 0.15} 0 0 1 ${w * 0.3} ${h * 0.5} A ${w * 0.15} ${h * 0.15} 0 0 1 ${w * 0.4} ${h * 0.2} Z`} fill="#22c55e" opacity="0.6" />
                    <circle cx={w / 2} cy={h / 2} r={w * 0.06} fill="#78350f" />
                  </g>
                )}
                {element.type === 'umbrella' && (
                  <g filter="url(#drop-shadow)">
                    {/* Octagon canopy base */}
                    <polygon points={`${w * 0.3},0 ${w * 0.7},0 ${w},${h * 0.3} ${w},${h * 0.7} ${w * 0.7},${h} ${w * 0.3},${h} 0,${h * 0.7} 0,${h * 0.3}`} fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
                    {/* Ribs */}
                    <line x1={w / 2} y1={h / 2} x2={w * 0.3} y2={0} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={w * 0.7} y2={0} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={w} y2={h * 0.3} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={w} y2={h * 0.7} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={w * 0.7} y2={h} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={w * 0.3} y2={h} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={0} y2={h * 0.7} stroke="#d97706" strokeWidth="1" />
                    <line x1={w / 2} y1={h / 2} x2={0} y2={h * 0.3} stroke="#d97706" strokeWidth="1" />
                    {/* Center cap */}
                    <circle cx={w / 2} cy={h / 2} r={w * 0.06} fill="#b45309" />
                  </g>
                )}
                {element.type === 'fence' && (
                  <g filter="url(#drop-shadow-sm)">
                    {/* Fence post track line */}
                    <rect x={0} y={h / 2 - 2} width={w} height={4} fill="#92400e" stroke="#78350f" strokeWidth="1" />
                    {/* Fence posts */}
                    {[...Array(Math.max(2, Math.floor(w / 20) + 1))].map((_, i) => (
                      <rect key={i} x={Math.min(i * 20, w - 10)} y={h / 2 - 5} width={10} height={10} rx={1} fill="url(#wood-grain-pat)" stroke="#451a03" strokeWidth="1.5" />
                    ))}
                  </g>
                )}
                {element.type === 'patio' && (
                  <g>
                    <pattern id={`stone-pat-${element.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
                      <rect width="30" height="30" fill="#94a3b8" />
                      <rect x="1" y="1" width="13" height="13" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
                      <rect x="15" y="1" width="14" height="28" rx="1" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                      <rect x="1" y="15" width="13" height="14" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
                    </pattern>
                    <rect width={w} height={h} rx={4} fill={`url(#stone-pat-${element.id})`} stroke="#64748b" strokeWidth="2" />
                  </g>
                )}
                {element.type === 'terrace_furniture' && (
                  <g filter="url(#drop-shadow)">
                    {/* Chairs (Wicker/Rattan style) */}
                    <circle cx={w * 0.15} cy={h / 2} r={w * 0.18} fill="#78350f" stroke="#451a03" strokeWidth="1" />
                    <circle cx={w * 0.15} cy={h / 2} r={w * 0.14} fill="url(#wood-grain-pat)" />

                    <circle cx={w * 0.85} cy={h / 2} r={w * 0.18} fill="#78350f" stroke="#451a03" strokeWidth="1" />
                    <circle cx={w * 0.85} cy={h / 2} r={w * 0.14} fill="url(#wood-grain-pat)" />

                    <circle cx={w / 2} cy={h * 0.15} r={w * 0.18} fill="#78350f" stroke="#451a03" strokeWidth="1" />
                    <circle cx={w / 2} cy={h * 0.15} r={w * 0.14} fill="url(#wood-grain-pat)" />

                    <circle cx={w / 2} cy={h * 0.85} r={w * 0.18} fill="#78350f" stroke="#451a03" strokeWidth="1" />
                    <circle cx={w / 2} cy={h * 0.85} r={w * 0.14} fill="url(#wood-grain-pat)" />

                    {/* Table (Glass/Metal) */}
                    <circle cx={w / 2} cy={h / 2} r={w * 0.35} fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                    <circle cx={w / 2} cy={h / 2} r={w * 0.35} fill="url(#glass-grad)" />
                    {/* Center umbrella hole */}
                    <circle cx={w / 2} cy={h / 2} r={3} fill="#1e293b" />
                  </g>
                )}

                {/* LABEL */}
                {element.type === 'label' && (() => {
                  const text = element.text || 'Label';
                  const lowerText = text.toLowerCase();

                  let bgColor = "rgba(255,255,255,0.95)";
                  let borderColor = "#cbd5e1";
                  let textColor = "#334155";
                  let Icon = null;

                  if (lowerText.includes('kitchen')) {
                    bgColor = "#fff1f2"; borderColor = "#fecdd3"; textColor = "#be123c"; Icon = ChefHat;
                  } else if (lowerText.includes('dining')) {
                    bgColor = "#eff6ff"; borderColor = "#bfdbfe"; textColor = "#1d4ed8"; Icon = Utensils;
                  } else if (lowerText.includes('vip')) {
                    bgColor = "#fefce8"; borderColor = "#fef08a"; textColor = "#a16207"; Icon = Crown;
                  } else if (lowerText.includes('terrace') || lowerText.includes('outdoor')) {
                    bgColor = "#f0fdf4"; borderColor = "#bbf7d0"; textColor = "#15803d"; Icon = TreePine;
                  } else if (lowerText.includes('smoking')) {
                    bgColor = "#f8fafc"; borderColor = "#cbd5e1"; textColor = "#475569"; Icon = Cigarette;
                  } else if (lowerText.includes('bar')) {
                    bgColor = "#faf5ff"; borderColor = "#e9d5ff"; textColor = "#7e22ce"; Icon = Martini;
                  } else if (lowerText.includes('waiting') || lowerText.includes('reception')) {
                    bgColor = "#f0fdfa"; borderColor = "#99f6e4"; textColor = "#0f766e"; Icon = Clock;
                  } else if (lowerText.includes('private')) {
                    bgColor = "#fdf4ff"; borderColor = "#f5d0fe"; textColor = "#a21caf"; Icon = DoorOpen;
                  } else if (lowerText.includes('cafe') || lowerText.includes('coffee')) {
                    bgColor = "#fffbeb"; borderColor = "#fde68a"; textColor = "#b45309"; Icon = Coffee;
                  }

                  const iconSize = Math.min(20, h * 0.4);
                  const maxTextWidth = w - (Icon ? iconSize + 24 : 16);
                  let fontSize = 14;
                  if (text.length * 8 > maxTextWidth) {
                    fontSize = Math.max(10, (maxTextWidth / text.length) * 1.5);
                  }

                  const textWidth = text.length * (fontSize * 0.55);
                  const totalWidth = (Icon ? iconSize + 6 : 0) + textWidth;
                  const startX = (w - totalWidth) / 2;

                  return (
                    <g filter="url(#drop-shadow-sm)">
                      <rect width={w} height={h} fill={bgColor} stroke={borderColor} strokeWidth="1.5" rx={6} />
                      {Icon && (
                        <Icon x={startX} y={(h - iconSize) / 2} size={iconSize} color={textColor} />
                      )}
                      <text
                        x={startX + (Icon ? iconSize + 6 : 0) + (textWidth / 2)}
                        y={h / 2}
                        fontSize={fontSize}
                        fill={textColor}
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="central"
                        letterSpacing="0.5"
                      >
                        {text}
                      </text>
                    </g>
                  );
                })()}

                {/* Fallback for unhandled elements */}
                {!['wall', 'corner_wall', 'curved_wall', 'divider', 'glass_wall', 'door', 'double_door', 'sliding_door', 'window', 'arch', 'column', 'stairs', 'escalator', 'sofa', 'bench', 'lounge_chair', 'wooden_chair', 'armchair', 'sofa_seat', 'bar_stool', 'baby_chair', 'bar_counter', 'reception_desk', 'cashier', 'buffet', 'waiting_bench', 'coat_rack', 'wine_rack', 'cabinet', 'kitchen_area', 'prep_table', 'sink', 'grill', 'oven', 'refrigerator', 'dishwasher', 'storage_shelf', 'restroom', 'mens_toilet', 'womens_toilet', 'accessible_toilet', 'utility_room', 'elevator', 'wheelchair', 'ramp', 'shaft', 'emergency_exit', 'plant', 'tree', 'umbrella', 'fence', 'patio', 'terrace_furniture', 'label'].includes(element.type) && (
                  <rect width={w} height={h} rx={4} fill={color} stroke="#334155" strokeWidth={1} filter="url(#drop-shadow-sm)" />
                )}

                {isSelected && !readOnly && (
                  <g>
                    <rect x="-4" y="-4" width={w + 8} height={h + 8} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" />
                    <line x1={w / 2} y1="-4" x2={w / 2} y2="-24" stroke="#3b82f6" strokeWidth="1" />
                    <circle cx={w / 2} cy="-24" r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-crosshair" onPointerDown={(e) => startRotate(e, element.id, 'element', { x: pos.x + w / 2, y: pos.y + h / 2 })} />
                    <circle cx={w + 4} cy={h + 4} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-nwse-resize" onPointerDown={(e) => startResize(e, element.id, 'element', { w, h }, rot)} />
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
