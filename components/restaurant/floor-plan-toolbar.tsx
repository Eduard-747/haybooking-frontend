"use client"

import React, { useState } from "react"
import {
  Undo, Redo, Copy, ClipboardPaste, CopyPlus, Trash2, 
  ZoomIn, ZoomOut, Maximize, Grid, Magnet, Ruler, Eye, 
  MousePointer2, Hand, SquarePen, BoxSelect, Plus, Type,
  Search, Save, ChevronDown, Sparkles, X, Layers, Pencil
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  onEditFloor?: (floor: any) => void
  onDeleteFloor?: (floorId: string) => void
  onOpenAiModal?: () => void
}

const ToolBtn = ({
  onClick, active = false, disabled = false, title, icon: Icon, activeVariant = "coral"
}: {
  onClick?: () => void; active?: boolean; disabled?: boolean; title?: string; icon: any; activeVariant?: "coral" | "dark" | "blue"
}) => {
  let activeStyles = "bg-[#FF385C] text-white shadow-xs scale-105"
  if (activeVariant === "dark") activeStyles = "bg-slate-900 text-white shadow-xs scale-105"
  if (activeVariant === "blue") activeStyles = "bg-blue-600 text-white shadow-xs scale-105"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 flex items-center justify-center ${
        active
          ? activeStyles
          : "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs"
      } disabled:opacity-30 disabled:pointer-events-none active:scale-95`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

export function FloorPlanToolbar({
  onUndo, onRedo, canUndo, canRedo, mode = "select", setMode,
  onCopy, onPaste, onDuplicate, onDelete,
  onZoomIn, onZoomOut, onFitScreen,
  gridEnabled, setGridEnabled, snapEnabled, setSnapEnabled, measurementEnabled, setMeasurementEnabled,
  previewMode, setPreviewMode, onSave, isSaving,
  floors = [], activeFloorId, setActiveFloorId, onAddFloor, onEditFloor, onDeleteFloor, onOpenAiModal
}: FloorPlanToolbarProps) {
  const { t } = useTranslation()
  const [searchFilter, setSearchFilter] = useState("")
  const [showFloorDropdown, setShowFloorDropdown] = useState(false)

  const activeFloor = floors.find(f => f._id === activeFloorId)

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-3 sm:px-4 h-14 flex items-center justify-between shrink-0 shadow-xs z-30 w-full select-none gap-2 overflow-x-auto custom-scrollbar">

      {/* Left Section: Floor Selector & Tool Capsules */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        
        {/* Floor Selection Pill Dropdown & Quick Add Button */}
        <div className="relative shrink-0 flex items-center gap-1.5 z-50">
          <Popover open={showFloorDropdown} onOpenChange={setShowFloorDropdown}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 border border-slate-800 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#FF385C]" />
                <span>
                  {activeFloor ? activeFloor.name : t("restaurant.floorPlan.selectFloor", "Select Floor")}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showFloorDropdown ? "rotate-180" : ""}`} />
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" sideOffset={6} className="w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-[9999] space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {t("restaurant.floorPlan.floors", "FLOORS")} ({floors.length})
              </div>
              {floors.map(floor => (
                <div
                  key={floor._id}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-xl transition-all flex items-center justify-between group ${
                    activeFloorId === floor._id
                      ? "bg-[#FFF0F3] text-[#FF385C] font-bold"
                      : "hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFloorId?.(floor._id)
                      setShowFloorDropdown(false)
                    }}
                    className="flex-1 text-left truncate flex items-center gap-2 cursor-pointer"
                  >
                    {activeFloorId === floor._id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C] shrink-0" />
                    )}
                    <span className="truncate">{floor.name}</span>
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {onEditFloor && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditFloor(floor)
                          setShowFloorDropdown(false)
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                        title="Rename floor"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteFloor && floors.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteFloor(floor._id)
                          setShowFloorDropdown(false)
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete floor"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="h-px bg-slate-100 my-1"></div>
              <button
                type="button"
                onClick={() => {
                  onAddFloor?.()
                  setShowFloorDropdown(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-rose-50 hover:text-[#FF385C] rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF385C]" /> {t("restaurant.floorPlan.addFloor", "Add Floor")}
              </button>
            </PopoverContent>
          </Popover>

          {/* Dedicated Quick Add Floor Button */}
          <button
            type="button"
            onClick={onAddFloor}
            title={t("restaurant.floorPlan.addFloor", "Add Floor")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#FF385C] border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("restaurant.floorPlan.addFloor", "Add Floor")}</span>
          </button>
        </div>

        {/* Capsule 1: Edit History & Actions */}
        <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/70 shrink-0 shadow-2xs">
          <ToolBtn icon={Undo} onClick={onUndo} disabled={!canUndo} title={`${t("restaurant.floorPlan.undo", "Undo")} (Ctrl+Z)`} />
          <ToolBtn icon={Redo} onClick={onRedo} disabled={!canRedo} title={`${t("restaurant.floorPlan.redo", "Redo")} (Ctrl+Y)`} />
          <div className="h-4 w-px bg-slate-200/80 mx-0.5 shrink-0" />
          <ToolBtn icon={Copy} onClick={onCopy} title={`${t("restaurant.floorPlan.copy", "Copy")} (Ctrl+C)`} />
          <ToolBtn icon={ClipboardPaste} onClick={onPaste} title={`${t("restaurant.floorPlan.paste", "Paste")} (Ctrl+V)`} />
          <ToolBtn icon={CopyPlus} onClick={onDuplicate} title={`${t("restaurant.floorPlan.duplicate", "Duplicate")} (Ctrl+D)`} />
          <ToolBtn icon={Trash2} onClick={onDelete} title={`${t("restaurant.floorPlan.delete", "Delete")} (Del)`} />
        </div>

        {/* Capsule 2: Interactive Mode Tools */}
        <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/70 shrink-0 shadow-2xs">
          <ToolBtn icon={MousePointer2} onClick={() => setMode?.("select")} active={mode === "select"} activeVariant="coral" title={`${t("restaurant.floorPlan.selectTool", "Selection Tool")} (V)`} />
          <ToolBtn icon={Hand} onClick={() => setMode?.("pan")} active={mode === "pan"} activeVariant="coral" title={`${t("restaurant.floorPlan.panTool", "Pan Tool")} (Space)`} />
          <ToolBtn icon={SquarePen} onClick={() => setMode?.("draw_wall")} active={mode === "draw_wall"} activeVariant="coral" title={t("restaurant.floorPlan.drawWall", "Draw Wall")} />
          <ToolBtn icon={BoxSelect} onClick={() => setMode?.("draw_room")} active={mode === "draw_room"} activeVariant="coral" title={t("restaurant.floorPlan.drawRoom", "Draw Room")} />
          <ToolBtn icon={Type} onClick={() => setMode?.("add_label")} active={mode === "add_label"} activeVariant="coral" title={t("restaurant.floorPlan.addLabel", "Add Label")} />
        </div>

        {/* Capsule 3: Canvas View & Toggles */}
        <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/70 shrink-0 shadow-2xs">
          <ToolBtn icon={ZoomOut} onClick={onZoomOut} title="Zoom Out (-)" />
          <ToolBtn icon={ZoomIn} onClick={onZoomIn} title="Zoom In (+)" />
          <ToolBtn icon={Maximize} onClick={onFitScreen} title="Fit Screen (Shift+1)" />
          <div className="h-4 w-px bg-slate-200/80 mx-0.5 shrink-0" />
          <ToolBtn icon={Grid} onClick={() => setGridEnabled?.(!gridEnabled)} active={gridEnabled} activeVariant="dark" title={t("restaurant.floorPlan.toggleGrid", "Toggle Grid")} />
          <ToolBtn icon={Magnet} onClick={() => setSnapEnabled?.(!snapEnabled)} active={snapEnabled} activeVariant="dark" title={t("restaurant.floorPlan.toggleSnap", "Toggle Snap")} />
          <ToolBtn icon={Ruler} onClick={() => setMeasurementEnabled?.(!measurementEnabled)} active={measurementEnabled} activeVariant="dark" title={t("restaurant.floorPlan.toggleMeasurements", "Toggle Measurements")} />
          <ToolBtn icon={Eye} onClick={() => setPreviewMode?.(!previewMode)} active={previewMode} activeVariant="dark" title={t("restaurant.floorPlan.previewMode", "Preview Mode")} />
        </div>
      </div>

      {/* Right Section: AI Generator, Quick Search & Save */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* AI Generator Button */}
        <button
          onClick={onOpenAiModal}
          title="AI Generate Floor Plan ($0.99 per request)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-[#FF385C] rounded-xl hover:opacity-95 transition-all shrink-0 shadow-md shadow-indigo-500/20 active:scale-95 border border-white/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">{t("restaurant.floorPlan.aiGenerate", "AI Generate")}</span>
          <span className="bg-black/30 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ml-0.5 border border-white/20">$0.99</span>
        </button>

        {/* Quick Tool Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t("restaurant.floorPlan.searchTools", "Search tools...")} 
            className="w-36 lg:w-44 pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition-all"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Main Coral-Red Save Layout Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs shadow-[#FF385C]/25 active:scale-95 shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? t("restaurant.floorPlan.savingLayout", "Saving...") : t("restaurant.floorPlan.saveLayout", "Save")}
        </button>
      </div>

    </div>
  )
}
