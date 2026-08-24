"use client"

import { useTranslation } from "react-i18next"
import { Save, Trash, Plus, Square, Circle, RectangleHorizontal } from "lucide-react"
import { ColorPalette } from "./color-palette"

interface TablePropertiesPanelProps {
  selectedTable: any
  onUpdate: (updates: any) => void
  onDelete: () => void
  onDeselect: () => void
}

export function TablePropertiesPanel({ selectedTable, onUpdate, onDelete, onDeselect }: TablePropertiesPanelProps) {
  const { t } = useTranslation()

  if (!selectedTable) return null

  return (
    <div className="absolute top-4 right-4 w-80 bg-white border border-border/60 shadow-xl rounded-xl flex flex-col max-h-[calc(100%-32px)] z-20">
      <div className="p-4 border-b border-border/60 flex items-center justify-between bg-[#FAFAFA] rounded-t-xl">
        <h3 className="font-bold text-foreground">Table Properties</h3>
        <button onClick={onDeselect} className="text-muted-foreground hover:text-foreground text-sm font-medium">Close</button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Table Number / Name</label>
          <input
            type="text"
            value={selectedTable.tableNumber || ""}
            onChange={(e) => onUpdate({ tableNumber: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            placeholder="e.g. T1 or VIP-A"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Max Capacity</label>
            <input
              type="number"
              min="1"
              value={selectedTable.capacity || 4}
              onChange={(e) => onUpdate({ capacity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Min Capacity</label>
            <input
              type="number"
              min="1"
              value={selectedTable.minCapacity || 1}
              onChange={(e) => onUpdate({ minCapacity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Width</label>
            <input
              type="number"
              min="20"
              step="10"
              value={selectedTable.size?.width || 80}
              onChange={(e) => onUpdate({ size: { ...selectedTable.size, width: parseInt(e.target.value) || 80 } })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Height</label>
            <input
              type="number"
              min="20"
              step="10"
              value={selectedTable.size?.height || 80}
              onChange={(e) => onUpdate({ size: { ...selectedTable.size, height: parseInt(e.target.value) || 80 } })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Shape</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                const size = selectedTable.size || { width: 80, height: 80 }
                onUpdate({ shape: "square", size: { width: Math.max(size.width, size.height), height: Math.max(size.width, size.height) } })
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border ${selectedTable.shape === "square" ? "border-[#FF4444] bg-[#FEF2F2] text-[#FF4444]" : "border-border text-muted-foreground hover:bg-gray-50"}`}
            >
              <Square className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium">Square</span>
            </button>
            <button
              onClick={() => {
                const size = selectedTable.size || { width: 80, height: 80 }
                onUpdate({ shape: "round", size: { width: Math.max(size.width, size.height), height: Math.max(size.width, size.height) } })
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border ${selectedTable.shape === "round" ? "border-[#FF4444] bg-[#FEF2F2] text-[#FF4444]" : "border-border text-muted-foreground hover:bg-gray-50"}`}
            >
              <Circle className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium">Round</span>
            </button>
            <button
              onClick={() => {
                const size = selectedTable.size || { width: 80, height: 80 }
                const updates: any = { shape: "rectangular" }
                if (size.width === size.height) updates.size = { ...size, width: size.width * 1.5 }
                onUpdate(updates)
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border ${selectedTable.shape === "rectangular" ? "border-[#FF4444] bg-[#FEF2F2] text-[#FF4444]" : "border-border text-muted-foreground hover:bg-gray-50"}`}
            >
              <RectangleHorizontal className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium">Rectangle</span>
            </button>
            <button
              onClick={() => {
                const size = selectedTable.size || { width: 80, height: 80 }
                const updates: any = { shape: "oval" }
                if (size.width === size.height) updates.size = { ...size, width: size.width * 1.5 }
                onUpdate(updates)
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border ${selectedTable.shape === "oval" ? "border-[#FF4444] bg-[#FEF2F2] text-[#FF4444]" : "border-border text-muted-foreground hover:bg-gray-50"}`}
            >
              <div className="h-4 w-6 rounded-[50%] border-2 border-current mb-1" />
              <span className="text-[10px] font-medium">Oval</span>
            </button>
            <button
              onClick={() => {
                const size = selectedTable.size || { width: 80, height: 80 }
                const updates: any = { shape: "banquet" }
                if (size.width === size.height) updates.size = { ...size, width: size.width * 1.5 }
                onUpdate(updates)
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border ${selectedTable.shape === "banquet" ? "border-[#FF4444] bg-[#FEF2F2] text-[#FF4444]" : "border-border text-muted-foreground hover:bg-gray-50"}`}
            >
              <div className="h-4 w-6 rounded-full border-2 border-current mb-1" />
              <span className="text-[10px] font-medium">Banquet</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Location Type</label>
          <select
            value={selectedTable.location || "indoor"}
            onChange={(e) => onUpdate({ location: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor / Terrace</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="text-sm font-medium text-foreground">VIP Table</label>
          <button
            onClick={() => onUpdate({ isVip: !selectedTable.isVip })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              selectedTable.isVip ? 'bg-[#FF4444]' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              selectedTable.isVip ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-sm font-medium text-foreground">Status Override</label>
          <select
            value={selectedTable.status || "available"}
            onChange={(e) => onUpdate({ status: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
          >
            <option value="available">Available</option>
            <option value="out_of_service">Out of Service</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        
        <div className="pt-2 border-t border-border/60">
          <ColorPalette color={selectedTable.color || "#e5e7eb"} onChange={(c) => onUpdate({ color: c })} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notes</label>
          <textarea
            value={selectedTable.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white resize-none"
            rows={3}
            placeholder="E.g., Near the window, drafty area"
          />
        </div>
      </div>

      <div className="p-4 border-t border-border/60 bg-[#FAFAFA]">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
        >
          <Trash className="h-4 w-4" />
          Delete Table
        </button>
      </div>
    </div>
  )
}
