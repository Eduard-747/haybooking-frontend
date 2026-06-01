"use client"

import { Star, MapPin, List, Map } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "react-i18next"

interface BusinessHeroProps {
  name: string
  image?: string
  rating: number
  reviewCount: number
  address: string
  status: string
  estimatedWait: string
  viewMode?: "list" | "map"
  onViewChange?: (view: "list" | "map") => void
}

export function BusinessHero({
  name,
  image,
  rating,
  reviewCount,
  address,
  status,
  estimatedWait,
  viewMode = "list",
  onViewChange,
}: BusinessHeroProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full mb-10">
      {/* Hero Image Container */}
      <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden shadow-sm mb-6">
        <img
          src={image || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=400&fit=crop"}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Text Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-white">{rating}</span>
              <span className="text-white/70">({reviewCount} {t("landing.reviews", "reviews")})</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-white/50" />
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">{t("book.status", "Status")}</p>
            <p className="text-sm font-semibold text-foreground">{status}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">{t("book.wait", "Estimated Wait")}</p>
            <p className="text-sm font-semibold text-foreground">{estimatedWait}</p>
          </div>
        </div>

        {/* List / Map Toggle */}
        <div className="flex items-center bg-[#FAFAFA] border border-border/60 rounded-full p-1">
          <button 
            onClick={() => onViewChange && onViewChange("list")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewMode === "list" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
            {t("book.list", "List")}
          </button>
          <button 
            onClick={() => onViewChange && onViewChange("map")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewMode === "map" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="h-4 w-4" />
            {t("book.map", "Map")}
          </button>
        </div>
      </div>
    </div>
  )
}
