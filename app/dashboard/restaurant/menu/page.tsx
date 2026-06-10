"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Search, ChevronDown, Plus, Image as ImageIcon, X, Trash2, Edit, Upload, MapPin } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import Image from "next/image"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { formatPrice } from "@/lib/currency"
import { useTranslation } from "react-i18next"

interface MenuItem {
  _id: string
  name: string
  description?: string
  category: string
  price: number
  branchId?: string
  isAvailable: boolean
  image?: string
}

export default function ManageMenuPage() {
  const { partnerId, partner } = usePartner()
  const { selectedBranchId } = useBranchContext()
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("last-modified")
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Form state
  const defaultForm = { name: "", description: "", category: "", price: "" as string | number, image: "", branchId: "", isAvailable: true }
  const [formData, setFormData] = useState(defaultForm)

  // Branches for assignment
  const [branches, setBranches] = useState<{ _id: string; address: { city: string; line1: string } }[]>([])

  // Fetch menu items scoped to partner
  const fetchMenuItems = async () => {
    if (!partnerId) return
    try {
      setIsLoading(true)
      const response = await api.get(`/restaurant/menu?partnerId=${partnerId}`)
      setMenuItems(response.data)
    } catch (error) {
      console.error("Failed to fetch services", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      fetchMenuItems()
      // Fetch branches for the selector
      api.get(`/branches?partnerId=${partnerId}`)
        .then(res => setBranches(res.data || []))
        .catch(() => {})
    }
  }, [partnerId])

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(s => s.category).filter(Boolean))
    return ["All", ...Array.from(cats)]
  }, [menuItems])

  // Filtered & Sorted Menu Items
  const processedMenuItems = useMemo(() => {
    let result = [...menuItems]

    if (selectedBranchId) {
      result = result.filter(s => 
        s.branchId === selectedBranchId || 
        (s.branchId as any)?._id === selectedBranchId
      )
    }
    
    if (searchQuery) {
      result = result.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    if (selectedCategory !== "All") {
      result = result.filter(s => s.category === selectedCategory)
    }
    
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    }
    
    return result
  }, [menuItems, searchQuery, selectedCategory, sortBy, selectedBranchId])

  // Pagination
  const totalPages = Math.ceil(processedMenuItems.length / rowsPerPage) || 1
  const paginatedMenuItems = processedMenuItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleEdit = (item: MenuItem) => {
    setEditingId(item._id)
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      price: item.price,
      image: item.image || "",
      branchId: (item.branchId as any)?._id || item.branchId || "",
      isAvailable: item.isAvailable,
    })
    setImagePreview(item.image || "")
    setImageFile(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirmDelete", "Are you sure?"))) return
    try {
      await api.delete(`/restaurant/menu/${id}`)
      fetchMenuItems()
    } catch (error) {
      console.error("Failed to delete service", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      // Convert image file to base64 string if a new file was chosen
      let imageData = formData.image
      if (imageFile) {
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (ev) => resolve(ev.target?.result as string)
          reader.readAsDataURL(imageFile)
        })
      }

      const payload: any = { ...formData, price: Number(formData.price) || 0, image: imageData, partnerId: partnerId || undefined }
      if (!payload.branchId) {
        delete payload.branchId
      }
      
      if (editingId) {
        await api.put(`/restaurant/menu/${editingId}`, payload)
      } else {
        await api.post('/restaurant/menu', payload)
      }
      
      setIsModalOpen(false)
      setFormData(defaultForm)
      setImagePreview("")
      setImageFile(null)
      setEditingId(null)
      fetchMenuItems()
    } catch (error) {
      console.error("Failed to save service", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/restaurant/menu" />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t("nav.menu", "Menu")}</h1>
                <p className="text-muted-foreground mt-1">Manage your restaurant menu items</p>
              </div>
              <button 
                onClick={() => {
                  setEditingId(null)
                  setFormData(defaultForm)
                  setIsModalOpen(true)
                }}
                className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("menuPage.addNewItem", "Add Menu Item")}
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-2 rounded-xl shadow-sm border border-border/40">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder={t("menuPage.searchItems", "Search menu items...")} 
                  className="w-full h-10 pl-9 pr-4 bg-[#FAFAFA] border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C69C9B]/50"
                />
              </div>
              
              <div className="relative group">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="appearance-none h-10 px-4 pr-8 border border-border/60 rounded-lg text-sm font-medium hover:bg-[#FAFAFA] bg-transparent outline-none cursor-pointer"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat === "All" ? t("menuPage.allCategories", "All Categories") : cat}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>

              <div className="sm:ml-auto flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t("servicesPage.sortBy")}</span>
                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-2 pr-6 font-semibold bg-transparent outline-none cursor-pointer"
                  >
                    <option value="last-modified">{t("menuPage.lastModified", "Last Modified")}</option>
                    <option value="price-asc">{t("menuPage.priceLowHigh", "Price: Low to High")}</option>
                    <option value="price-desc">{t("menuPage.priceHighLow", "Price: High to Low")}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-foreground absolute right-0 top-1 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{t("menuPage.itemName", "Item Name")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{t("menuPage.description", "Description")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{t("menuPage.price", "Price")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase text-right">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t("menuPage.loadingItems", "Loading menu items...")}</td>
                      </tr>
                    ) : paginatedMenuItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t("menuPage.noItemsFound", "No menu items found.")}</td>
                      </tr>
                    ) : (
                      paginatedMenuItems.map((item) => (
                        <tr key={item._id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-lg bg-[#FAFAFA] border border-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t("menuPage.category", "Category")}: {item.category || t("menuPage.uncategorized", "Uncategorized")}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground"><span className="line-clamp-2">{item.description}</span></td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">{formatPrice(item.price, partner?.currency)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(item)} className="p-2 text-muted-foreground hover:text-[#C69C9B] transition-colors rounded-lg hover:bg-[#FDF6F6]">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(item._id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {!isLoading && processedMenuItems.length > 0 && (
                <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-[#FAFAFA]/50">
                  <span className="text-sm text-muted-foreground">
                    {t("common.showing", "Showing")} {(currentPage - 1) * rowsPerPage + 1} {t("common.to", "-")} {Math.min(currentPage * rowsPerPage, processedMenuItems.length)} {t("common.of", "of")} {processedMenuItems.length} {t("common.results", "results")}
                  </span>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded border border-border bg-white text-muted-foreground hover:bg-[#FAFAFA] disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        const isActive = page === currentPage;
                        return (
                          <button 
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                              isActive ? "bg-[#FDF6F6] text-[#E5555E] font-bold" : "hover:bg-[#FAFAFA] text-muted-foreground"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}

                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded border border-border bg-white text-muted-foreground hover:bg-[#FAFAFA] disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>



          </div>
        </main>
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{editingId ? t("menuPage.editItem", "Edit Menu Item") : t("menuPage.addItem", "Add Menu Item")}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("menuPage.itemName", "Item Name")}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" placeholder="e.g. Classic Burger" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("menuPage.description", "Description")}</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B] min-h-[80px]" placeholder="e.g. Beef patty with cheese, lettuce, and tomato" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("menuPage.category", "Category")}</label>
                    <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" placeholder="e.g. Mains" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("menuPage.price", "Price")} ({partner?.currency || 'USD'})</label>
                    <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === "" ? "" : Number(e.target.value)})} placeholder="0.00" className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" />
                  </div>
                </div>

                {/* Branch Assignment */}
                {branches.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("menuPage.assignBranch", "Assign Branch (Optional)")}</label>
                    <select 
                      value={formData.branchId} 
                      onChange={e => setFormData({...formData, branchId: e.target.value})}
                      className="w-full h-10 px-4 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
                    >
                      <option value="">Global (All Branches)</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.address.city} - {b.address.line1}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("menuPage.itemImage", "Item Image")}</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/60 hover:border-[#C69C9B] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAFAFA] hover:bg-[#FDF6F6] gap-2"
                  >
                    {imagePreview ? (
                      <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border/40">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#C69C9B]/60" />
                        <p className="text-sm font-medium text-muted-foreground">{t("menuPage.clickToUpload", "Click to upload")}</p>
                        <p className="text-xs text-muted-foreground">{t("menuPage.fileFormats", "PNG, JPG up to 5MB")}</p>
                      </>
                    )}
                    {imagePreview && (
                      <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(""); setImageFile(null); }} className="text-xs text-red-500 hover:underline mt-1">
                        {t("menuPage.removeImage", "Remove Image")}
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-border bg-[#FAFAFA]/50 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                {t("common.cancel")}
              </button>
              <button type="submit" form="service-form" disabled={isSubmitting} className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                {isSubmitting ? t("common.saving") : (editingId ? t("menuPage.updateItem", "Update Item") : t("menuPage.saveItem", "Save Item"))}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
