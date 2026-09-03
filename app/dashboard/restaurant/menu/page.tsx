"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { 
  Search, 
  ChevronDown, 
  Image as ImageIcon, 
  Upload, 
  FileText, 
  File, 
  FileSpreadsheet, 
  Presentation, 
  Target, 
  Download,
  Eye,
  RefreshCw,
  Trash2,
  FileBox,
  CloudUpload,
  Loader2
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { usePartner } from "@/hooks/usePartner"
import { matchMultilingualQuery } from "@/lib/search-transliteration"
import { useBranchContext } from "@/components/dashboard/branch-context"
import api from "@/lib/api"
import { toast } from "sonner"

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
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', badge: 'bg-red-50 text-red-600 border-red-100', iconBg: 'bg-red-500' },
  image: { icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', iconBg: 'bg-emerald-500' },
  document: { icon: File, color: 'text-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-50 text-blue-600 border-blue-100', iconBg: 'bg-blue-500' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-50 text-green-600 border-green-100', iconBg: 'bg-green-600' },
  presentation: { icon: Presentation, color: 'text-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-50 text-amber-600 border-amber-100', iconBg: 'bg-amber-500' },
  structured: { icon: Target, color: 'text-purple-500', bg: 'bg-purple-50', badge: 'bg-purple-50 text-purple-600 border-purple-100', iconBg: 'bg-purple-500' },
}

const uploadOptions = [
  { id: 'pdf', titleKey: 'restaurant.menu.pdfMenu', defaultTitle: 'PDF Menu', descKey: 'restaurant.menu.pdfDesc', defaultDesc: 'Upload PDF menu file', format: 'pdf', accept: '.pdf' },
  { id: 'image', titleKey: 'restaurant.menu.imageMenu', defaultTitle: 'Image Menu', descKey: 'restaurant.menu.imageDesc', defaultDesc: 'Upload image files (JPG, PNG)', format: 'image', accept: 'image/jpeg, image/png, image/webp' },
  { id: 'document', titleKey: 'restaurant.menu.docMenu', defaultTitle: 'Document Menu', descKey: 'restaurant.menu.docDesc', defaultDesc: 'Upload document files (DOC, DOCX)', format: 'document', accept: '.doc,.docx,.txt,.rtf' },
  { id: 'spreadsheet', titleKey: 'restaurant.menu.sheetMenu', defaultTitle: 'Spreadsheet Menu', descKey: 'restaurant.menu.sheetDesc', defaultDesc: 'Upload Excel or CSV files', format: 'spreadsheet', accept: '.xls,.xlsx,.csv' },
  { id: 'presentation', titleKey: 'restaurant.menu.pptMenu', defaultTitle: 'Presentation Menu', descKey: 'restaurant.menu.pptDesc', defaultDesc: 'Upload PPT or PPTX files', format: 'presentation', accept: '.ppt,.pptx' },
]

function formatDate(iso: string, language: string = 'en') {
  const localeStr = language === 'am' ? 'hy-AM' : language === 'ru' ? 'ru-RU' : 'en-US'
  return new Date(iso).toLocaleDateString(localeStr, { month: "short", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit' })
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function determineFormatAndType(file: File): { format: string, type: string } {
  const t = file.type
  const n = file.name.toLowerCase()
  
  if (t === 'application/pdf' || n.endsWith('.pdf')) return { format: 'pdf', type: 'PDF' }
  if (t.startsWith('image/')) return { format: 'image', type: 'Image' }
  if (t.includes('spreadsheet') || t.includes('excel') || t === 'text/csv' || n.endsWith('.csv') || n.endsWith('.xlsx')) return { format: 'spreadsheet', type: 'Spreadsheet' }
  if (t.includes('presentation') || t.includes('powerpoint') || n.endsWith('.pptx')) return { format: 'presentation', type: 'Presentation' }
  
  // Default fallback for word docs, txt, rtf etc
  return { format: 'document', type: 'Document' }
}

export default function ManageMenuPage() {
  const { t, i18n } = useTranslation()
  const { partnerId } = usePartner()
  const { selectedBranchId } = useBranchContext()
  const [menus, setMenus] = useState<MenuFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [acceptFilter, setAcceptFilter] = useState<string | undefined>(undefined)
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [sortBy, setSortBy] = useState("last-modified")

  const [isDragging, setIsDragging] = useState(false)

  const fetchMenuFiles = async () => {
    if (!partnerId || !selectedBranchId) return
    try {
      setIsLoading(true)
      const res = await api.get(`/restaurant/menu-file?partnerId=${partnerId}&branchId=${selectedBranchId}`)
      setMenus(res.data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load menus")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId && selectedBranchId) {
      fetchMenuFiles()
    } else {
      setMenus([])
      setIsLoading(false)
    }
  }, [partnerId, selectedBranchId])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const uploadFile = async (file: File) => {
    if (!partnerId || !selectedBranchId) {
      toast.error("Please select a branch first")
      return
    }
    
    // Check size limit (e.g., 9MB for base64 limits)
    if (file.size > 9 * 1024 * 1024) {
      toast.error(`File ${file.name} is too large. Max size is 9MB.`)
      return
    }

    try {
      setIsUploading(true)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
      })

      const { format, type } = determineFormatAndType(file)

      await api.post('/restaurant/menu-file', {
        partnerId,
        branchId: selectedBranchId,
        name: file.name,
        type,
        format,
        size: formatBytes(file.size),
        fileData: base64Data
      })
      
      toast.success(`${file.name} uploaded successfully`)
      fetchMenuFiles()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      await uploadFile(file)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      await uploadFile(file)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const triggerUpload = (accept?: string) => {
    setAcceptFilter(accept)
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }

  const menuTypes = useMemo(() => {
    const types = new Set(menus.map(m => m.type))
    return ["All", ...Array.from(types)]
  }, [menus])

  const filteredMenus = useMemo(() => {
    let result = [...menus]
    
    if (searchQuery) {
      result = result.filter(m => 
        matchMultilingualQuery(m.name, searchQuery) ||
        matchMultilingualQuery(m.description || "", searchQuery) ||
        matchMultilingualQuery(m.type || "", searchQuery)
      )
    }
    if (selectedType !== "All") {
      result = result.filter(m => m.type === selectedType)
    }
    
    // Sort logic
    if (sortBy === "last-modified") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "size-desc") {
      result.sort((a, b) => parseFloat(b.size) - parseFloat(a.size))
    }
    
    return result
  }, [menus, searchQuery, selectedType, sortBy])

  const handleDelete = async (id: string) => {
    if(!confirm(t("restaurant.menu.confirmDelete", "Are you sure you want to delete this menu?"))) return
    try {
      await api.delete(`/restaurant/menu-file/${id}`)
      setMenus(menus.filter(m => m._id !== id))
      toast.success("Menu deleted")
    } catch(err) {
      toast.error("Failed to delete menu")
    }
  }

  const handleView = async (menu: MenuFile) => {
    if (!menu.fileData) return
    try {
      // Create an object URL from the base64 data to bypass browser data URL navigation blocks
      const res = await fetch(menu.fileData)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      toast.error("Failed to open file")
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/restaurant/menu" />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        <DashboardHeader />

        {isUploading && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center">
             <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
               <Loader2 className="w-10 h-10 text-[#FF4444] animate-spin" />
               <p className="font-bold text-foreground">{t("restaurant.menu.uploadingFile", "Uploading file...")}</p>
             </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          className="hidden" 
          accept={acceptFilter}
        />

        <main className="flex-1 p-6 lg:p-8" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {isDragging && (
            <div className="absolute inset-0 z-40 bg-[#FF4444]/10 backdrop-blur-[2px] border-4 border-dashed border-[#FF4444] rounded-2xl m-6 lg:m-8 flex flex-col items-center justify-center">
              <CloudUpload className="w-20 h-20 text-[#FF4444] animate-bounce mb-4" />
              <h2 className="text-3xl font-bold text-[#FF4444]">{t("restaurant.menu.dropFiles", "Drop files to upload your menu")}</h2>
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-8 relative z-10">
            
            {!selectedBranchId ? (
              <div className="bg-white p-12 rounded-2xl border border-border/40 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-6">
                  <FileBox className="w-10 h-10 text-[#FF4444]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("restaurant.floorPlan.selectBranchTitle", "Select a Branch")}</h2>
                <p className="text-muted-foreground max-w-md">{t("restaurant.menu.selectBranchSubtitle", "Please select a specific branch from the top menu to view and upload its menus.")}</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-border/40 shadow-sm">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t("restaurant.menu.title", "Menu Management")}</h1>
                <p className="text-muted-foreground mt-1.5 text-sm">{t("restaurant.menu.subtitle", "Manage your menus in any format")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => triggerUpload()} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4444] text-white text-sm font-semibold hover:bg-[#BCAAA4] transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  {t("restaurant.menu.uploadMenu", "Upload Menu")}
                </button>
              </div>
            </div>

            {/* Upload Options Grid */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground px-1">{t("restaurant.menu.chooseHow", "Choose how you want to add your menu")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {uploadOptions.map((opt) => {
                  const config = formatConfig[opt.format as keyof typeof formatConfig]
                  const Icon = config.icon
                  return (
                    <button 
                      key={opt.id}
                      onClick={() => triggerUpload(opt.accept)}
                      className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-border/40 shadow-sm hover:shadow-md hover:border-[#FF4444]/50 transition-all group text-center"
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${config.bg}`}>
                        <Icon className={`w-7 h-7 ${config.color}`} />
                      </div>
                      <h3 className="font-bold text-sm text-foreground mb-1">{t(opt.titleKey, opt.defaultTitle)}</h3>
                      <p className="text-xs text-muted-foreground">{t(opt.descKey, opt.defaultDesc)}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden flex flex-col">
              
              {/* Filters Toolbar */}
              <div className="p-4 sm:p-5 border-b border-border/40 bg-[#FAFAFA]/50 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("restaurant.menu.searchMenus", "Search menus...")} 
                    className="w-full h-10 pl-9 pr-4 bg-white border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4444]/20 focus:border-[#FF4444]/50 shadow-sm"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <select 
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="appearance-none h-10 px-4 pr-8 bg-white border border-border/60 rounded-xl text-sm font-medium hover:bg-muted/50 outline-none cursor-pointer shadow-sm"
                    >
                      {menuTypes.map(cat => <option key={cat} value={cat}>{cat === "All" ? t("restaurant.menu.allTypes", "All Menu Types") : cat}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none h-10 px-4 pr-8 bg-white border border-border/60 rounded-xl text-sm font-medium hover:bg-muted/50 outline-none cursor-pointer shadow-sm"
                    >
                      <option value="last-modified">{t("restaurant.menu.lastModified", "Last Modified")}</option>
                      <option value="name-asc">{t("restaurant.menu.nameAsc", "Name (A-Z)")}</option>
                      <option value="size-desc">{t("restaurant.menu.sizeDesc", "Size (Large-Small)")}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Menus List */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-[#FF4444] animate-spin mb-4" />
                    <p className="text-muted-foreground">{t("common.loading", "Loading...")}</p>
                  </div>
                ) : filteredMenus.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                      <FileBox className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{t("restaurant.menu.noMenusFound", "No menus found")}</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">{t("restaurant.menu.noMenusDesc", "You haven't uploaded any menus yet or no menus match your search criteria.")}</p>
                    <button 
                      onClick={() => triggerUpload()}
                      className="bg-[#FF4444] hover:bg-[#BCAAA4] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {t("restaurant.menu.uploadFirst", "Upload your first menu")}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {filteredMenus.map((menu) => {
                      const config = formatConfig[menu.format as keyof typeof formatConfig] || formatConfig.document
                      const Icon = config.icon
                      return (
                        <div key={menu._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-[#FAFAFA] transition-colors gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border/20 ${config.bg}`}>
                              <Icon className={`w-6 h-6 ${config.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <button onClick={() => handleView(menu)} className="font-bold text-foreground hover:text-[#FF4444] transition-colors text-left text-base">{menu.name}</button>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.badge}`}>
                                  {t(`restaurant.menu.type.${menu.type.toLowerCase()}`, menu.type)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <span>{t("restaurant.menu.uploadedOn", "Uploaded on")} {formatDate(menu.createdAt || new Date().toISOString(), i18n.language)}</span>
                                <span className="w-1 h-1 rounded-full bg-border/80"></span>
                                <span>{menu.size}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto pl-16 sm:pl-0">
                            {menu.fileData && (
                              <>
                                <button onClick={() => handleView(menu)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-semibold text-foreground hover:bg-muted/50 bg-white shadow-sm transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> {t("common.view", "View")}
                                </button>
                                <a href={menu.fileData} download={menu.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-semibold text-foreground hover:bg-muted/50 bg-white shadow-sm transition-colors">
                                  <Download className="w-3.5 h-3.5" /> {t("common.download", "Download")}
                                </a>
                              </>
                            )}
                            <button onClick={() => handleDelete(menu._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 bg-white shadow-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> {t("common.delete", "Delete")}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
            </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
