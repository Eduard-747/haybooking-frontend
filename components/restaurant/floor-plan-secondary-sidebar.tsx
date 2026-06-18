"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface Props {
  onAddElement: (type: string) => void
}

type Item = { type: string; label: string; icon: React.ReactNode }

const SECTIONS: { id: string; title: string; items: Item[] }[] = [
  {
    id: "newly_added",
    title: "NEWLY ADDED",
    items: [
      {
        type: "plant",
        label: "Greenery",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="50" rx="12" ry="5" fill="#d6cfc7" opacity="0.4" />
            <rect x="26" y="36" width="8" height="16" rx="3" fill="#a0845c" />
            <circle cx="30" cy="24" r="14" fill="#34a853" />
            <circle cx="20" cy="28" r="9" fill="#2d9e46" />
            <circle cx="40" cy="28" r="9" fill="#2d9e46" />
            <circle cx="30" cy="16" r="10" fill="#43c45e" />
            <circle cx="30" cy="24" r="7" fill="#56d475" />
          </svg>
        ),
      },
      {
        type: "host_stand",
        label: "Host Stand",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="54" rx="14" ry="4" fill="#c4a882" opacity="0.3" />
            <rect x="18" y="30" width="24" height="24" rx="3" fill="#c4a882" />
            <rect x="20" y="32" width="20" height="20" rx="2" fill="#ddc49e" />
            <path d="M20 39h20" stroke="#b8966e" strokeWidth="1.5" />
            <rect x="24" y="14" width="12" height="16" rx="2" fill="#b8966e" />
            <path d="M24 14 L30 8 L36 14" fill="#a07850" />
            <rect x="28" y="42" width="4" height="8" fill="#b8966e" />
          </svg>
        ),
      },
      {
        type: "pos",
        label: "POS Terminals",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="10" y="8" width="40" height="30" rx="4" fill="#374151" />
            <rect x="13" y="11" width="34" height="24" rx="2" fill="#1f2937" />
            <rect x="15" y="13" width="30" height="18" rx="1" fill="#60a5fa" opacity="0.8" />
            <rect x="22" y="38" width="16" height="4" rx="1" fill="#4b5563" />
            <rect x="18" y="42" width="24" height="8" rx="2" fill="#374151" />
            <rect x="20" y="44" width="6" height="4" rx="1" fill="#9ca3af" />
            <rect x="28" y="44" width="6" height="4" rx="1" fill="#9ca3af" />
          </svg>
        ),
      },
      {
        type: "waiter_station",
        label: "Waiter Station",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="8" y="20" width="44" height="32" rx="3" fill="#d4b896" />
            <rect x="10" y="22" width="40" height="28" rx="2" fill="#e8d5bc" />
            <path d="M10 34h40" stroke="#c4a882" strokeWidth="1.5" />
            <rect x="14" y="25" width="10" height="8" rx="1" fill="#c4a882" />
            <rect x="36" y="25" width="10" height="8" rx="1" fill="#c4a882" />
            <rect x="14" y="37" width="32" height="10" rx="1" fill="#c4a882" />
            <ellipse cx="20" cy="18" rx="8" ry="3" fill="#9ca3af" />
            <ellipse cx="40" cy="18" rx="8" ry="3" fill="#9ca3af" />
            <ellipse cx="20" cy="16" rx="7" ry="2.5" fill="#d1d5db" />
            <ellipse cx="40" cy="16" rx="7" ry="2.5" fill="#d1d5db" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "decor",
    title: "DECOR & ACCENTS",
    items: [
      {
        type: "aisle_divider",
        label: "Aisle Divider",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="12" y="8" width="36" height="44" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
            <rect x="14" y="10" width="32" height="40" rx="1" fill="#f9fafb" />
            <line x1="30" y1="10" x2="30" y2="50" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" />
            <rect x="14" y="18" width="14" height="6" rx="1" fill="#e5e7eb" />
            <rect x="14" y="30" width="14" height="6" rx="1" fill="#e5e7eb" />
            <rect x="32" y="24" width="14" height="6" rx="1" fill="#e5e7eb" />
            <rect x="32" y="36" width="14" height="6" rx="1" fill="#e5e7eb" />
          </svg>
        ),
      },
      {
        type: "large_mirror",
        label: "Large Mirror",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="10" y="6" width="40" height="48" rx="4" fill="#6b7280" />
            <rect x="12" y="8" width="36" height="44" rx="3" fill="#bae6fd" />
            <rect x="14" y="10" width="32" height="40" rx="2" fill="#e0f2fe" />
            <line x1="18" y1="14" x2="26" y2="22" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
            <line x1="18" y1="20" x2="24" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
          </svg>
        ),
      },
      {
        type: "rug",
        label: "Accent Rug",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="30" rx="24" ry="18" fill="#7c3aed" opacity="0.15" />
            <ellipse cx="30" cy="30" rx="22" ry="16" fill="#7c3aed" opacity="0.2" />
            <ellipse cx="30" cy="30" rx="18" ry="12" fill="#8b5cf6" opacity="0.3" />
            <ellipse cx="30" cy="30" rx="14" ry="9" fill="#7c3aed" opacity="0.4" />
            <ellipse cx="30" cy="30" rx="9" ry="5" fill="#6d28d9" opacity="0.5" />
            <line x1="8" y1="30" x2="52" y2="30" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="30" y1="14" x2="30" y2="46" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.4" />
          </svg>
        ),
      },
      {
        type: "velvet_rope",
        label: "Velvet Rope",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="10" y="44" width="8" height="12" rx="2" fill="#6b7280" />
            <rect x="42" y="44" width="8" height="12" rx="2" fill="#6b7280" />
            <circle cx="14" cy="44" r="5" fill="#9ca3af" />
            <circle cx="46" cy="44" r="5" fill="#9ca3af" />
            <path d="M14 42 Q30 28 46 42" stroke="#7c3aed" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M14 42 Q30 28 46 42" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        type: "privacy_screen",
        label: "Privacy Screen",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="8" y="10" width="14" height="42" rx="2" fill="#d1d5db" />
            <rect x="9" y="11" width="12" height="40" rx="1" fill="#e5e7eb" />
            <rect x="24" y="10" width="14" height="42" rx="2" fill="#d1d5db" />
            <rect x="25" y="11" width="12" height="40" rx="1" fill="#f0f9ff" opacity="0.8" />
            <rect x="40" y="10" width="14" height="42" rx="2" fill="#d1d5db" />
            <rect x="41" y="11" width="12" height="40" rx="1" fill="#e5e7eb" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "architectural",
    title: "ARCHITECTURAL",
    items: [
      {
        type: "column",
        label: "Structural Column",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="54" rx="12" ry="4" fill="#9ca3af" opacity="0.3" />
            <rect x="16" y="52" width="28" height="4" rx="1" fill="#6b7280" />
            <rect x="20" y="10" width="20" height="42" fill="url(#col_grad)" />
            <rect x="14" y="6" width="32" height="6" rx="1" fill="#6b7280" />
            <defs>
              <linearGradient id="col_grad" x1="20" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9ca3af" />
                <stop offset="0.4" stopColor="#e5e7eb" />
                <stop offset="0.6" stopColor="#f9fafb" />
                <stop offset="1" stopColor="#9ca3af" />
              </linearGradient>
            </defs>
          </svg>
        ),
      },
      {
        type: "modular_wall",
        label: "Modular Wall",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="6" y="22" width="48" height="16" rx="2" fill="#6b7280" />
            <rect x="6" y="22" width="22" height="7" rx="1" fill="#9ca3af" />
            <rect x="30" y="22" width="24" height="7" rx="1" fill="#9ca3af" />
            <rect x="14" y="31" width="22" height="7" rx="1" fill="#9ca3af" />
            <rect x="38" y="31" width="16" height="7" rx="1" fill="#9ca3af" />
            <rect x="6" y="31" width="6" height="7" rx="1" fill="#9ca3af" />
          </svg>
        ),
      },
      {
        type: "glass_partition",
        label: "Glass Partition",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="12" y="6" width="16" height="50" rx="2" fill="#bae6fd" opacity="0.5" stroke="#60a5fa" strokeWidth="1.5" />
            <rect x="32" y="6" width="16" height="50" rx="2" fill="#bae6fd" opacity="0.5" stroke="#60a5fa" strokeWidth="1.5" />
            <line x1="16" y1="10" x2="22" y2="18" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
            <line x1="36" y1="10" x2="42" y2="18" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
            <rect x="10" y="4" width="40" height="4" rx="1" fill="#6b7280" />
            <rect x="10" y="54" width="40" height="4" rx="1" fill="#6b7280" />
          </svg>
        ),
      },
      {
        type: "sliding_door",
        label: "Sliding Doors",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="6" y="10" width="22" height="42" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="30" y="10" width="22" height="42" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
            <circle cx="27" cy="31" r="2" fill="#6b7280" />
            <circle cx="33" cy="31" r="2" fill="#6b7280" />
            <line x1="8" y1="10" x2="8" y2="52" stroke="#9ca3af" strokeWidth="3" />
            <line x1="52" y1="10" x2="52" y2="52" stroke="#9ca3af" strokeWidth="3" />
          </svg>
        ),
      },
      {
        type: "window",
        label: "Window Panes",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="6" y="14" width="48" height="34" rx="3" fill="#6b7280" />
            <rect x="8" y="16" width="44" height="30" rx="2" fill="#bae6fd" opacity="0.6" />
            <line x1="30" y1="16" x2="30" y2="46" stroke="#6b7280" strokeWidth="2" />
            <line x1="8" y1="31" x2="52" y2="31" stroke="#6b7280" strokeWidth="2" />
            <line x1="14" y1="18" x2="22" y2="28" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
            <line x1="36" y1="18" x2="44" y2="28" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "systems",
    title: "SYSTEMS",
    items: [
      {
        type: "lighting_truss",
        label: "Lighting Trusses",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="6" y="22" width="48" height="8" rx="2" fill="#374151" />
            <line x1="10" y1="22" x2="16" y2="30" stroke="#6b7280" strokeWidth="1.5" />
            <line x1="22" y1="22" x2="28" y2="30" stroke="#6b7280" strokeWidth="1.5" />
            <line x1="34" y1="22" x2="40" y2="30" stroke="#6b7280" strokeWidth="1.5" />
            <line x1="46" y1="22" x2="50" y2="30" stroke="#6b7280" strokeWidth="1.5" />
            <ellipse cx="14" cy="36" rx="5" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="30" cy="36" rx="5" ry="6" fill="#f97316" opacity="0.8" />
            <ellipse cx="46" cy="36" rx="5" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="14" cy="40" rx="8" ry="3" fill="#fbbf24" opacity="0.15" />
            <ellipse cx="30" cy="40" rx="8" ry="3" fill="#f97316" opacity="0.15" />
            <ellipse cx="46" cy="40" rx="8" ry="3" fill="#fbbf24" opacity="0.15" />
          </svg>
        ),
      },
      {
        type: "speaker",
        label: "Speaker",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="16" y="6" width="28" height="50" rx="4" fill="#1f2937" />
            <rect x="18" y="8" width="24" height="46" rx="3" fill="#374151" />
            <circle cx="30" cy="22" r="8" fill="#4b5563" stroke="#6b7280" strokeWidth="1" />
            <circle cx="30" cy="22" r="5" fill="#1f2937" />
            <circle cx="30" cy="22" r="2" fill="#6b7280" />
            <circle cx="30" cy="40" r="10" fill="#4b5563" stroke="#6b7280" strokeWidth="1" />
            <circle cx="30" cy="40" r="6" fill="#1f2937" />
            <circle cx="30" cy="40" r="2.5" fill="#6b7280" />
            <rect x="26" y="12" width="8" height="3" rx="1" fill="#6b7280" />
          </svg>
        ),
      },
      {
        type: "hvac_vent",
        label: "HVAC Vent",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <rect x="6" y="18" width="48" height="26" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="8" y="20" width="44" height="22" rx="2" fill="#e5e7eb" />
            <line x1="8" y1="25" x2="52" y2="25" stroke="#9ca3af" strokeWidth="1.5" />
            <line x1="8" y1="31" x2="52" y2="31" stroke="#9ca3af" strokeWidth="1.5" />
            <line x1="8" y1="37" x2="52" y2="37" stroke="#9ca3af" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        type: "fire_sprinkler",
        label: "Fire Sprinkler",
        icon: (
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="20" r="8" fill="#ef4444" opacity="0.9" />
            <circle cx="30" cy="20" r="5" fill="#b91c1c" />
            <rect x="28" y="6" width="4" height="14" rx="1" fill="#6b7280" />
            <line x1="30" y1="28" x2="18" y2="38" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="30" y1="28" x2="30" y2="42" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="30" y1="28" x2="42" y2="38" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="30" y1="28" x2="14" y2="32" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="30" y1="28" x2="46" y2="32" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.5" />
          </svg>
        ),
      },
    ],
  },
]

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <span className="text-[11px] font-bold tracking-widest text-gray-500">{title}</span>
      <ChevronDown
        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      />
    </button>
  )
}

