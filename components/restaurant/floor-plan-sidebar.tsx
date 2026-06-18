"use client"

import { useState } from "react"
import { PaintBucket, Layers } from "lucide-react"
import { ColorPalette } from "./color-palette"

interface Props {
  onAddTable: (shape: string, capacity: number, presetColor?: string) => void
  onAddElement: (type: string) => void
  activeColor: string
  onColorChange: (color: string) => void
}

function DragItem({
  label,
  payload,
  onClick,
  children,
}: {
  label?: string
  payload: object
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      draggable
      onDragStart={(e) => e.dataTransfer.setData("floor-plan-item", JSON.stringify(payload))}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-150 cursor-grab active:cursor-grabbing active:scale-95"
    >
      {children}
      {label && <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{label}</span>}
    </button>
  )
}

/* ── 3D Realistic Table Icons ── */

function ChairIcon({ className }: { className: string }) {
  return (
    <div className={`absolute w-[14px] h-[12px] rounded-sm bg-[#e6dbcc] shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-[#a4937e] ${className}`} />
  )
}

function TableWood({ className, children, style }: { className: string, children?: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div className={`bg-gradient-to-br from-[#8a5a3a] via-[#613c23] to-[#402615] shadow-[0_4px_8px_rgba(0,0,0,0.5)] border border-[#301a0e] relative z-10 flex items-center justify-center overflow-hidden ${className}`} style={style}>
      {/* Wood grain highlight */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.1) 2px,rgba(255,255,255,0.1) 3px)' }} />
      {children}
    </div>
  )
}

function Round2() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <TableWood className="w-8 h-8 rounded-full" />
      <ChairIcon className="left-0 top-1/2 -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-0 top-1/2 -translate-y-1/2 rounded-r-md w-1.5" />
    </div>
  )
}

function Round4() {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <TableWood className="w-10 h-10 rounded-full" />
      <ChairIcon className="left-0 top-1/2 -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-0 top-1/2 -translate-y-1/2 rounded-r-md w-1.5" />
      <ChairIcon className="top-0 left-1/2 -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="bottom-0 left-1/2 -translate-x-1/2 rounded-b-md h-1.5" />
    </div>
  )
}

function Oval6() {
  return (
    <div className="relative w-[70px] h-12 flex items-center justify-center">
      <TableWood className="w-[50px] h-8" style={{ borderRadius: '50%' }} />
      <ChairIcon className="left-0 top-1/2 -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-0 top-1/2 -translate-y-1/2 rounded-r-md w-1.5" />
      <ChairIcon className="top-0 left-[35%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="top-0 left-[65%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="bottom-0 left-[35%] -translate-x-1/2 rounded-b-md h-1.5" />
      <ChairIcon className="bottom-0 left-[65%] -translate-x-1/2 rounded-b-md h-1.5" />
    </div>
  )
}

function Square4() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <TableWood className="w-8 h-8 rounded-md" />
      <ChairIcon className="left-0 top-1/2 -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-0 top-1/2 -translate-y-1/2 rounded-r-md w-1.5" />
      <ChairIcon className="top-0 left-1/2 -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="bottom-0 left-1/2 -translate-x-1/2 rounded-b-md h-1.5" />
    </div>
  )
}

