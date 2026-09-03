"use client"

import React from "react"
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface FloorPlanStatusBarProps {
  scale: number
  pan: { x: number, y: number }
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  mouseCoordinates: { x: number, y: number }
  gridSize?: number
  snapEnabled?: boolean
}

export function FloorPlanStatusBar({
  scale,
  pan,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  mouseCoordinates,
  gridSize = 20,
  snapEnabled = true
}: FloorPlanStatusBarProps) {
  const { t } = useTranslation()

  return (
    <div className="h-9 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between px-3 sm:px-4 text-xs text-slate-500 shrink-0 z-20 select-none overflow-hidden">
      {/* Left side: Coordinates & Grid info */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200/60">
          <MousePointer2 className="h-3 w-3 text-[#FF385C]" />
          <span>X: {Math.round(mouseCoordinates.x)}px, Y: {Math.round(mouseCoordinates.y)}px</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
          <span className="hidden xs:inline">{t("restaurant.floorPlan.grid", "Grid")}: {gridSize}px</span>
          <span className="hidden xs:inline text-slate-300">•</span>
          <span className={snapEnabled ? "text-emerald-600 font-bold flex items-center gap-1" : "text-slate-400"}>
            {t("restaurant.floorPlan.snap", "Snap")}: {snapEnabled ? t("restaurant.floorPlan.on", "On") : t("restaurant.floorPlan.off", "Off")}
          </span>
        </div>
      </div>

      {/* Middle: Legend (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></div> {t("restaurant.tables.available", "Available")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></div> {t("restaurant.tables.reserved", "Reserved")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"></div> {t("restaurant.tables.occupied", "Occupied")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-2xs"></div> {t("restaurant.tables.blocked", "Blocked")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-md border-2 border-[#FF385C] bg-[#FFF0F3]"></div> {t("restaurant.floorPlan.selected", "Selected")}</div>
      </div>

      {/* Right side: Zoom controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button onClick={onZoomOut} className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors" title="Zoom Out"><ZoomOut className="h-3.5 w-3.5" /></button>
        <button onClick={onResetZoom} className="px-1.5 sm:px-2 py-0.5 rounded-md font-mono text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
          {Math.round(scale * 100)}%
        </button>
        <button onClick={onZoomIn} className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors" title="Zoom In"><ZoomIn className="h-3.5 w-3.5" /></button>
        <span className="text-slate-200">|</span>
        <button onClick={onResetZoom} className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors" title="Fit Screen"><Maximize className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  )
}
