"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { FloorPlanCanvas } from "@/components/restaurant/floor-plan-canvas"
import { FloorPlanToolbar } from "@/components/restaurant/floor-plan-toolbar"
import { FloorPlanSidebar } from "@/components/restaurant/floor-plan-sidebar"
import { TablePropertiesPanel } from "@/components/restaurant/table-properties-panel"
import { ColorPalette } from "@/components/restaurant/color-palette"
import { toast } from "sonner"
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { useTranslation } from "react-i18next"

export default function FloorPlanPage() {
  const { partnerId } = usePartner()
  const { selectedBranchId, branches } = useBranchContext()
  const { t } = useTranslation()

  const [floors, setFloors] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [elements, setElements] = useState<any[]>([])
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState<{x: number, y: number}>({ x: 0, y: 0 })
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([])
  
  // New features state
  const [mode, setMode] = useState<"select" | "draw_room" | "draw_event" | "pan">("select")
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([])
  const [history, setHistory] = useState<{floors: any[], tables: any[], elements: any[]}[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    if (selectedBranchId && partnerId) {
      loadData()
    } else if (!selectedBranchId && !isLoading) {
      setFloors([])
      setTables([])
      setElements([])
      setActiveFloorId(null)
    }
  }, [selectedBranchId, partnerId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          const newTables = tables.filter(t => !selectedElementIds.includes(t._id || t.id))
          const newElements = elements.filter(el => !selectedElementIds.includes(el.id))
          
          if (newTables.length !== tables.length || newElements.length !== elements.length) {
            setTables(newTables)
            setElements(newElements)
            setSelectedElementIds([])
            // Use setTimeout to allow state to settle before saving history
            setTimeout(saveToHistory, 50)
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedElementIds.length > 0) {
          const toCopy = [
            ...tables.filter(t => selectedElementIds.includes(t._id || t.id)).map(t => ({...t, typeCategory: 'table'})),
            ...elements.filter(el => selectedElementIds.includes(el.id)).map(el => ({...el, typeCategory: 'element'}))
          ]
          sessionStorage.setItem('floorPlanClipboard', JSON.stringify(toCopy))
          toast.success("Copied to clipboard")
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const clipboard = sessionStorage.getItem('floorPlanClipboard')
        if (clipboard) {
          try {
            const parsed = JSON.parse(clipboard)
            const newIds: string[] = []
            const newTables = [...tables]
            const newElements = [...elements]

            parsed.forEach((item: any) => {
              const newId = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
              newIds.push(newId)
              
              const newItem = { ...item, id: newId, _id: undefined }
              
              if (newItem.typeCategory === 'table') {
                 newItem.tableNumber = newItem.tableNumber + " (Copy)"
                 newItem.position = { x: newItem.position.x + 40, y: newItem.position.y + 40 }
                 newTables.push(newItem)
              } else {
                 newItem.x = newItem.x + 40
                 newItem.y = newItem.y + 40
                 newElements.push(newItem)
              }
            })

            setTables(newTables)
            setElements(newElements)
            setSelectedElementIds(newIds)
            setTimeout(saveToHistory, 50)
            toast.success("Pasted from clipboard")
          } catch (err) {}
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementIds, tables, elements])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [floorsRes, tablesRes] = await Promise.all([
        api.get(`/restaurant/floors?branchId=${selectedBranchId}`),
        api.get(`/restaurant/tables?branchId=${selectedBranchId}`)
      ])
      
      setFloors(floorsRes.data)
      setTables(tablesRes.data)
      
      // Extract elements from floors
      const allElements: any[] = []
      floorsRes.data.forEach((f: any) => {
        if (f.elements) {
          f.elements.forEach((e: any) => {
             allElements.push({...e, floorId: f._id})
          })
        }
      })
      setElements(allElements)
      
      if (floorsRes.data.length > 0) {
        if (!activeFloorId || !floorsRes.data.find((f: any) => f._id === activeFloorId)) {
          setActiveFloorId(floorsRes.data[0]._id)
        }
      }
    } catch (err) {
      toast.error("Failed to load floor plan data")
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = () => {
    const currentState = { floors: JSON.parse(JSON.stringify(floors)), tables: JSON.parse(JSON.stringify(tables)), elements: JSON.parse(JSON.stringify(elements)) }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
    if (newHistory.length > 20) newHistory.shift() // keep last 20
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setFloors(history[historyIndex - 1].floors)
      setTables(history[historyIndex - 1].tables)
      setElements(history[historyIndex - 1].elements)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setFloors(history[historyIndex + 1].floors)
      setTables(history[historyIndex + 1].tables)
      setElements(history[historyIndex + 1].elements)
    }
  }

  const handleAddFloor = async () => {
    if (!partnerId || !selectedBranchId) {
      toast.error("Please select a branch first")
      return
    }
    try {
      const newFloor = {
        partnerId,
        branchId: selectedBranchId,
        name: `Floor ${floors.length + 1}`,
        order: floors.length,
        dimensions: { width: 1200, height: 800 },
        areas: [],
        elements: []
      }
      const res = await api.post('/restaurant/floors', newFloor)
      setFloors([...floors, res.data])
      setActiveFloorId(res.data._id)
      toast.success("Floor added")
    } catch {
      toast.error("Failed to add floor")
    }
  }

  const handleUpdateFloorName = async (id: string, name: string) => {
    try {
      await api.put(`/restaurant/floors/${id}`, { name })
      setFloors(floors.map(f => f._id === id ? { ...f, name } : f))
    } catch {
      toast.error("Failed to update floor name")
    }
  }

  const handleDeleteFloor = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this floor and all its tables?")) return
    try {
      await api.delete(`/restaurant/floors/${id}`)
      setFloors(floors.filter(f => f._id !== id))
      if (activeFloorId === id) setActiveFloorId(floors[0]?._id || null)
      toast.success("Floor deleted")
    } catch {
      toast.error("Failed to delete floor")
    }
  }

  const handleAddTable = (shape: string, presetCapacity?: number, presetColor?: string) => {
    if (!activeFloorId) {
      toast.error("Please select a floor first")
      return
    }
    
    let size = { width: 80, height: 80 }
    if (shape === "rectangular") size = { width: 120, height: 80 }
    if (presetCapacity === 6 && shape === "rectangular") size = { width: 160, height: 80 }

    const spawnX = Math.round((-pan.x + 400) / scale / 20) * 20
    const spawnY = Math.round((-pan.y + 300) / scale / 20) * 20

    const newTable = {
      id: `temp_${Date.now()}`,
      partnerId,
      branchId: selectedBranchId,
      floorId: activeFloorId,
      tableNumber: `T${tables.filter(t => t.floorId === activeFloorId).length + 1}`,
      capacity: presetCapacity || 4,
      minCapacity: 1,
      shape,
      position: { x: spawnX, y: spawnY },
      size,
      rotation: 0,
      status: "available",
      location: "indoor",
      isVip: false,
      color: presetColor,
      isNew: true // Flag to distinguish unsaved tables
    }
    
    setTables([...tables, newTable])
    setSelectedElementIds([newTable.id])
    saveToHistory()
  }

  const handleAddElement = (type: string) => {
    if (!activeFloorId) {
      toast.error("Please select a floor first")
      return
    }
    
    const spawnX = Math.round((-pan.x + 400) / scale / 20) * 20
    const spawnY = Math.round((-pan.y + 300) / scale / 20) * 20

    const newElement = {
      id: `elem_${Date.now()}`,
      floorId: activeFloorId,
      type,
      x: spawnX,
      y: spawnY,
      width: type === 'wall' ? 200 : type === 'window' ? 60 : type === 'door' ? 40 : type === 'corner_wall' ? 60 : type === 'bar_counter' ? 300 : type === 'partition' ? 100 : 40,
      height: type === 'wall' ? 10 : type === 'window' ? 10 : type === 'door' ? 40 : type === 'corner_wall' ? 60 : type === 'bar_counter' ? 60 : type === 'partition' ? 10 : 40,
      rotation: 0,
      color: type === 'plant' ? '#10b981' : '#4b5563'
    }
    
    setElements([...elements, newElement])
    setSelectedElementIds([newElement.id])
    saveToHistory()
  }

  const handleDropItem = (payload: any, pos: {x: number, y: number}) => {
    if (!activeFloorId) return
    
    if (payload.category === 'table') {
      let size = { width: 80, height: 80 }
      if (payload.shape === "rectangular") size = { width: 120, height: 80 }
      if (payload.capacity === 6 && payload.shape === "rectangular") size = { width: 160, height: 80 }

      const newTable = {
        id: `temp_${Date.now()}`,
        partnerId,
        branchId: selectedBranchId,
        floorId: activeFloorId,
        tableNumber: `T${tables.filter(t => t.floorId === activeFloorId).length + 1}`,
        capacity: payload.capacity || 4,
        minCapacity: 1,
        shape: payload.shape,
        position: pos,
        size,
        rotation: 0,
        status: "available",
        location: "indoor",
        isVip: false,
        color: payload.color,
        isNew: true
      }
      setTables([...tables, newTable])
      setSelectedElementIds([newTable.id])
      saveToHistory()
    } else if (payload.category === 'element') {
      const type = payload.type
      const newElement = {
        id: `elem_${Date.now()}`,
        floorId: activeFloorId,
        type,
        x: pos.x,
        y: pos.y,
        width: payload.width || (type === 'wall' ? 200 : type === 'window' ? 60 : type === 'door' ? 40 : type === 'corner_wall' ? 60 : type === 'bar_counter' ? 300 : type === 'partition' ? 100 : 40),
        height: payload.height || (type === 'wall' ? 10 : type === 'window' ? 10 : type === 'door' ? 40 : type === 'corner_wall' ? 60 : type === 'bar_counter' ? 60 : type === 'partition' ? 10 : 40),
        rotation: 0,
        color: payload.color || (type === 'plant' ? '#10b981' : '#4b5563')
      }
      setElements([...elements, newElement])
      setSelectedElementIds([newElement.id])
      saveToHistory()
    }
  }

  const handleAddArea = () => {
    if (!activeFloorId) return
    setMode("draw_room")
    setDrawingPoints([])
    toast.info("Click on the canvas to draw polygon vertices. Click 'Finish Room' when done.")
  }

  const handleAddEventArea = () => {
    if (!activeFloorId) return
    setMode("draw_event")
    setDrawingPoints([])
    toast.info("Click on the canvas to draw polygon vertices for the Event Area. Click 'Finish Room' when done.")
  }

  const handleCanvasClick = (p: {x: number, y: number}) => {
    if (mode === "draw_room" || mode === "draw_event") {
      setDrawingPoints([...drawingPoints, p])
    }
  }

  const handleFinishDrawing = () => {
    if (drawingPoints.length < 3) {
      toast.error("A room must have at least 3 points")
      return
    }
    const currentFloor = floors.find(f => f._id === activeFloorId)
    const newArea = {
      id: `area_${Date.now()}`,
      name: mode === "draw_event" ? `Event Area ${currentFloor.areas?.length + 1 || 1}` : `Room ${currentFloor.areas?.length + 1 || 1}`,
      type: mode === "draw_event" ? "event" : "room",
      points: drawingPoints,
      color: mode === "draw_event" ? "rgba(255, 165, 0, 0.2)" : "rgba(198, 156, 155, 0.2)"
    }
    setFloors(floors.map(f => f._id === activeFloorId ? { ...f, areas: [...(f.areas || []), newArea] } : f))
    setSelectedElementIds([newArea.id])
    setMode("select")
    setDrawingPoints([])
    saveToHistory()
  }

  const handleUpdateTable = (id: string, updates: any, saveHistory = false) => {
    setTables(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, ...updates } : t))
    if (saveHistory) saveToHistory()
  }

  const handleUpdateElement = (id: string, updates: any, saveHistory = false) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    if (saveHistory) saveToHistory()
  }

  const handleUpdateArea = (id: string, updates: any, saveHistory = false) => {
    setFloors(prev => prev.map(f => {
      if (f._id === activeFloorId) {
        return { ...f, areas: (f.areas || []).map((a: any) => a.id === id ? { ...a, ...updates } : a) }
      }
      return f
    }))
    if (saveHistory) saveToHistory()
  }

  const handleDeleteTable = (id: string) => {
    const table = tables.find(t => t._id === id || t.id === id)
    if (!table) return

    if (table.isNew) {
      setTables(tables.filter(t => t.id !== id))
      saveToHistory()
    } else {
      if (window.confirm("Delete this table?")) {
        api.delete(`/restaurant/tables/${id}`).then(() => {
          setTables(tables.filter(t => t._id !== id))
          setSelectedElementIds([])
          saveToHistory()
        }).catch(() => toast.error("Failed to delete table"))
      }
    }
  }

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id))
    setSelectedElementIds([])
    saveToHistory()
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save tables
      const promises = tables.map(t => {
        if (t.isNew) {
          const { id, isNew, color, ...data } = t
          return api.post('/restaurant/tables', data) // backend doesn't support color natively yet for tables, but let's send it anyway or just let it ignore.
        } else {
          const { _id, ...data } = t
          return api.put(`/restaurant/tables/${_id}`, data)
        }
      })
      
      // Save current floor areas and elements
      const currentFloor = floors.find(f => f._id === activeFloorId)
      if (currentFloor) {
        const floorElements = elements.filter(e => e.floorId === activeFloorId).map(({floorId, ...rest}) => rest)
        promises.push(api.put(`/restaurant/floors/${activeFloorId}`, { areas: currentFloor.areas, elements: floorElements }))
      }

      await Promise.all(promises)
      toast.success("Layout saved successfully")
      loadData() // Reload to get real IDs for new tables
    } catch {
      toast.error("Failed to save layout")
    } finally {
      setIsSaving(false)
    }
  }

  const activeTables = tables.filter(t => t.floorId === activeFloorId)
  const activeElements = elements.filter(e => e.floorId === activeFloorId)
  const activeFloor = floors.find(f => f._id === activeFloorId)

  // Property Panel State
  const selectedTable = selectedElementIds.length === 1 ? tables.find(t => (t._id === selectedElementIds[0] || t.id === selectedElementIds[0])) : null
  const selectedElement = selectedElementIds.length === 1 ? elements.find(e => e.id === selectedElementIds[0]) : null
  const selectedArea = selectedElementIds.length === 1 ? activeFloor?.areas?.find((a: any) => a.id === selectedElementIds[0]) : null

  const activeColor = selectedTable?.color || selectedElement?.color || selectedArea?.color || "#e5e7eb"

  const handleColorChange = (color: string) => {
    if (selectedElementIds.length === 0) return
    selectedElementIds.forEach(id => {
      if (tables.some(t => t._id === id || t.id === id)) handleUpdateTable(id, { color })
      else if (elements.some(e => e.id === id)) handleUpdateElement(id, { color })
      else handleUpdateArea(id, { color })
    })
    saveToHistory()
  }

  const handleSelectElement = (id: string | null | string[], shiftKey: boolean = false) => {
    if (!id) {
      setSelectedElementIds([])
    } else if (Array.isArray(id)) {
      if (shiftKey) {
        setSelectedElementIds(prev => Array.from(new Set([...prev, ...id])))
      } else {
        setSelectedElementIds(id)
      }
    } else {
      if (shiftKey) {
        setSelectedElementIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
      } else {
        setSelectedElementIds([id])
      }
    }
  }

  return (
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardSidebar activePath="/dashboard/restaurant/floor-plan" />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 overflow-hidden flex flex-col relative bg-[#F0F0F0]">
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Top Bar - Floor Selection */}
            <div className="bg-white border-b border-border/60 px-4 py-2 flex items-center justify-between shrink-0 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground mr-2">Floor Plan</span>
              {floors.map(floor => (
                <div key={floor._id} className="flex items-center">
                  <button
                    onClick={() => setActiveFloorId(floor._id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      activeFloorId === floor._id 
                        ? 'bg-[#E5555E] text-white shadow-sm' 
                        : 'bg-[#FAFAFA] border border-border/60 text-muted-foreground hover:bg-gray-50'
                    }`}
                  >
                    {floor.name}
                  </button>
                  {activeFloorId === floor._id && (
                    <button onClick={() => handleDeleteFloor(floor._id)} className="ml-1 p-1.5 text-muted-foreground hover:text-red-500 rounded-md">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {selectedBranchId && (
                <>
                  {mode === "draw_room" ? (
                    <div className="flex gap-2 ml-2 border-l border-border/60 pl-4">
                      <button onClick={handleFinishDrawing} className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-semibold shadow-sm">Finish Room</button>
                      <button onClick={() => { setMode("select"); setDrawingPoints([]) }} className="px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-semibold shadow-sm">Cancel</button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddFloor}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white hover:bg-black rounded-lg text-sm font-semibold transition-colors ml-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Floor
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {!selectedBranchId ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Please select a branch from the header.</p>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
            </div>
          ) : !activeFloorId ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Add a floor to start designing your layout.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col w-full min-h-0 overflow-hidden relative">
              <FloorPlanToolbar
                onAddTable={handleAddTable}
                onAddArea={handleAddArea}
                onAddEventArea={handleAddEventArea}
                onZoomIn={() => setScale(s => Math.min(2, s + 0.1))}
                onZoomOut={() => setScale(s => Math.max(0.5, s - 0.1))}
                onResetZoom={() => { setScale(1); setPan({x: 0, y: 0}); }}
                onSave={handleSave}
                isSaving={isSaving}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                mode={mode}
                setMode={setMode}
              />
              
              <div className="flex-1 flex w-full overflow-hidden relative">
                {activeFloorId && (
                  <FloorPlanSidebar 
                    onAddTable={handleAddTable} 
                    onAddElement={handleAddElement}
                    activeColor={activeColor}
                    onColorChange={handleColorChange}
                  />
                )}
                <FloorPlanCanvas
                  floor={activeFloor}
                  tables={activeTables}
                  elements={activeElements}
                  selectedElementIds={selectedElementIds}
                  onSelectElement={handleSelectElement}
                  onUpdateTable={(id, updates) => handleUpdateTable(id, updates, false)}
                  onUpdateArea={(id, updates) => handleUpdateArea(id, updates, false)}
                  onUpdateElement={(id, updates) => handleUpdateElement(id, updates, false)}
                  onCanvasClick={handleCanvasClick}
                  onDragEnd={() => saveToHistory()}
                  mode={mode}
                  drawingPoints={drawingPoints}
                  scale={scale}
                  pan={pan}
                  onPanChange={setPan}
                  onDropItem={handleDropItem}
                />
                
                {selectedTable && (
                  <TablePropertiesPanel
                    selectedTable={selectedTable}
                    onUpdate={(updates) => handleUpdateTable(selectedTable._id || selectedTable.id, updates, true)}
                    onDelete={() => handleDeleteTable(selectedTable._id || selectedTable.id)}
                    onDeselect={() => setSelectedElementIds([])}
                  />
                )}

                {selectedElement && (
                  <div className="absolute top-4 right-4 w-80 bg-white border border-border/60 shadow-xl rounded-xl flex flex-col z-20">
                    <div className="p-4 border-b border-border/60 flex items-center justify-between bg-[#FAFAFA] rounded-t-xl">
                      <h3 className="font-bold text-foreground capitalize">{selectedElement.type.replace('_', ' ')} Properties</h3>
                      <button onClick={() => setSelectedElementIds([])} className="text-muted-foreground hover:text-foreground text-sm font-medium">Close</button>
                    </div>
                    <div className="p-4 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Length</label>
                           <input
                             type="number"
                             value={selectedElement.width}
                             onChange={(e) => handleUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 20 }, true)}
                             className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                             min="10"
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thickness</label>
                           <input
                             type="number"
                             value={selectedElement.height}
                             onChange={(e) => handleUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 10 }, true)}
                             className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                             min="2"
                           />
                         </div>
                       </div>
                       <ColorPalette color={selectedElement.color || "#4b5563"} onChange={(c) => handleUpdateElement(selectedElement.id, { color: c }, true)} />
                       <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Element
                      </button>
                    </div>
                  </div>
                )}

                {selectedArea && (
                  <div className="absolute top-4 right-4 w-80 bg-white border border-border/60 shadow-xl rounded-xl flex flex-col z-20">
                     <div className="p-4 border-b border-border/60 flex items-center justify-between bg-[#FAFAFA] rounded-t-xl">
                        <h3 className="font-bold text-foreground">Area Properties</h3>
                        <button onClick={() => setSelectedElementIds([])} className="text-muted-foreground hover:text-foreground text-sm font-medium">Close</button>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Name</label>
                          <input
                            type="text"
                            value={selectedArea.name}
                            onChange={(e) => handleUpdateArea(selectedArea.id, { name: e.target.value }, true)}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Type</label>
                          <select
                            value={selectedArea.type}
                            onChange={(e) => handleUpdateArea(selectedArea.id, { type: e.target.value }, true)}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                          >
                            <option value="room">Room</option>
                            <option value="hall">Hall</option>
                            <option value="terrace">Terrace</option>
                            <option value="vip">VIP Area</option>
                            <option value="bar">Bar</option>
                          </select>
                        </div>
                        <div className="pt-2 border-t border-border/60">
                           <ColorPalette color={selectedArea.color || "rgba(200,200,200,0.2)"} onChange={(c) => handleUpdateArea(selectedArea.id, { color: c }, true)} />
                        </div>
                         <button
                          onClick={() => {
                            if (window.confirm("Delete this area?")) {
                              handleUpdateArea(selectedArea.id, { deleted: true }) // Actually remove it from array
                              setFloors(floors.map(f => f._id === activeFloorId ? { ...f, areas: f.areas.filter((a: any) => a.id !== selectedArea.id) } : f))
                              setSelectedElementIds([])
                            }
                          }}
                          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Area
                        </button>
                      </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}
