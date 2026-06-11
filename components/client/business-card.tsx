"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, BadgeCheck, Heart, ChevronRight } from "lucide-react"
import { useFavorites } from "./favorites-context"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export interface BusinessCardData {
  id: string
  name: string
  rating: number
  reviews: number
  image: string
  distance: string
  tags: string[]
}

interface ClientBusinessCardProps {
  business: BusinessCardData
}

export function ClientBusinessCard({ business }: ClientBusinessCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites()
  const { t } = useTranslation()
  const favorited = isFavorited(business.id)

  return (
    <div className="group bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={business.image}
          alt={business.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Verified Badge – top left (matches home page style) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-[#E5555E] flex items-center gap-1 shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 fill-[#E5555E] text-white" />
          {t("common.verified", "Verified")}
        </div>

        {/* Heart Button – top right */}
        <button 
          onClick={() => toggleFavorite(business)}
          className={cn(
            "absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full transition-all shadow-sm",
            favorited ? "text-[#E5555E]" : "text-muted-foreground hover:text-[#E5555E]"
          )}
        >
          <Heart className={cn("h-4 w-4 transition-all", favorited && "fill-[#E5555E]")} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Title */}
        <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-3">
          {business.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {business.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-[#FAFAFA] border border-border/50 rounded text-xs font-medium text-muted-foreground line-clamp-1" title={t(tag)}>
              {t(tag)}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
          <div className="flex items-center text-muted-foreground text-xs font-medium">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{business.distance}</span>
          </div>
          <Link
            href={`/booking/${business.id}`}
            className="flex items-center gap-1 px-4 py-1.5 bg-[#E5555E] hover:bg-[#c44047] text-white rounded-full text-xs font-bold transition-colors shadow-sm"
          >
            {t("common.book", "Book")}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  )
}
