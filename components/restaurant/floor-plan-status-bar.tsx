"use client"

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
    <div className="h-8 bg-white border-t border-border/60 flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0 z-20">
      {/* Left side: Coordinates & Grid info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 font-mono">
          <MousePointer2 className="h-3 w-3" />
          <span>X: {Math.round(mouseCoordinates.x)}, Y: {Math.round(mouseCoordinates.y)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{t("restaurant.floorPlan.grid", "Grid")}: {gridSize}px</span>
          <span className="text-border">|</span>
          <span className={snapEnabled ? "text-green-600 font-medium" : ""}>
            {t("restaurant.floorPlan.snap", "Snap")}: {snapEnabled ? t("restaurant.floorPlan.on", "On") : t("restaurant.floorPlan.off", "Off")}
          </span>
        </div>
      </div>

      {/* Middle: Legend */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> {t("restaurant.tables.available", "Available")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> {t("restaurant.tables.reserved", "Reserved")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> {t("restaurant.tables.occupied", "Occupied")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400"></div> {t("restaurant.tables.blocked", "Blocked")}</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 border border-blue-500 bg-blue-50"></div> {t("restaurant.floorPlan.selected", "Selected")}</div>
      </div>

      {/* Right side: Zoom controls */}
      <div className="flex items-center gap-3">
        <button onClick={onZoomOut} className="hover:text-foreground transition-colors"><ZoomOut className="h-3.5 w-3.5" /></button>
        <button onClick={onResetZoom} className="w-12 text-center font-medium hover:text-foreground transition-colors">
          {Math.round(scale * 100)}%
        </button>
        <button onClick={onZoomIn} className="hover:text-foreground transition-colors"><ZoomIn className="h-3.5 w-3.5" /></button>
        <span className="text-border">|</span>
        <button className="hover:text-foreground transition-colors"><Maximize className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  )
}
