import React from "react"

interface ColorPaletteProps {
  color: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  "#ef4444", "#3b82f6", "#10b981", "#eab308", "#6b7280",
  "#f97316", "#8b5cf6", "#14b8a6", "#ec4899", "#000000"
]

export function ColorPalette({ color, onChange }: ColorPaletteProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Color Palette</label>
      <div className="grid grid-cols-5 gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-8 h-8 rounded-md shadow-sm border-2 transition-all ${color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="pt-2">
        <label className="text-sm font-medium text-foreground block mb-2">Custom Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={color || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-md border border-border cursor-pointer"
          />
          <input
            type="text"
            value={color || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-white uppercase font-mono"
            placeholder="#HEX"
          />
        </div>
      </div>
    </div>
  )
}
