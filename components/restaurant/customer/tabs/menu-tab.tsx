"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import api from "@/lib/api"
import { UtensilsCrossed, Loader2 } from "lucide-react"

export function MenuTab({ partnerId, branchId }: { partnerId: string, branchId: string | null }) {
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("All")

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const query = branchId ? `?branchId=${branchId}&partnerId=${partnerId}` : `?partnerId=${partnerId}`
        const res = await api.get(`/restaurant/menu${query}`)
        setMenuItems(res.data)
      } catch (err) {
        console.error("Failed to fetch menu", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMenu()
  }, [partnerId, branchId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (menuItems.length === 0) {
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
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
  )
}