function ItemCard({ item, onAddElement }: { item: Item; onAddElement: (t: string) => void }) {
  return (
    <button
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData("floor-plan-item", JSON.stringify({ category: "element", type: item.type }))
      }
      onClick={() => onAddElement(item.type)}
      className="flex flex-col items-center justify-center gap-2 py-3 px-1 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-150 cursor-grab active:cursor-grabbing active:scale-95"
    >
      <div className="w-10 h-10 flex items-center justify-center">{item.icon}</div>
      <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight px-1">{item.label}</span>
    </button>
  )
}

export function FloorPlanSecondarySidebar({ onAddElement }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ newly_added: true, decor: true, architectural: true, systems: true })
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="absolute top-4 left-[200px] bottom-4 w-[210px] bg-white shadow-xl rounded-2xl flex flex-col z-20 border border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map((section, si) => (
          <div key={section.id} className={si > 0 ? "border-t border-gray-100" : ""}>
            <SectionHeader title={section.title} open={!!open[section.id]} onToggle={() => toggle(section.id)} />
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: open[section.id] ? "600px" : "0px" }}
            >
              <div className="px-3 pb-4 grid grid-cols-3 gap-2">
                {section.items.map((item) => (
                  <ItemCard key={item.type} item={item} onAddElement={onAddElement} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
