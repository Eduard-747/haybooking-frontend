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

interface Service {
  _id: string
  name: string
  category: string
  duration: number
  price: number
  assignedBranches: string[]
  image?: string
}

export default function ManageServicesPage() {
  const { partnerId, partner } = usePartner()
  const { selectedBranchId } = useBranchContext()
  const [services, setServices] = useState<Service[]>([])
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
  const defaultForm = { name: "", category: "", duration: 60 as string | number, price: "" as string | number, image: "", scheduleInterval: 60, assignedBranches: [] as string[] }
  const [formData, setFormData] = useState(defaultForm)

  // Branches for assignment
  const [branches, setBranches] = useState<{ _id: string; address: { city: string; line1: string } }[]>([])

  // Fetch services scoped to partner
  const fetchServices = async () => {
    if (!partnerId) return
    try {
      setIsLoading(true)
      const response = await api.get(`/services?partnerId=${partnerId}`)
      setServices(response.data)
    } catch (error) {
      console.error("Failed to fetch services", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      fetchServices()
      // Fetch branches for the selector
      api.get(`/branches?partnerId=${partnerId}`)
        .then(res => setBranches(res.data || []))
        .catch(() => {})
    }
  }, [partnerId])

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category).filter(Boolean))
    return ["All", ...Array.from(cats)]
  }, [services])

  // Filtered & Sorted Services
  const processedServices = useMemo(() => {
    let result = [...services]

    if (selectedBranchId) {
      result = result.filter(s => 
        s.assignedBranches?.includes(selectedBranchId) || 
        s.assignedBranches?.some((b: any) => b._id === selectedBranchId)
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
  }, [services, searchQuery, selectedCategory, sortBy, selectedBranchId])

  // Pagination
  const totalPages = Math.ceil(processedServices.length / rowsPerPage) || 1
  const paginatedServices = processedServices.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleEdit = (service: Service) => {
    setEditingId(service._id)
    setFormData({
      name: service.name,
      category: service.category || "",
      duration: service.duration,
      price: service.price,
      image: service.image || "",
      scheduleInterval: 60,
      assignedBranches: (service.assignedBranches || []).map((b: any) => b._id || b),
    })
    setImagePreview(service.image || "")
    setImageFile(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    try {
      await api.delete(`/services/${id}`)
      fetchServices()
    } catch (error) {
      console.error("Failed to delete service", error)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enforce at least 1 branch assignment when branches exist
    if (branches.length > 0 && formData.assignedBranches.length === 0) {
      toast.error("Please select at least 1 branch for this service")
      return
    }

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

      const payload = { ...formData, price: Number(formData.price) || 0, duration: Number(formData.duration) || 5, image: imageData, partnerId: partnerId || undefined }
      
      if (editingId) {
        await api.put(`/services/${editingId}`, payload)
      } else {
        await api.post('/services', payload)
      }
      
      setIsModalOpen(false)
      setFormData(defaultForm)
      setImagePreview("")
      setImageFile(null)
      setEditingId(null)
      fetchServices()
    } catch (error) {
      console.error("Failed to save service", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/services" />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Manage Services</h1>
                <p className="text-muted-foreground mt-1">Define and organize your service catalog across all business locations.</p>
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
                Add New Service
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
                  placeholder="Search services..." 
                  className="w-full h-10 pl-9 pr-4 bg-[#FAFAFA] border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C69C9B]/50"
                />
              </div>
              
              <div className="relative group">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="appearance-none h-10 px-4 pr-8 border border-border/60 rounded-lg text-sm font-medium hover:bg-[#FAFAFA] bg-transparent outline-none cursor-pointer"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>

              <div className="sm:ml-auto flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-2 pr-6 font-semibold bg-transparent outline-none cursor-pointer"
                  >
                    <option value="last-modified">Last Modified</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
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
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Service Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Duration</th>
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Price</th>
                      <th className="px-6 py-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading services...</td>
                      </tr>
                    ) : paginatedServices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No services found.</td>
                      </tr>
                    ) : (
                      paginatedServices.map((service) => (
                        <tr key={service._id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-lg bg-[#FAFAFA] border border-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                                {service.image ? (
                                  <Image src={service.image} alt={service.name} fill className="object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">{service.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Category: {service.category || 'Uncategorized'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{service.duration} min</td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">{formatPrice(service.price, partner?.currency)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(service)} className="p-2 text-muted-foreground hover:text-[#C69C9B] transition-colors rounded-lg hover:bg-[#FDF6F6]">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(service._id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
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
              {!isLoading && processedServices.length > 0 && (
                <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-[#FAFAFA]/50">
                  <span className="text-sm text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, processedServices.length)}</span> of <span className="font-bold text-foreground">{processedServices.length}</span> results
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

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#FAFAFA] p-6 rounded-xl border border-border/60">
                <h3 className="font-bold text-sm mb-2 text-foreground">Global Pricing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Easily adjust prices across all branches simultaneously from the bulk action menu.</p>
              </div>
              <div className="bg-[#FAFAFA] p-6 rounded-xl border border-border/60">
                <h3 className="font-bold text-sm mb-2 text-foreground">Duration Buffer</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Service durations include a mandatory 5-minute setup buffer by default.</p>
              </div>
              <div className="bg-[#FAFAFA] p-6 rounded-xl border border-border/60">
                <h3 className="font-bold text-sm mb-2 text-foreground">Online Booking</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Toggle visibility of specific services on your public booking page.</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" placeholder="e.g. Deep Tissue Massage" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" placeholder="e.g. Premium Grooming" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration (min)</label>
                    <input required type="number" min="5" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value === "" ? "" : Number(e.target.value)})} className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price ({partner?.currency || 'USD'})</label>
                    <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === "" ? "" : Number(e.target.value)})} placeholder="0.00" className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" />
                  </div>
                </div>

                {/* Branch Assignment */}
                {branches.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assign to Branches *</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-border/60 rounded-lg p-3 bg-[#FAFAFA]">
                      {branches.map(b => (
                        <label key={b._id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedBranches.includes(b._id)}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                assignedBranches: prev.assignedBranches.includes(b._id)
                                  ? prev.assignedBranches.filter(id => id !== b._id)
                                  : [...prev.assignedBranches, b._id]
                              }))
                            }}
                            className="rounded border-border text-[#E5555E] focus:ring-[#E5555E]"
                          />
                          <MapPin className="h-3.5 w-3.5 text-[#C69C9B]" />
                          <span className="text-sm">{b.address.city} - {b.address.line1}</span>
                        </label>
                      ))}
                    </div>
                    {formData.assignedBranches.length === 0 && (
                      <p className="text-xs text-amber-600">Please select at least 1 branch</p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Image</label>
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
                        <p className="text-sm font-medium text-muted-foreground">Click to upload image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                    {imagePreview && (
                      <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(""); setImageFile(null); }} className="text-xs text-red-500 hover:underline mt-1">
                        Remove image
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-border bg-[#FAFAFA]/50 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button type="submit" form="service-form" disabled={isSubmitting} className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : (editingId ? "Update Service" : "Save Service")}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
