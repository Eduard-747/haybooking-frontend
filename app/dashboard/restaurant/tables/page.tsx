"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { usePartner } from "@/hooks/usePartner"
import { toast } from "sonner"
import { Loader2, Settings2, Search, Edit, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { useTranslation } from "react-i18next"

export default function TablesManagementPage() {
  const { t } = useTranslation()
  const { partnerId } = usePartner()
  const { selectedBranchId } = useBranchContext()

  const [tables, setTables] = useState<any[]>([])
  const [floors, setFloors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [floorFilter, setFloorFilter] = useState("all")

  useEffect(() => {
    if (selectedBranchId && partnerId) {
      loadData()
    } else if (!selectedBranchId && !isLoading) {
      setTables([])
      setFloors([])
    }
  }, [selectedBranchId, partnerId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [tablesRes, floorsRes] = await Promise.all([
        api.get(`/restaurant/tables?branchId=${selectedBranchId}`),
        api.get(`/restaurant/floors?branchId=${selectedBranchId}`)
      ])
      
      setTables(tablesRes.data)
      setFloors(floorsRes.data)
    } catch (err) {
      toast.error("Failed to load tables")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/restaurant/tables/${id}/status`, { status: newStatus })
      setTables(tables.map(t => t._id === id ? { ...t, status: newStatus } : t))
      toast.success("Table status updated")
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const filteredTables = tables.filter(t => {
    const matchesSearch = (t.tableNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    const matchesFloor = floorFilter === "all" || t.floorId === floorFilter
    return matchesSearch && matchesStatus && matchesFloor
  })

  return (
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardSidebar activePath="/dashboard/restaurant/tables" />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("restaurant.tables.title", "Table Management")}</h1>
                <p className="text-muted-foreground mt-1">{t("restaurant.tables.subtitle", "Manage and update status for all tables across your restaurant.")}</p>
              </div>
            </div>

            {!selectedBranchId ? (
              <div className="bg-white rounded-xl border border-border/40 p-12 flex flex-col items-center justify-center text-center shadow-sm mt-6">
                <div className="w-20 h-20 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-[#FF4444]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("restaurant.floorPlan.selectBranchTitle", "Select a Branch")}</h2>
                <p className="text-muted-foreground max-w-md">{t("restaurant.tables.selectBranchSubtitle", "Please select a specific branch from the top menu to view and manage its tables.")}</p>
              </div>
            ) : (
              <>
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col items-center text-center">
                <span className="text-2xl font-bold text-foreground">{tables.length}</span>
                <span className="text-sm font-medium text-muted-foreground mt-1">{t("restaurant.tables.totalTables", "Total Tables")}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col items-center text-center">
                <span className="text-2xl font-bold text-emerald-600">{tables.filter(t => t.status === 'available').length}</span>
                <span className="text-sm font-medium text-muted-foreground mt-1">{t("restaurant.tables.available", "Available")}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col items-center text-center">
                <span className="text-2xl font-bold text-blue-600">{tables.filter(t => t.status === 'occupied').length}</span>
                <span className="text-sm font-medium text-muted-foreground mt-1">{t("restaurant.tables.occupied", "Occupied")}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col items-center text-center">
                <span className="text-2xl font-bold text-amber-600">{tables.filter(t => t.status === 'reserved').length}</span>
                <span className="text-sm font-medium text-muted-foreground mt-1">{t("restaurant.tables.reserved", "Reserved")}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("restaurant.tables.searchPlaceholder", "Search table number or notes...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-white min-w-[140px]"
                >
                  <option value="all">{t("restaurant.tables.allFloors", "All Floors")}</option>
                  {floors.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-white min-w-[140px]"
                >
                  <option value="all">{t("restaurant.tables.allStatuses", "All Statuses")}</option>
                  <option value="available">{t("restaurant.tables.available", "Available")}</option>
                  <option value="reserved">{t("restaurant.tables.reserved", "Reserved")}</option>
                  <option value="occupied">{t("restaurant.tables.occupied", "Occupied")}</option>
                  <option value="cleaning">{t("restaurant.tables.cleaning", "Cleaning")}</option>
                  <option value="out_of_service">{t("restaurant.tables.outOfService", "Out of Service")}</option>
                  <option value="blocked">{t("restaurant.tables.blocked", "Blocked")}</option>
                </select>
              </div>
            </div>

            {/* Table List */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF4444]" />
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-border/60 border-dashed">
                <p className="text-muted-foreground">No tables found matching your filters.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAFA] border-b border-border/60 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.tables.tableHeader", "Table")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.tables.floorHeader", "Floor")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.tables.capacityHeader", "Capacity")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.tables.locationHeader", "Location")}</th>
                      <th className="px-6 py-3 font-semibold">{t("restaurant.tables.statusHeader", "Status")}</th>
                      <th className="px-6 py-3 font-semibold text-right">{t("restaurant.tables.actionsHeader", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredTables.map(tItem => {
                      const floor = floors.find(f => f._id === tItem.floorId)
                      return (
                        <tr key={tItem._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{tItem.tableNumber}</span>
                              {tItem.isVip && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">VIP</span>}
                            </div>
                            {tItem.notes && <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{tItem.notes}</p>}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">{floor?.name || "—"}</td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">{tItem.minCapacity} - {tItem.capacity} {t("restaurant.tables.seats", "seats")}</td>
                          <td className="px-6 py-4 text-muted-foreground font-medium capitalize">{tItem.location === "indoor" ? t("restaurant.tables.indoor", "Indoor") : tItem.location === "outdoor" ? t("restaurant.tables.outdoor", "Outdoor") : tItem.location}</td>
                          <td className="px-6 py-4">
                            <select
                              value={tItem.status}
                              onChange={(e) => handleStatusChange(tItem._id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border-2 transition-colors cursor-pointer outline-none ${
                                tItem.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                tItem.status === 'occupied' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                tItem.status === 'reserved' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                tItem.status === 'cleaning' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                            >
                              <option value="available">{t("restaurant.tables.available", "Available")}</option>
                              <option value="reserved">{t("restaurant.tables.reserved", "Reserved")}</option>
                              <option value="occupied">{t("restaurant.tables.occupied", "Occupied")}</option>
                              <option value="cleaning">{t("restaurant.tables.cleaning", "Cleaning")}</option>
                              <option value="out_of_service">{t("restaurant.tables.outOfService", "Out of Service")}</option>
                              <option value="blocked">{t("restaurant.tables.blocked", "Blocked")}</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a href="/dashboard/restaurant/floor-plan" className="inline-flex items-center gap-1 text-[#FF4444] hover:underline text-xs font-semibold">
                              <Edit className="h-3 w-3" /> {t("restaurant.tables.editInFloorPlan", "Edit in Floor Plan")}
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
