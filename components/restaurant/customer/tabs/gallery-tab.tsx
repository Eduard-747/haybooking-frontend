"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Image as ImageIcon, Eye, X } from "lucide-react"

export function GalleryTab({ branches, selectedBranch }: { branches: any[], selectedBranch: string | null }) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const currentBranch = branches.find((b: any) => b._id === selectedBranch) || branches[0]
  const rawGallery: any[] = currentBranch?.gallery || []

  // Extract photos (handle string URLs or object { url, category, caption })
  const photos = rawGallery.map(item => {
    if (typeof item === 'string') return { url: item, category: 'all' }
    return {
      url: item.url || item.image || '',
      category: item.category || 'all',
      caption: item.caption || ''
    }
  }).filter(p => p.url)

  const categories = ["all", ...Array.from(new Set(photos.map(p => p.category).filter(c => c && c !== 'all')))]
  const filteredPhotos = activeCategory === "all" ? photos : photos.filter(p => p.category === activeCategory)

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-border/60 max-w-4xl mx-auto">
        <ImageIcon className="h-12 w-12 mb-4 opacity-50 text-[#FF4444]" />
        <h3 className="text-lg font-bold text-foreground">{t("restaurant.gallery_empty", "No Gallery Photos")}</h3>
        <p className="text-sm">{t("restaurant.gallery_empty_desc", "This restaurant location hasn't uploaded any photos to their gallery yet.")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors capitalize ${
                activeCategory === cat
                  ? 'bg-[#FF4444] text-white shadow-sm'
                  : 'bg-white border border-border/60 text-muted-foreground hover:bg-gray-50'
              }`}
            >
              {cat === "all" ? t("common.all", "All") : String(t(`restaurant.gallery.${cat}`, cat as string))}
            </button>
          ))}
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setLightboxImage(photo.url)}
            className="group relative aspect-square bg-gray-100 rounded-2xl border border-border/60 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <img
              src={photo.url}
              alt={photo.caption || `Gallery photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Eye className="w-6 h-6 drop-shadow-md" />
            </div>
            {photo.category && photo.category !== 'all' && (
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider capitalize">
                {photo.category}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-black/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={lightboxImage} alt="Gallery view" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  )
}
