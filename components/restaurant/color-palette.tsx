import React from "react"

interface ColorPaletteProps {
  color: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  "#FF4444", "#3b82f6", "#10b981", "#fbbf24", "#6b7280",
  "#9f1239", "#1d4ed8", "#a16207", "#374151", "#d1d5db"
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
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-red-500 pointer-events-none" style={{ background: 'conic-gradient(from 180deg, red, yellow, lime, aqua, blue, magenta, red)' }}></div>
            <input
              type="color"
              value={color || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
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