function Rect6() {
  return (
    <div className="relative w-[60px] h-12 flex items-center justify-center">
      <TableWood className="w-[44px] h-8 rounded-md" />
      <ChairIcon className="left-[2px] top-1/2 -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-[2px] top-1/2 -translate-y-1/2 rounded-r-md w-1.5" />
      <ChairIcon className="top-0 left-[35%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="top-0 left-[65%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="bottom-0 left-[35%] -translate-x-1/2 rounded-b-md h-1.5" />
      <ChairIcon className="bottom-0 left-[65%] -translate-x-1/2 rounded-b-md h-1.5" />
    </div>
  )
}

function Rect8() {
  return (
    <div className="relative w-[70px] h-12 flex items-center justify-center">
      <TableWood className="w-[54px] h-8 rounded-md" />
      <ChairIcon className="left-[2px] top-1/2 -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-[2px] top-1/2 -translate-y-1/2 rounded-r-md w-1.5" />
      <ChairIcon className="top-0 left-[25%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="top-0 left-[50%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="top-0 left-[75%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="bottom-0 left-[25%] -translate-x-1/2 rounded-b-md h-1.5" />
      <ChairIcon className="bottom-0 left-[50%] -translate-x-1/2 rounded-b-md h-1.5" />
      <ChairIcon className="bottom-0 left-[75%] -translate-x-1/2 rounded-b-md h-1.5" />
    </div>
  )
}

function UConfIcon() {
  return (
    <div className="relative w-[70px] h-[70px] flex items-center justify-center">
      <div className="absolute top-1 left-3 bottom-1 w-3 bg-gradient-to-br from-[#8a5a3a] via-[#613c23] to-[#402615] shadow-sm border border-[#301a0e]" />
      <div className="absolute top-1 right-3 bottom-1 w-3 bg-gradient-to-br from-[#8a5a3a] via-[#613c23] to-[#402615] shadow-sm border border-[#301a0e]" />
      <div className="absolute top-1 left-3 right-3 h-3 bg-gradient-to-br from-[#8a5a3a] via-[#613c23] to-[#402615] shadow-sm border border-[#301a0e]" />
      <ChairIcon className="top-0 left-[35%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="top-0 left-[65%] -translate-x-1/2 rounded-t-md h-1.5" />
      <ChairIcon className="left-1 top-[35%] -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="left-1 top-[65%] -translate-y-1/2 rounded-l-md w-1.5" />
      <ChairIcon className="right-1 top-[35%] -translate-y-1/2 rounded-r-md w-1.5" />
      <ChairIcon className="right-1 top-[65%] -translate-y-1/2 rounded-r-md w-1.5" />
    </div>
  )
}

/* ── Architecture Icons ── */

function WallIcon() {
  return <div className="w-8 h-2.5 bg-[#4b5563] shadow-sm rounded-[1px] border border-[#374151]" />
}

function DoorIcon() {
  return (
    <div className="w-6 h-8 bg-[#8a5a3a] border border-[#613c23] shadow-sm rounded-[2px] relative">
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-600 rounded-full" />
    </div>
  )
}

function WindowIcon() {
  return (
    <div className="w-8 h-8 bg-[#8a7f72] p-[2px] shadow-sm rounded-[2px] flex">
      <div className="flex-1 bg-[#e0f2fe] border-r border-[#8a7f72]" />
      <div className="flex-1 bg-[#e0f2fe]" />
    </div>
  )
}

function CornerWallIcon() {
  return (
    <div className="w-8 h-8 relative">
      <div className="absolute top-0 left-0 w-2.5 h-8 bg-[#4b5563] rounded-[1px] shadow-sm border border-[#374151]" />
      <div className="absolute top-0 left-0 w-8 h-2.5 bg-[#4b5563] rounded-[1px] shadow-sm border border-[#374151]" />
    </div>
  )
}

function LevelMarkerIcon() {
  return (
    <div className="w-8 h-8 relative flex items-center justify-center">
      <div className="absolute w-5 h-5 border border-gray-600 rounded-full" />
      <div className="absolute w-full h-[1px] bg-gray-600" />
      <div className="absolute h-full w-[1px] bg-gray-600" />
    </div>
  )
}

export function FloorPlanSidebar({ onAddTable, activeColor, onColorChange }: Props) {
  const [showPalette, setShowPalette] = useState(false)

  return (
    <div className="absolute top-4 left-4 bottom-4 w-[168px] bg-white shadow-xl rounded-2xl flex flex-col z-20 border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <h2 className="text-[13px] font-bold text-gray-800 tracking-tight">Builder</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        
        {/* ── ARCHITECTURE ── */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-3 px-1">Architecture</h3>
          <div className="grid grid-cols-2 gap-2">
            <DragItem label="Wall" payload={{ category: 'element', type: 'wall', width: 100, height: 10 }}>
              <WallIcon />
            </DragItem>
            <DragItem label="Door" payload={{ category: 'element', type: 'door', width: 40, height: 40 }}>
              <DoorIcon />
            </DragItem>
            <DragItem label="Window" payload={{ category: 'element', type: 'window', width: 60, height: 10 }}>
              <WindowIcon />
            </DragItem>
            <DragItem label="Corner Wall" payload={{ category: 'element', type: 'corner_wall', width: 60, height: 60 }}>
              <CornerWallIcon />
            </DragItem>
            <DragItem label="Level Marker" payload={{ category: 'element', type: 'level_marker', width: 40, height: 40 }}>
              <LevelMarkerIcon />
            </DragItem>
          </div>
        </div>

        {/* ── REALISTIC TABLES ── */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-3 px-1">Tables</h3>
          <div className="grid grid-cols-2 gap-2">
          <DragItem label="Round 2" payload={{ category: 'table', shape: 'round', capacity: 2 }} onClick={() => onAddTable('round', 2)}>
            <Round2 />
          </DragItem>
          <DragItem label="Square 4" payload={{ category: 'table', shape: 'square', capacity: 4 }} onClick={() => onAddTable('square', 4)}>
            <Square4 />
          </DragItem>
          
          <DragItem label="Round 4" payload={{ category: 'table', shape: 'round', capacity: 4 }} onClick={() => onAddTable('round', 4)}>
            <Round4 />
          </DragItem>
          <DragItem label="Oval 6" payload={{ category: 'table', shape: 'oval', capacity: 6 }} onClick={() => onAddTable('oval', 6)}>
            <Oval6 />
          </DragItem>

          <DragItem label="Rect 6" payload={{ category: 'table', shape: 'rectangular', capacity: 6 }} onClick={() => onAddTable('rectangular', 6)}>
            <Rect6 />
          </DragItem>
          <DragItem label="Rect 8" payload={{ category: 'table', shape: 'rectangular', capacity: 8 }} onClick={() => onAddTable('rectangular', 8)}>
            <Rect8 />
          </DragItem>

          {/* ── CUSTOM SHAPES ── */}
          <div className="col-span-2 mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
            <DragItem label="U-Conf" payload={{ category: 'table', shape: 'u_conf', capacity: 10, width: 140, height: 120 }} onClick={() => onAddTable('u_conf', 10)}>
              <UConfIcon />
            </DragItem>
          </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TABS ── */}
      <div className="border-t border-gray-100 p-2 flex bg-gray-50 mt-auto shrink-0">
        <button
          onClick={() => setShowPalette(!showPalette)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${showPalette ? 'bg-white shadow-sm text-[#1E293B] border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <PaintBucket className="h-3.5 w-3.5" /> Color
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Layers className="h-3.5 w-3.5" /> Style
        </button>
      </div>

      {/* Color Palette Popup */}
      {showPalette && (
        <div className="absolute bottom-14 left-2 w-60 bg-white border border-gray-200 shadow-xl rounded-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-800">Element Color</h3>
            <button onClick={() => setShowPalette(false)} className="text-gray-400 hover:text-gray-600 text-xs font-medium">Close</button>
          </div>
          <div className="p-3"><ColorPalette color={activeColor} onChange={onColorChange} /></div>
        </div>
      )}
    </div>
  )
}
