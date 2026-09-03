"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import api from "@/lib/api"
import { 
  UtensilsCrossed, 
  Loader2, 
  FileText, 
  Image as ImageIcon, 
  File, 
  FileSpreadsheet, 
  Presentation, 
  Eye, 
  Download,
  X
} from "lucide-react"

interface MenuFile {
  _id: string
  name: string
  type: string
  format: 'pdf' | 'image' | 'document' | 'spreadsheet' | 'presentation' | 'structured'
  size: string
  fileData?: string
  description?: string
  createdAt: string
}

const formatConfig = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', badge: 'bg-red-50 text-red-600 border-red-100' },
  image: { icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  document: { icon: File, color: 'text-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-50 text-green-600 border-green-100' },
  presentation: { icon: Presentation, color: 'text-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
  structured: { icon: UtensilsCrossed, color: 'text-purple-500', bg: 'bg-purple-50', badge: 'bg-purple-50 text-purple-600 border-purple-100' },
}

export function MenuTab({ partnerId, branchId }: { partnerId: string, branchId: string | null }) {
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [menuFiles, setMenuFiles] = useState<MenuFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true)
      try {
        const query = branchId ? `?branchId=${branchId}&partnerId=${partnerId}` : `?partnerId=${partnerId}`
        
        const [itemsRes, filesRes] = await Promise.allSettled([
          api.get(`/restaurant/menu${query}`),
          api.get(`/restaurant/menu-file${query}`)
        ])

        if (itemsRes.status === "fulfilled") {
          setMenuItems(itemsRes.value.data || [])
        }
        if (filesRes.status === "fulfilled") {
          setMenuFiles(filesRes.value.data || [])
        }
      } catch (err) {
        console.error("Failed to fetch menu data", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (partnerId) {
      fetchMenuData()
    }
  }, [partnerId, branchId])

  const handleViewFile = async (file: MenuFile) => {
    if (!file.fileData) return
    try {
      const res = await fetch(file.fileData)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error("Failed to open file", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4444]" />
      </div>
    )
  }

  const hasFiles = menuFiles.length > 0
  const hasItems = menuItems.length > 0

  if (!hasFiles && !hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-border/60">
        <UtensilsCrossed className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-foreground">{t("restaurant.menu_coming_soon", "Menu Coming Soon")}</h3>
        <p className="text-sm">{t("restaurant.no_menu_desc", "This restaurant hasn't uploaded their digital menu yet.")}</p>
      </div>
    )
  }

  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))]
  const filteredItems = activeCategory === "All" ? menuItems : menuItems.filter(i => i.category === activeCategory)

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Uploaded Menu Files Section */}
      {hasFiles && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF4444]" />
              {t("restaurant.digital_menu_files", "Digital Menu Files")}
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              {menuFiles.length} {menuFiles.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuFiles.map((file) => {
              const config = formatConfig[file.format as keyof typeof formatConfig] || formatConfig.document
              const Icon = config.icon
              const isImage = file.format === 'image' || (file.fileData && file.fileData.startsWith('data:image/'))

              return (
                <div key={file._id} className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group p-5">
                  <div>
                    {/* Image Preview if format is image */}
                    {isImage && file.fileData && (
                      <div 
                        onClick={() => setPreviewImage(file.fileData || null)}
                        className="h-44 -mx-5 -mt-5 mb-4 bg-gray-100 relative overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
                      >
                        <img src={file.fileData} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-6 h-6 drop-shadow-md" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border/20 ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground text-sm truncate group-hover:text-[#FF4444] transition-colors" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config.badge}`}>
                            {t(`restaurant.menu.type.${file.type.toLowerCase()}`, file.type)}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">{file.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40">
                    {file.fileData && (
                      <>
                        <button
                          onClick={() => isImage ? setPreviewImage(file.fileData || null) : handleViewFile(file)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border/60 bg-white text-xs font-semibold text-foreground hover:bg-[#FEF2F2] hover:text-[#FF4444] hover:border-[#FF4444]/30 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t("common.view", "View")}
                        </button>
                        <a
                          href={file.fileData}
                          download={file.name}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border/60 bg-white text-xs font-semibold text-foreground hover:bg-[#FEF2F2] hover:text-[#FF4444] hover:border-[#FF4444]/30 transition-colors shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t("common.download", "Download")}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)} 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-black/40 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={previewImage} alt="Menu Preview" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}

      {/* Structured Menu Items Section */}
      {hasItems && (
        <div className="space-y-6">
          {hasFiles && (
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 pt-4 border-t border-border/40">
              <UtensilsCrossed className="w-5 h-5 text-[#FF4444]" />
              {t("restaurant.digital_dishes", "Menu Dishes")}
            </h2>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-[#FF4444] text-white shadow-sm' 
                    : 'bg-white border border-border/60 text-muted-foreground hover:bg-gray-50'
                }`}
              >
                {cat === "All" ? t("common.all", "All") : cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item._id} className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <UtensilsCrossed className="h-12 w-12" />
                    </div>
                  )}
                  {item.isAvailable === false && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t("restaurant.sold_out", "Sold Out")}</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-foreground font-bold px-3 py-1 rounded-full shadow-sm text-sm">
                    {item.price.toLocaleString()} {t("common.amd", "AMD")}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-bold text-[#FF4444] uppercase tracking-wider mb-1">{item.category}</span>
                  <h3 className="font-bold text-foreground text-lg mb-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
