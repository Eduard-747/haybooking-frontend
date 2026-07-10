"use client"

import {
  Undo, Redo, Copy, ClipboardPaste, CopyPlus, Trash2, 
  ZoomIn, ZoomOut, Maximize, Grid, Magnet, Ruler, Eye, 
  MousePointer2, Hand, SquarePen, BoxSelect, Plus, Type,
  Search, Save, ChevronDown
} from "lucide-react"

interface FloorPlanToolbarProps {
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  mode?: string
  setMode?: (mode: "select" | "pan" | "draw_wall" | "draw_room" | "add_table" | "add_label") => void
  onCopy?: () => void
  onPaste?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitScreen?: () => void
  gridEnabled?: boolean
  setGridEnabled?: (enabled: boolean) => void
  snapEnabled?: boolean
  setSnapEnabled?: (enabled: boolean) => void
  measurementEnabled?: boolean
  setMeasurementEnabled?: (enabled: boolean) => void
  previewMode?: boolean
  setPreviewMode?: (enabled: boolean) => void
  onSave?: () => void
  isSaving?: boolean
  floors?: any[]
  activeFloorId?: string | null
  setActiveFloorId?: (id: string) => void
  onAddFloor?: () => void
}

const Sep = () => <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />

const ToolBtn = ({
  onClick, active = false, disabled = false, title, icon: Icon
}: {
  onClick?: () => void; active?: boolean; disabled?: boolean; title?: string; icon: any
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-all shrink-0 ${active
      ? "bg-blue-50 text-blue-600"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } disabled:opacity-30 disabled:pointer-events-none`}
  >
    <Icon className="w-4 h-4" />
  </button>
)

export function FloorPlanToolbar({
  onUndo, onRedo, canUndo, canRedo, mode = "select", setMode,
  onCopy, onPaste, onDuplicate, onDelete,
  onZoomIn, onZoomOut, onFitScreen,
  gridEnabled, setGridEnabled, snapEnabled, setSnapEnabled, measurementEnabled, setMeasurementEnabled,
  previewMode, setPreviewMode, onSave, isSaving,
  floors = [], activeFloorId, setActiveFloorId, onAddFloor
}: FloorPlanToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 h-12 flex items-center justify-between shrink-0 shadow-sm z-10 w-full">

      {/* Left section: Floor Selection & Core Tools */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {/* Floor Selector */}
        <div className="relative group mr-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-semibold transition-colors">
            {activeFloorId && floors.length > 0 ? floors.find(f => f._id === activeFloorId)?.name || 'Select Floor' : 'Select Floor'}
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {floors.map(floor => (
              <button
                key={floor._id}
                onClick={() => setActiveFloorId?.(floor._id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${activeFloorId === floor._id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                {floor.name}
              </button>
            ))}
            <div className="h-px bg-gray-100 my-1"></div>
            <button
              onClick={onAddFloor}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-500" /> Add Floor
            </button>
          </div>
        </div>

        <Sep />

        {/* Edit Tools */}
        <ToolBtn icon={Undo} onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" />
        <ToolBtn icon={Redo} onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" />
        <ToolBtn icon={Copy} onClick={onCopy} title="Copy (Ctrl+C)" />
        <ToolBtn icon={ClipboardPaste} onClick={onPaste} title="Paste (Ctrl+V)" />
        <ToolBtn icon={CopyPlus} onClick={onDuplicate} title="Duplicate (Ctrl+D)" />
        <ToolBtn icon={Trash2} onClick={onDelete} title="Delete (Del)" />

        <Sep />

        {/* Mode Tools */}
        <ToolBtn icon={MousePointer2} onClick={() => setMode?.("select")} active={mode === "select"} title="Selection Tool (V)" />
        <ToolBtn icon={Hand} onClick={() => setMode?.("pan")} active={mode === "pan"} title="Pan Tool (Space)" />
        <ToolBtn icon={SquarePen} onClick={() => setMode?.("draw_wall")} active={mode === "draw_wall"} title="Draw Wall" />
        <ToolBtn icon={BoxSelect} onClick={() => setMode?.("draw_room")} active={mode === "draw_room"} title="Draw Room" />
        <ToolBtn icon={Type} onClick={() => setMode?.("add_label")} active={mode === "add_label"} title="Add Label" />

        <Sep />

        {/* View Tools */}
        <ToolBtn icon={ZoomOut} onClick={onZoomOut} title="Zoom Out (-)" />
        <ToolBtn icon={ZoomIn} onClick={onZoomIn} title="Zoom In (+)" />
        <ToolBtn icon={Maximize} onClick={onFitScreen} title="Fit Screen (Shift+1)" />
        
        <Sep />

        {/* Toggles */}
        <ToolBtn icon={Grid} onClick={() => setGridEnabled?.(!gridEnabled)} active={gridEnabled} title="Toggle Grid" />
        <ToolBtn icon={Magnet} onClick={() => setSnapEnabled?.(!snapEnabled)} active={snapEnabled} title="Toggle Snap" />
        <ToolBtn icon={Ruler} onClick={() => setMeasurementEnabled?.(!measurementEnabled)} active={measurementEnabled} title="Toggle Measurements" />
        <ToolBtn icon={Eye} onClick={() => setPreviewMode?.(!previewMode)} active={previewMode} title="Preview Mode" />
      </div>

      {/* Right section: Search & Save */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tools..." 
            className="w-40 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}
