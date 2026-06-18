"use client"

import {
  Plus, ZoomIn, ZoomOut, Save, Maximize, MousePointer2,
  Undo, Redo, Hand, PenTool, BookOpen, History, Wand2,
} from "lucide-react"

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
  mode?: string
  setMode?: (mode: "select" | "draw_room" | "draw_event" | "pan") => void
  onLoadDemo?: () => void
}

const Sep = () => <div className="h-5 w-px bg-gray-200 mx-0.5 shrink-0" />

const ToolBtn = ({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick?: () => void; active?: boolean; disabled?: boolean; title?: string; children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all shrink-0 ${active
      ? "bg-gray-200 text-gray-900 shadow-inner"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } disabled:opacity-30 disabled:pointer-events-none`}
  >
    {children}
  </button>
)

export function FloorPlanToolbar({
  onAddTable, onAddArea, onAddEventArea, onZoomIn, onZoomOut, onResetZoom,
  onSave, isSaving, onUndo, onRedo, canUndo, canRedo, mode = "select", setMode, onLoadDemo,
}: FloorPlanToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 h-11 flex items-center justify-between shrink-0 shadow-sm z-10 relative gap-2">

      {/* Left tools */}
      <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">

        {/* Add Table dropdown */}
        <div className="group relative shrink-0">
          <ToolBtn>
            <Plus className="h-4 w-4" />
            <span>Add Table</span>
          </ToolBtn>
          <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-200 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {["square", "round", "rectangular", "oval", "banquet"].map(s => (
              <button
                key={s}
                onClick={() => onAddTable(s)}
                className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50 rounded-lg capitalize"
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Sep />

        <ToolBtn onClick={onAddArea} active={mode === "draw_room"}>
          <PenTool className="h-4 w-4" /><span>Draw Room</span>
        </ToolBtn>
        <ToolBtn onClick={onAddEventArea} active={mode === "draw_event"}>
          <PenTool className="h-4 w-4" /><span>Draw Event Area</span>
        </ToolBtn>

        <Sep />

        {/* Undo/Redo */}
        <ToolBtn onClick={onUndo} disabled={!canUndo} title="Undo">
          <Undo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={onRedo} disabled={!canRedo} title="Redo">
          <Redo className="h-4 w-4" />
        </ToolBtn>

        <Sep />

        {/* Mode buttons */}
        <ToolBtn onClick={() => setMode?.("select")} active={mode === "select"}>
          <MousePointer2 className="h-4 w-4" /><span>Selection Tool</span>
        </ToolBtn>
        <ToolBtn onClick={() => setMode?.("pan")} active={mode === "pan"}>
          <Hand className="h-4 w-4" /><span>Move/Pan Tool</span>
        </ToolBtn>

        <Sep />

        {/* Zoom */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shrink-0">
          <button onClick={onZoomOut} className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button onClick={onResetZoom} className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <Maximize className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button onClick={onZoomIn} className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-[13px] font-semibold transition-colors"
            title="Load the reference demo layout"
          >
            <Wand2 className="h-3.5 w-3.5" /> Load Demo
          </button>
        )}
        <ToolBtn>
          <BookOpen className="h-4 w-4" /><span>Library</span>
        </ToolBtn>
        <ToolBtn>
          <History className="h-4 w-4" /><span>History</span>
        </ToolBtn>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#E5555E] hover:bg-[#d44850] active:bg-[#c23f48] text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save Layout"}
        </button>
      </div>
    </div>
  )
}
