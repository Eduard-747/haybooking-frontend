"use client"

import { useTranslation } from "react-i18next"

import { ColorPalette } from "./color-palette"
import { useState } from "react"
import { PaintBucket, Layers } from "lucide-react"

interface FloorPlanSidebarProps {
  onAddTable: (shape: string, capacity: number, presetColor?: string) => void
  onAddElement: (type: string) => void
  activeColor: string
  onColorChange: (color: string) => void
}

export function FloorPlanSidebar({ onAddTable, onAddElement, activeColor, onColorChange }: FloorPlanSidebarProps) {
  const { t } = useTranslation()
  const [showPalette, setShowPalette] = useState(false)

  return (
    <div className="absolute top-4 left-4 bottom-4 w-64 bg-white shadow-xl rounded-2xl flex flex-col z-20 border border-border/60 overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-white shrink-0">
        <h2 className="font-bold text-foreground">Objects & Controls</h2>
      </div>
      
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Tables */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tables</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'table', shape: 'square', capacity: 2, color: '#ef4444' }))}
              onClick={() => onAddTable("square", 2, "#ef4444")} 
              className="flex flex-col items-center justify-center p-3 border border-border/60 rounded-xl hover:bg-gray-50 hover:border-red-400 transition-colors bg-white cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-10 bg-red-500 rounded-md shadow-sm mb-2 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/40 rounded-sm"></div>
              </div>
              <span className="text-xs font-medium text-foreground">2-top</span>
            </button>
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'table', shape: 'rectangular', capacity: 4, color: '#3b82f6' }))}
              onClick={() => onAddTable("rectangular", 4, "#3b82f6")} 
              className="flex flex-col items-center justify-center p-3 border border-border/60 rounded-xl hover:bg-gray-50 hover:border-blue-400 transition-colors bg-white cursor-grab active:cursor-grabbing"
            >
              <div className="w-12 h-10 bg-blue-500 rounded-md shadow-sm mb-2 flex items-center justify-center">
                <div className="w-8 h-6 border-2 border-white/40 rounded-sm"></div>
              </div>
              <span className="text-xs font-medium text-foreground">4-top</span>
            </button>
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'table', shape: 'rectangular', capacity: 6, color: '#10b981' }))}
              onClick={() => onAddTable("rectangular", 6, "#10b981")} 
              className="flex flex-col items-center justify-center p-3 border border-border/60 rounded-xl hover:bg-gray-50 hover:border-green-400 transition-colors bg-white cursor-grab active:cursor-grabbing"
            >
              <div className="w-14 h-10 bg-green-500 rounded-md shadow-sm mb-2 flex items-center justify-center">
                <div className="w-10 h-6 border-2 border-white/40 rounded-sm"></div>
              </div>
              <span className="text-xs font-medium text-foreground">6-top</span>
            </button>
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'table', shape: 'round', capacity: 4, color: '#eab308' }))}
              onClick={() => onAddTable("round", 4, "#eab308")} 
              className="flex flex-col items-center justify-center p-3 border border-border/60 rounded-xl hover:bg-gray-50 hover:border-yellow-400 transition-colors bg-white cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-10 bg-yellow-500 rounded-full shadow-sm mb-2 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/40 rounded-full"></div>
              </div>
              <span className="text-xs font-medium text-foreground">4-top round</span>
            </button>
          </div>
        </div>

        {/* Seating */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Seating</h3>
          <div className="grid grid-cols-3 gap-2">
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'chair' }))} onClick={() => onAddElement("chair")} className="flex flex-col items-center p-2 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center mb-1">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
              </div>
              <span className="text-[10px] font-medium text-foreground text-center">Chair</span>
            </button>
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'bar_stool' }))} onClick={() => onAddElement("bar_stool")} className="flex flex-col items-center p-2 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-gray-100 mb-1"></div>
              <span className="text-[10px] font-medium text-foreground text-center">Bar stool</span>
            </button>
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'booth' }))} onClick={() => onAddElement("booth")} className="flex flex-col items-center p-2 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-8 h-6 border-2 border-gray-400 bg-gray-100 rounded-t-lg mb-1"></div>
              <span className="text-[10px] font-medium text-foreground text-center">Booth</span>
            </button>
          </div>
        </div>

        {/* Bar */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bar</h3>
          <div className="grid grid-cols-2 gap-3">
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'bar_counter' }))} onClick={() => onAddElement("bar_counter")} className="flex flex-col items-center p-3 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-full h-4 bg-orange-200 border-2 border-orange-300 rounded-sm mb-2"></div>
              <span className="text-xs font-medium text-foreground">Counter</span>
            </button>
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'bar_section' }))} onClick={() => onAddElement("bar_section")} className="flex flex-col items-center p-3 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-8 h-8 bg-orange-200 border-2 border-orange-300 rounded-tl-lg mb-2"></div>
              <span className="text-xs font-medium text-foreground">Section</span>
            </button>
          </div>
        </div>

        {/* Decor */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Decor</h3>
          <div className="grid grid-cols-2 gap-3">
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'plant' }))} onClick={() => onAddElement("plant")} className="flex flex-col items-center p-3 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 relative mb-2 flex items-center justify-center">
                 <div className="absolute w-4 h-4 rounded-full bg-emerald-500 opacity-50"></div>
              </div>
              <span className="text-xs font-medium text-foreground">Plant</span>
            </button>
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'partition' }))} onClick={() => onAddElement("partition")} className="flex flex-col items-center p-3 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-full h-1 bg-gray-400 my-3.5 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-gray-600"></div>
              </div>
              <span className="text-xs font-medium text-foreground">Partition</span>
            </button>
          </div>
        </div>

        {/* Walls & Doors */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Walls & Doors</h3>
          <div className="grid grid-cols-2 gap-3">
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'wall' }))} onClick={() => onAddElement("wall")} className="flex flex-col items-center p-3 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-full h-2 bg-gray-800 mb-2"></div>
              <span className="text-xs font-medium text-foreground">Wall</span>
            </button>
            <button draggable onDragStart={(e) => e.dataTransfer.setData('floor-plan-item', JSON.stringify({ category: 'element', type: 'door' }))} onClick={() => onAddElement("door")} className="flex flex-col items-center p-3 border border-border/60 rounded-lg hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing">
              <div className="w-full h-8 relative mb-2">
                <div className="absolute bottom-0 left-0 w-2 h-full bg-gray-800"></div>
                <div className="absolute bottom-0 right-0 w-2 h-full bg-gray-800"></div>
                <div className="absolute bottom-0 left-2 w-[calc(100%-8px)] h-8 border-l-2 border-t-2 border-blue-400 rounded-tl-full opacity-50"></div>
              </div>
              <span className="text-xs font-medium text-foreground">Door</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Customization Panel */}
      {showPalette && (
        <div className="absolute bottom-16 left-4 w-64 bg-white border border-border/60 shadow-xl rounded-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-border/60 bg-[#FAFAFA] rounded-t-xl">
            <h3 className="font-bold text-sm text-foreground">Customization</h3>
            <button onClick={() => setShowPalette(false)} className="text-muted-foreground hover:text-foreground text-xs font-medium">Close</button>
          </div>
          <div className="p-4">
            <ColorPalette color={activeColor} onChange={onColorChange} />
          </div>
        </div>
      )}

      {/* Bottom Tabs */}
      <div className="border-t border-border/60 p-2 flex bg-[#FAFAFA] mt-auto">
        <button 
          onClick={() => setShowPalette(!showPalette)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${showPalette ? 'bg-white shadow-sm text-[#E5555E] border border-border/60' : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground border border-transparent'}`}
        >
          <PaintBucket className="h-4 w-4" /> Element Color
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md text-muted-foreground hover:bg-gray-100 hover:text-foreground border border-transparent transition-colors">
          <Layers className="h-4 w-4" /> Asset Style
        </button>
      </div>
    </div>
  )
}
