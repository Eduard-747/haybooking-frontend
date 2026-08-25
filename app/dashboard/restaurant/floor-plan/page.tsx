"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { FloorPlanCanvas } from "@/components/restaurant/floor-plan-canvas"
import { FloorPlanToolbar } from "@/components/restaurant/floor-plan-toolbar"
import { FloorPlanSidebar } from "@/components/restaurant/floor-plan-sidebar"
import { PropertiesPanel } from "@/components/restaurant/properties-panel"
import { FloorPlanStatusBar } from "@/components/restaurant/floor-plan-status-bar"
import { AiFloorPlanModal } from "@/components/restaurant/ai-floor-plan-modal"
import { toast } from "sonner"
import { Loader2, MapPin, PanelLeftOpen, PanelRightOpen, X } from "lucide-react"
import api from "@/lib/api"
import { useTranslation } from "react-i18next"

export default function FloorPlanPage() {
  const { partnerId } = usePartner()
  const { selectedBranchId } = useBranchContext()
  const { t } = useTranslation()

  const [floors, setFloors] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [elements, setElements] = useState<any[]>([])
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Mobile Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false)
  
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState<{x: number, y: number}>({ x: 0, y: 0 })
  const [mouseCoordinates, setMouseCoordinates] = useState<{x: number, y: number}>({ x: 0, y: 0 })
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([])
  
  // App State
  const [mode, setMode] = useState<"select" | "pan" | "draw_wall" | "draw_room" | "add_table" | "add_label">("select")
  const [gridEnabled, setGridEnabled] = useState(true)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [measurementEnabled, setMeasurementEnabled] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([])
  
  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false)
  const [floorModalMode, setFloorModalMode] = useState<"add" | "edit">("add")
  const [floorModalName, setFloorModalName] = useState("")
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null)
  
  // History
  const [history, setHistory] = useState<{floors: any[], tables: any[], elements: any[]}[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    if (selectedBranchId && partnerId) {
      loadData()
    } else {
      setFloors([])
      setTables([])
      setElements([])
      setActiveFloorId(null)
      setIsLoading(false)
    }
  }, [selectedBranchId, partnerId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        handleCopy()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        handlePaste()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        undo()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
        redo()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicate()
      }

      if (e.key === ' ') {
        e.preventDefault()
        setMode("pan")
      }
      
      if (e.key === 'v') setMode("select")
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && mode === "pan") {
        setMode("select")
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedElementIds, tables, elements, mode, historyIndex])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [floorsRes, tablesRes] = await Promise.all([
        api.get(`/restaurant/floors?branchId=${selectedBranchId}`),
        api.get(`/restaurant/tables?branchId=${selectedBranchId}`)
      ])
      
      setFloors(floorsRes.data)
      setTables(tablesRes.data)
      
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
    if (newHistory.length > 20) newHistory.shift()
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
  
  const handleCopy = () => {
    if (selectedElementIds.length > 0) {
      const toCopy = [
        ...tables.filter(t => selectedElementIds.includes(t._id || t.id)).map(t => ({...t, typeCategory: 'table'})),
        ...elements.filter(el => selectedElementIds.includes(el.id)).map(el => ({...el, typeCategory: 'element'}))
      ]
      sessionStorage.setItem('floorPlanClipboard', JSON.stringify(toCopy))
      toast.success("Copied to clipboard")
    }
  }
  
  const handlePaste = () => {
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
             newItem.isNew = true
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
      } catch (err) {}
    }
  }
  
  const handleDuplicate = () => {
    handleCopy()
    handlePaste()
  }
  
  const handleDeleteSelected = () => {
    if (selectedElementIds.length > 0) {
      const newTables = tables.filter(t => !selectedElementIds.includes(t._id || t.id))
      const newElements = elements.filter(el => !selectedElementIds.includes(el.id))
      
      if (newTables.length !== tables.length || newElements.length !== elements.length) {
        setTables(newTables)
        setElements(newElements)
        setSelectedElementIds([])
        setTimeout(saveToHistory, 50)
      }
    }
  }

  const handleOpenAddFloorModal = () => {
    setFloorModalMode("add")
    setFloorModalName(`Floor ${floors.length + 1}`)
    setEditingFloorId(null)
    setIsFloorModalOpen(true)
  }

  const handleOpenEditFloorModal = (floor: any) => {
    setFloorModalMode("edit")
    setFloorModalName(floor.name)
    setEditingFloorId(floor._id)
    setIsFloorModalOpen(true)
  }

  const handleSaveFloorModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!floorModalName.trim()) return toast.error("Please enter a floor name")
    if (!partnerId || !selectedBranchId) return toast.error("Please select a branch first")

    try {
      if (floorModalMode === "add") {
        const newFloor = {
          partnerId,
          branchId: selectedBranchId,
          name: floorModalName.trim(),
          order: floors.length,
          dimensions: { width: 2000, height: 2000 },
          areas: [],
          elements: []
        }
        const res = await api.post('/restaurant/floors', newFloor)
        setFloors(prev => [...prev, res.data])
        setActiveFloorId(res.data._id)
        toast.success("Floor added")
      } else if (floorModalMode === "edit" && editingFloorId) {
        await api.put(`/restaurant/floors/${editingFloorId}`, { name: floorModalName.trim() })
        setFloors(prev => prev.map(f => f._id === editingFloorId ? { ...f, name: floorModalName.trim() } : f))
        toast.success("Floor updated")
      }
      setIsFloorModalOpen(false)
    } catch {
      toast.error("Failed to save floor")
    }
  }

  const handleDeleteFloor = async (floorId: string) => {
    if (!confirm("Are you sure you want to delete this floor and all its contents?")) return
    try {
      await api.delete(`/restaurant/floors/${floorId}`)
      const remainingFloors = floors.filter(f => f._id !== floorId)
      setFloors(remainingFloors)
      setTables(prev => prev.filter(t => t.floorId !== floorId))
      setElements(prev => prev.filter(e => e.floorId !== floorId))
      if (activeFloorId === floorId) {
        setActiveFloorId(remainingFloors[0]?._id || null)
      }
      toast.success("Floor deleted")
    } catch {
      toast.error("Failed to delete floor")
    }
  }

  const handleAddTable = (shape: string, capacity?: number, presetColor?: string) => {
    if (!activeFloorId) return toast.error("Please select a floor first")
    
    let size = { width: 80, height: 80 }
    if (shape === "rectangular") size = { width: 120, height: 80 }
    if (shape === "high") size = { width: 100, height: 30 }
    if (shape === "expandable") size = { width: 120, height: 100 }
    if (shape === "foldable" || shape === "connectable") size = { width: 100, height: 100 }
    if (shape === "bar") size = { width: 80, height: 50 }
    if (['chef_table', 'family_table'].includes(shape)) size = { width: 140, height: 60 }
    if (shape === "event_table") size = { width: 160, height: 80 }
    if (shape === "private_dining") size = { width: 100, height: 100 }
    
    const spawnX = Math.round((-pan.x + window.innerWidth / 2) / scale / 20) * 20
    const spawnY = Math.round((-pan.y + window.innerHeight / 2) / scale / 20) * 20

    const newTable = {
      id: `temp_${Date.now()}`,
      partnerId, branchId: selectedBranchId, floorId: activeFloorId,
      tableNumber: `T${tables.filter(t => t.floorId === activeFloorId).length + 1}`,
      capacity: capacity || 4, minCapacity: 1,
      shape, position: { x: spawnX, y: spawnY }, size,
      rotation: 0, status: "available", location: "indoor",
      isVip: false, color: presetColor, isNew: true
    }
    
    setTables([...tables, newTable])
    setSelectedElementIds([newTable.id])
    saveToHistory()
  }

  const handleAddElement = (type: string) => {
    if (!activeFloorId) return toast.error("Please select a floor first")
    
    const spawnX = Math.round((-pan.x + window.innerWidth / 2) / scale / 20) * 20
    const spawnY = Math.round((-pan.y + window.innerHeight / 2) / scale / 20) * 20

    let w = 40, h = 40
    if (type === 'wall') { w = 200; h = 10 }
    else if (['bench', 'sofa', 'waiting_bench', 'cabinet'].includes(type)) { w = 80; h = 40 }
    else if (['cashier'].includes(type)) { w = 60; h = 40 }
    else if (['buffet'].includes(type)) { w = 120; h = 40 }
    else if (['reception_desk'].includes(type)) { w = 80; h = 80 }
    else if (['wheelchair', 'sofa_seat'].includes(type)) { w = 60; h = 60 }
    else if (['coat_rack'].includes(type)) { w = 40; h = 40 }

    const newElement = {
      id: `elem_${Date.now()}`, floorId: activeFloorId, type,
      x: spawnX, y: spawnY,
      width: w,
      height: h,
      rotation: 0, color: type === 'plant' ? '#10b981' : '#4b5563'
    }
    
    setElements([...elements, newElement])
    setSelectedElementIds([newElement.id])
    saveToHistory()
  }

  const handleDropItem = (payload: any, pos: {x: number, y: number}) => {
    if (!activeFloorId) return
    
    if (payload.category === 'table') {
      handleAddTable(payload.shape, payload.capacity)
      // Adjust position of just added table
      setTables(prev => {
        const last = prev[prev.length - 1]
        last.position = pos
        return [...prev]
      })
    } else if (payload.category === 'element') {
      const type = payload.type
      const newElement: any = {
        id: `elem_${Date.now()}`, floorId: activeFloorId, type,
        x: pos.x, y: pos.y,
        width: payload.width || (type === 'label' ? 120 : 40), height: payload.height || (type === 'label' ? 40 : 40),
        rotation: 0, color: payload.color || '#4b5563',
        ...(payload.text ? { text: payload.text } : {})
      }
      setElements([...elements, newElement])
      setSelectedElementIds([newElement.id])
      saveToHistory()
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const promises = tables.map(t => {
        if (t.isNew) {
          const { id, isNew, color, ...data } = t
          return api.post('/restaurant/tables', data)
        } else {
          const { _id, ...data } = t
          return api.put(`/restaurant/tables/${_id}`, data)
        }
      })
      
      const currentFloor = floors.find(f => f._id === activeFloorId)
      if (currentFloor) {
        const floorElements = elements.filter(e => e.floorId === activeFloorId).map(({floorId, ...rest}) => rest)
        promises.push(api.put(`/restaurant/floors/${activeFloorId}`, { areas: currentFloor.areas, elements: floorElements }))
      }

      await Promise.all(promises)
      toast.success("Layout saved successfully")
      loadData()
    } catch {
      toast.error("Failed to save layout")
    } finally {
      setIsSaving(false)
    }
  }

  const activeColor = "#e5e7eb"

  return (
    <div className="h-screen bg-white flex font-sans overflow-hidden">
      {/* Keeping Dashboard Sidebar and Header collapsed or removed if user wants full screen, 
          but usually we keep it for navigation */}
      <DashboardSidebar activePath="/dashboard/restaurant/floor-plan" />
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-[#F9FAFB]">
        <DashboardHeader />
        {/* Toolbar spanning full width above canvas */}
        <FloorPlanToolbar
          onZoomIn={() => setScale(s => Math.min(2, s + 0.1))}
          onZoomOut={() => setScale(s => Math.max(0.5, s - 0.1))}
          onFitScreen={() => { setScale(0.8); setPan({x: 100, y: 100}); }}
          onSave={handleSave}
          isSaving={isSaving}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          mode={mode}
          setMode={setMode}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteSelected}
          gridEnabled={gridEnabled}
          setGridEnabled={setGridEnabled}
          snapEnabled={snapEnabled}
          setSnapEnabled={setSnapEnabled}
          measurementEnabled={measurementEnabled}
          setMeasurementEnabled={setMeasurementEnabled}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          floors={floors}
          activeFloorId={activeFloorId}
          setActiveFloorId={setActiveFloorId}
          onAddFloor={handleOpenAddFloorModal}
          onEditFloor={handleOpenEditFloorModal}
          onDeleteFloor={handleDeleteFloor}
          onOpenAiModal={() => setIsAiModalOpen(true)}
        />
        
        <main className="flex-1 overflow-hidden flex relative">
          {!selectedBranchId ? (
            <div className="flex-1 flex items-center justify-center bg-white m-6 lg:m-8 rounded-xl border border-border/40 shadow-sm">
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-[#FF4444]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("restaurant.floorPlan.selectBranchTitle", "Select a Branch")}</h2>
                <p className="text-muted-foreground max-w-md">{t("restaurant.floorPlan.selectBranchSubtitle", "Please select a specific branch from the top menu to view and manage its floor plan.")}</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : !activeFloorId ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
              <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <PanelLeftOpen className="w-8 h-8 text-[#FF385C]" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{t("restaurant.floorPlan.addFloor", "Add Floor")}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t("restaurant.floorPlan.addFloorPrompt", "Add a floor to start designing your layout.")}</p>
                <button
                  onClick={handleOpenAddFloorModal}
                  className="w-full py-3 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#FF385C]/25 active:scale-98 flex items-center justify-center gap-2"
                >
                  + {t("restaurant.floorPlan.addFloor", "Add Floor")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Left Sidebar Overlay / Desktop Fixed */}
              <div className={`
                fixed lg:relative inset-y-0 left-0 z-40 bg-white transition-transform duration-300 shadow-2xl lg:shadow-none h-full shrink-0
                ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              `}>
                {isMobileSidebarOpen && (
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="lg:hidden absolute top-3 right-3 z-50 p-1.5 rounded-xl bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <FloorPlanSidebar 
                  onAddTable={(shape, capacity, presetColor) => {
                    handleAddTable(shape, capacity, presetColor)
                    setIsMobileSidebarOpen(false)
                  }} 
                  onAddElement={(type) => {
                    handleAddElement(type)
                    setIsMobileSidebarOpen(false)
                  }}
                  activeColor={activeColor}
                  onColorChange={() => {}}
                />
              </div>

              {/* Mobile backdrop overlay */}
              {(isMobileSidebarOpen || isMobilePropertiesOpen) && (
                <div 
                  className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-30" 
                  onClick={() => {
                    setIsMobileSidebarOpen(false)
                    setIsMobilePropertiesOpen(false)
                  }} 
                />
              )}

              {/* Center Canvas */}
              <div className="flex-1 overflow-hidden flex flex-col relative bg-[#F9FAFB] w-full min-w-0">
                {/* Floating Mobile Drawer Toggles */}
                <div className="lg:hidden absolute top-3 left-3 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileSidebarOpen(!isMobileSidebarOpen)
                      setIsMobilePropertiesOpen(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md backdrop-blur-md border border-slate-700 active:scale-95 transition-all"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5 text-[#FF385C]" />
                    <span>{t("restaurant.floorPlan.assets", "Assets")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobilePropertiesOpen(!isMobilePropertiesOpen)
                      setIsMobileSidebarOpen(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md backdrop-blur-md border border-slate-700 active:scale-95 transition-all"
                  >
                    <PanelRightOpen className="w-3.5 h-3.5 text-[#FF385C]" />
                    <span>{t("restaurant.floorPlan.properties", "Properties")}</span>
                  </button>
                </div>

                <FloorPlanCanvas
                  floor={floors.find(f => f._id === activeFloorId)}
                  tables={tables.filter(t => t.floorId === activeFloorId)}
                  elements={elements.filter(e => e.floorId === activeFloorId)}
                  selectedElementIds={selectedElementIds}
                  onSelectElement={(id, shift) => {
                    if (!id) setSelectedElementIds([])
                    else if (Array.isArray(id)) setSelectedElementIds(shift ? [...new Set([...selectedElementIds, ...id])] : id)
                    else setSelectedElementIds(shift ? (selectedElementIds.includes(id) ? selectedElementIds.filter(i => i !== id) : [...selectedElementIds, id]) : [id])
                  }}
                  onUpdateTable={(id, updates) => {
                    setTables(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, ...updates } : t))
                  }}
                  onUpdateArea={() => {}}
                  onUpdateElement={(id, updates) => {
                    setElements(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
                  }}
                  onCanvasClick={() => {}}
                  onDragEnd={() => saveToHistory()}
                  mode={mode}
                  drawingPoints={drawingPoints}
                  scale={scale}
                  pan={pan}
                  onPanChange={setPan}
                  onDropItem={handleDropItem}
                  gridEnabled={gridEnabled}
                  snapEnabled={snapEnabled}
                  onMouseMove={(p) => setMouseCoordinates(p)}
                />

                {/* Bottom Status Bar */}
                <FloorPlanStatusBar
                  scale={scale}
                  pan={pan}
                  onZoomIn={() => setScale(s => Math.min(2, s + 0.1))}
                  onZoomOut={() => setScale(s => Math.max(0.5, s - 0.1))}
                  onResetZoom={() => { setScale(1); setPan({x: 0, y: 0}); }}
                  mouseCoordinates={mouseCoordinates}
                  snapEnabled={snapEnabled}
                />
              </div>

              {/* Right Properties Panel Overlay / Desktop Fixed */}
              <div className={`
                fixed lg:relative inset-y-0 right-0 z-40 bg-white transition-transform duration-300 shadow-2xl lg:shadow-none h-full shrink-0
                ${isMobilePropertiesOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
              `}>
                {isMobilePropertiesOpen && (
                  <button
                    onClick={() => setIsMobilePropertiesOpen(false)}
                    className="lg:hidden absolute top-3 left-3 z-50 p-1.5 rounded-xl bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <PropertiesPanel
                  selectedElements={selectedElementIds}
                  tables={tables}
                  elements={elements}
                  floors={floors}
                  activeFloorId={activeFloorId}
                  onUpdateTable={(id, updates) => {
                    setTables(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, ...updates } : t))
                    saveToHistory()
                  }}
                  onUpdateElement={(id, updates) => {
                    setElements(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
                    saveToHistory()
                  }}
                  onDeleteTable={(id) => {
                    setTables(tables.filter(t => t._id !== id && t.id !== id))
                    setSelectedElementIds([])
                    saveToHistory()
                  }}
                  onDeleteElement={(id) => {
                    setElements(elements.filter(e => e.id !== id))
                    setSelectedElementIds([])
                    saveToHistory()
                  }}
                  onDuplicate={handleDuplicate}
                  restaurantName="Haybooking Reference"
                />
              </div>
            </>
          )}
        </main>
      </div>

      {selectedBranchId && partnerId && (
        <AiFloorPlanModal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
          branchId={selectedBranchId}
          partnerId={partnerId}
          onSuccess={(newFloor) => {
            setFloors(prev => [...prev, newFloor])
            setActiveFloorId(newFloor._id)
            loadData() // Reload everything to get the tables
          }}
        />
      )}

      {/* Add / Edit Floor Modal */}
      {isFloorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-base font-extrabold text-slate-900">
                {floorModalMode === "add" 
                  ? t("restaurant.floorPlan.addFloor", "Add Floor") 
                  : t("restaurant.floorPlan.editFloor", "Edit Floor")}
              </h3>
              <button 
                onClick={() => setIsFloorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFloorModal} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t("restaurant.floorPlan.floorName", "Floor Name")}
                </label>
                <input 
                  type="text"
                  required
                  autoFocus
                  value={floorModalName}
                  onChange={(e) => setFloorModalName(e.target.value)}
                  placeholder={t("restaurant.floorPlan.floorNamePlaceholder", "e.g. Main Hall, Terrace, 2nd Floor")}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFloorModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#FF385C]/25"
                >
                  {floorModalMode === "add" ? "Create Floor" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
