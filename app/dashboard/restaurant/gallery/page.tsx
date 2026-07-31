"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Plus, Image as ImageIcon, X, Trash2, Upload, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import Image from "next/image"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { useTranslation } from "react-i18next"

interface GalleryImage {
  url: string
  category: string
}

export default function RestaurantGalleryPage() {
  const { partnerId } = usePartner()
  const { selectedBranchId, branches } = useBranchContext()
  const { t } = useTranslation()
  
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Interior")

  // Which branch are we editing?
  const activeBranchId = selectedBranchId
  const activeBranch = branches.find(b => b._id === activeBranchId)

  const fetchBranch = async () => {
    if (!activeBranchId) return
    try {
      setIsLoading(true)
      const res = await api.get(`/branches/${activeBranchId}`)
      setGallery(res.data.gallery || [])
    } catch (error) {
      console.error("Failed to fetch branch gallery", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeBranchId) {
      fetchBranch()
    } else {
      setGallery([])
    }
  }, [activeBranchId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDelete = async (index: number) => {
    if (!confirm(t("common.confirmDelete", "Are you sure?"))) return
    const newGallery = gallery.filter((_, i) => i !== index)
    await saveGallery(newGallery)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      toast.error(t("galleryPage.noImageSelected", "Please select an image first."))
      return
    }

    setIsSaving(true)
    try {
      const base64Str = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.readAsDataURL(imageFile)
      })

      const newImage: GalleryImage = {
        url: base64Str,
        category: selectedCategory.toLowerCase()
      }

      const newGallery = [...gallery, newImage]
      await saveGallery(newGallery)
      
      setIsModalOpen(false)
      setImagePreview("")
      setImageFile(null)
    } catch (error) {
      console.error("Failed to upload image", error)
      toast.error("Failed to upload image")
    } finally {
      setIsSaving(false)
    }
  }

  const saveGallery = async (newGallery: GalleryImage[]) => {
    if (!activeBranchId) return
    try {
      await api.put(`/branches/${activeBranchId}`, { gallery: newGallery })
      setGallery(newGallery)
      toast.success(t("common.saved", "Saved successfully"))
    } catch (err) {
      console.error("Failed to update branch gallery", err)
      toast.error("Failed to update gallery")
      throw err
    }
  }

  // Filter state
  const [filter, setFilter] = useState("all")
  const filteredGallery = filter === "all" ? gallery : gallery.filter(img => img.category === filter)

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/restaurant/gallery" />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t("restaurant.gallery.title", "Gallery")}</h1>
                <p className="text-muted-foreground mt-1">
                  {activeBranch 
                    ? t("restaurant.gallery.subtitleFor", { branch: `${activeBranch.address.city} - ${activeBranch.address.line1}`, defaultValue: `Manage your restaurant photos for ${activeBranch.address.city} - ${activeBranch.address.line1}` })
                    : t("restaurant.gallery.subtitle", "Manage your restaurant photos")
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                {branches.length > 0 && !selectedBranchId && (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-sm border border-amber-200 shadow-sm">
                    <MapPin className="w-4 h-4" /> {t("restaurant.gallery.selectBranchNotice", "Select a branch to upload photos")}
                  </div>
                )}
                {selectedBranchId && (
                  <button 
                    onClick={() => {
                      if (!activeBranchId) {
                        toast.error(t("restaurant.gallery.createBranchFirst", "Please create a branch first."))
                        return
                      }
                      setIsModalOpen(true)
                    }}
                    className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t("restaurant.gallery.addPhoto", "Add Photo")}
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'interior', 'exterior', 'food', 'events'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    filter === cat 
                      ? "bg-[#FDF6F6] text-[#E5555E] border-2 border-[#E5555E]" 
                      : "bg-white text-muted-foreground border-2 border-transparent hover:bg-gray-100 shadow-sm"
                  }`}
                >
                  {t(`restaurant.gallery.${cat}`, cat)}
                </button>
              ))}
            </div>

            {/* Grid */}
            {!selectedBranchId ? (
              <div className="bg-white rounded-xl border border-border/40 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-[#FDF6F6] rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-[#C69C9B]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("restaurant.floorPlan.selectBranchTitle", "Select a Branch")}</h2>
                <p className="text-muted-foreground max-w-md">{t("restaurant.gallery.selectBranchSubtitle", "Please select a specific branch from the top menu to view and manage its gallery.")}</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#C69C9B]" />
              </div>
            ) : filteredGallery.length === 0 ? (
              <div className="bg-white rounded-xl border border-border/60 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No photos found</h3>
                <p className="text-muted-foreground mt-1">Upload some photos to showcase your restaurant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGallery.map((img, idx) => (
                  <div key={idx} className="group relative aspect-square bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <Image src={img.url} alt={`Gallery image ${idx}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-between items-start">
                        <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider capitalize">
                          {img.category}
                        </span>
                        <button onClick={() => handleDelete(gallery.findIndex(g => g.url === img.url))} className="bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("restaurant.gallery.addPhoto", "Add Photo")}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form id="upload-form" onSubmit={handleUploadSubmit} className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("restaurant.gallery.category", "CATEGORY")}</label>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-4 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
                  >
                    <option value="Interior">{t("restaurant.gallery.interior", "Interior")}</option>
                    <option value="Exterior">{t("restaurant.gallery.exterior", "Exterior")}</option>
                    <option value="Food">{t("restaurant.gallery.food", "Food")}</option>
                    <option value="Events">{t("restaurant.gallery.events", "Events")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("restaurant.gallery.photo", "PHOTO")}</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/60 hover:border-[#C69C9B] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAFAFA] hover:bg-[#FDF6F6] gap-2 min-h-[160px]"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border/40">
                        <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#C69C9B]/60" />
                        <p className="text-sm font-medium text-muted-foreground">{t("restaurant.gallery.clickToUpload", "Click to upload")}</p>
                        <p className="text-xs text-muted-foreground">{t("restaurant.gallery.fileLimitNote", "PNG, JPG up to 5MB")}</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-border bg-[#FAFAFA]/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                {t("restaurant.reservations.cancel", "Cancel")}
              </button>
              <button type="submit" form="upload-form" disabled={isSaving || !imageFile} className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                {isSaving ? t("restaurant.gallery.uploading", "Uploading...") : t("restaurant.gallery.upload", "Upload")}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
