"use client"

import { Plus, ZoomIn, ZoomOut, Save, Maximize, MousePointer2, Undo, Redo } from "lucide-react"

interface FloorPlanToolbarProps {
  onAddTable: (shape: string) => void
  onAddArea: () => void
  onAddEventArea: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onSave: () => void
  isSaving: boolean
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function FloorPlanToolbar({ onAddTable, onAddArea, onAddEventArea, onZoomIn, onZoomOut, onResetZoom, onSave, isSaving, onUndo, onRedo, canUndo, canRedo }: FloorPlanToolbarProps) {
  return (
    <div className="bg-white border-b border-border/60 p-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm z-10 relative">
      <div className="flex items-center gap-2">
        <div className="group relative">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] border border-border/60 hover:bg-gray-50 rounded-lg text-sm font-semibold text-foreground transition-colors">
            <Plus className="h-4 w-4" /> Add Table
          </button>
          <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-border/60 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button onClick={() => onAddTable("square")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">Square Table</button>
            <button onClick={() => onAddTable("round")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">Round Table</button>
            <button onClick={() => onAddTable("rectangular")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">Rectangular</button>
            <button onClick={() => onAddTable("oval")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">Oval</button>
            <button onClick={() => onAddTable("banquet")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md">Banquet</button>
          </div>
        </div>

        <button 
          onClick={onAddArea}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] border border-border/60 hover:bg-gray-50 rounded-lg text-sm font-semibold text-foreground transition-colors"
        >
          <MousePointer2 className="h-4 w-4" /> Draw Room
        </button>

        <button 
          onClick={onAddEventArea}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] border border-border/60 hover:bg-gray-50 rounded-lg text-sm font-semibold text-foreground transition-colors text-amber-600 hover:bg-amber-50"
        >
          <MousePointer2 className="h-4 w-4" /> Draw Event Area
        </button>

        <div className="flex items-center ml-2 border-l border-border/60 pl-4 gap-1">
          <button onClick={onUndo} disabled={!canUndo} className="p-1.5 hover:bg-[#FAFAFA] border border-transparent hover:border-border/60 rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Undo">
            <Undo className="h-4 w-4" />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className="p-1.5 hover:bg-[#FAFAFA] border border-transparent hover:border-border/60 rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Redo">
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-border/60 rounded-lg p-1">
        <button onClick={onZoomOut} className="p-1 hover:bg-white rounded-md text-muted-foreground hover:text-foreground transition-colors">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={onResetZoom} className="p-1 hover:bg-white rounded-md text-muted-foreground hover:text-foreground transition-colors">
          <Maximize className="h-4 w-4" />
        </button>
        <button onClick={onZoomIn} className="p-1 hover:bg-white rounded-md text-muted-foreground hover:text-foreground transition-colors">
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-1.5 bg-[#E5555E] hover:bg-[#d44850] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Layout"}
      </button>
    </div>
  )
}
