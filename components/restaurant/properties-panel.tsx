"use client"

import { Copy, Trash2, Lock, Unlock, Users, LayoutGrid, AlertCircle, Info } from "lucide-react"
import { ColorPalette } from "./color-palette"
import { useTranslation } from "react-i18next"

interface PropertiesPanelProps {
  selectedElements: any[]
  tables: any[]
  elements: any[]
  floors: any[]
  activeFloorId: string | null
  onUpdateTable: (id: string, updates: any) => void
  onUpdateElement: (id: string, updates: any) => void
  onDeleteTable: (id: string) => void
  onDeleteElement: (id: string) => void
  onDuplicate: () => void
  restaurantName?: string
}

export function PropertiesPanel({
  selectedElements,
  tables,
  elements,
  floors,
  activeFloorId,
  onUpdateTable,
  onUpdateElement,
  onDeleteTable,
  onDeleteElement,
  onDuplicate,
  restaurantName = "My Restaurant"
}: PropertiesPanelProps) {
  const { t } = useTranslation()
  const activeFloor = floors.find(f => f._id === activeFloorId)
  const activeTables = tables.filter(t => t.floorId === activeFloorId)
  
  if (selectedElements.length === 0) {
    // Show Floor Information
    const totalSeats = activeTables.reduce((sum, t) => sum + (t.capacity || 0), 0)
    const occupiedTables = activeTables.filter(t => t.status === "occupied").length
    const availableTables = activeTables.filter(t => t.status === "available").length
    
    return (
      <div className="w-[280px] max-w-full bg-white border-l border-gray-200 flex flex-col h-full font-sans shrink-0 shadow-sm z-20">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">{t("restaurant.floorPlan.floorInfo", "Floor Information")}</h3>
        </div>
        
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("restaurant.floorPlan.restaurantLabel", "RESTAURANT")}</label>
            <div className="text-sm font-medium text-gray-900">{restaurantName}</div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("restaurant.floorPlan.currentFloorLabel", "CURRENT FLOOR")}</label>
            <div className="text-sm font-medium text-gray-900">
              {activeFloor ? (activeFloor.name?.match(/^Floor\s+(\d+)$/i) ? t("restaurant.floorPlan.floorNum", "Floor {{num}}", { num: activeFloor.name.match(/^Floor\s+(\d+)$/i)[1] }) : activeFloor.name) : t("restaurant.floorPlan.noFloorSelected", "No Floor Selected")}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> {t("nav.tables", "Tables")}</div>
              <div className="text-lg font-bold text-gray-900">{activeTables.length}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {t("restaurant.floorPlan.seatsLabel", "Seats")}</div>
              <div className="text-lg font-bold text-gray-900">{totalSeats}</div>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">{t("restaurant.floorPlan.statusOverview", "STATUS OVERVIEW")}</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> {t("restaurant.tables.occupied", "Occupied")}</div>
                <span className="font-medium">{occupiedTables}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> {t("restaurant.tables.available", "Available")}</div>
                <span className="font-medium">{availableTables}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle selected items
  const isTable = selectedElements.some(el => tables.some(t => t.id === el || t._id === el))
  
  if (isTable) {
    // Only handling single table selection for now
    const selectedId = selectedElements[0]
    const table = tables.find(t => t.id === selectedId || t._id === selectedId)
    
    if (!table) return null

    return (
      <div className="w-[280px] max-w-full bg-white border-l border-gray-200 flex flex-col h-full font-sans shrink-0 shadow-sm z-20">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">{t("restaurant.floorPlan.tableProperties", "Table Properties")}</h3>
        </div>
        
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">{t("restaurant.floorPlan.tableNumber", "Table Number")}</label>
            <input 
              type="text" 
              value={table.tableNumber || ""}
              onChange={(e) => onUpdateTable(selectedId, { tableNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 block">{t("restaurant.floorPlan.capacity", "Capacity")}</label>
              <input 
                type="number" 
                value={table.capacity || 4}
                onChange={(e) => onUpdateTable(selectedId, { capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 block">{t("restaurant.floorPlan.rotation", "Rotation (°)")}</label>
              <input 
                type="number" 
                value={table.rotation || 0}
                onChange={(e) => onUpdateTable(selectedId, { rotation: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">{t("restaurant.floorPlan.shape", "Shape")}</label>
            <select 
              value={table.shape}
              onChange={(e) => onUpdateTable(selectedId, { shape: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="round">Round</option>
              <option value="square">Square</option>
              <option value="rectangular">Rectangle</option>
              <option value="oval">Oval</option>
              <option value="booth">Booth</option>
              <option value="bar">Bar</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">{t("restaurant.floorPlan.status", "Status")}</label>
            <select 
              value={table.status}
              onChange={(e) => onUpdateTable(selectedId, { status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="available">{t("restaurant.tables.available", "Available")}</option>
              <option value="reserved">{t("restaurant.tables.reserved", "Reserved")}</option>
              <option value="occupied">{t("restaurant.tables.occupied", "Occupied")}</option>
              <option value="blocked">{t("restaurant.tables.blocked", "Blocked")}</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">{t("restaurant.floorPlan.reservationInfo", "Reservation Info")}</label>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {t("restaurant.floorPlan.noActiveReservation", "No active reservation")}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
          <button 
            onClick={onDuplicate}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors shadow-sm"
          >
            <Copy className="w-4 h-4" /> {t("restaurant.floorPlan.duplicate", "Duplicate")}
          </button>
          <button 
            onClick={() => onDeleteTable(selectedId)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-medium text-red-600 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> {t("restaurant.floorPlan.delete", "Delete")}
          </button>
        </div>
      </div>
    )
  }

  // Handle Architecture/Element
  const selectedId = selectedElements[0]
  const element = elements.find(e => e.id === selectedId)
  
  if (!element) return null
  
  return (
    <div className="w-[280px] max-w-full bg-white border-l border-gray-200 flex flex-col h-full font-sans shrink-0 shadow-sm z-20">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm capitalize">{element.type.replace('_', ' ')} Properties</h3>
      </div>
      
      <div className="p-4 space-y-5 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">Length (px)</label>
            <input 
              type="number" 
              value={element.width || 100}
              onChange={(e) => onUpdateElement(selectedId, { width: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">Thickness (px)</label>
            <input 
              type="number" 
              value={element.height || 10}
              onChange={(e) => onUpdateElement(selectedId, { height: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 block">{t("restaurant.floorPlan.rotation", "Rotation (°)")}</label>
          <input 
            type="number" 
            value={element.rotation || 0}
            onChange={(e) => onUpdateElement(selectedId, { rotation: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">{t("restaurant.floorPlan.appearance", "Appearance")}</label>
          <ColorPalette color={element.color || "#4b5563"} onChange={(c) => onUpdateElement(selectedId, { color: c })} />
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
        <button 
          onClick={() => onUpdateElement(selectedId, { locked: !element.locked })}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors shadow-sm"
        >
          {element.locked ? <><Unlock className="w-4 h-4" /> {t("restaurant.floorPlan.unlock", "Unlock")}</> : <><Lock className="w-4 h-4" /> {t("restaurant.floorPlan.lock", "Lock")}</>}
        </button>
        <div className="flex gap-2">
          <button 
            onClick={onDuplicate}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors shadow-sm"
          >
            <Copy className="w-4 h-4" /> {t("restaurant.floorPlan.duplicate", "Duplicate")}
          </button>
          <button 
            onClick={() => onDeleteElement(selectedId)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-medium text-red-600 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> {t("restaurant.floorPlan.delete", "Delete")}
          </button>
        </div>
      </div>
    </div>
  )
}
