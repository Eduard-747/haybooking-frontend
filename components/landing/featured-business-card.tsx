"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BadgeCheck, Heart, Star, MapPin, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"

interface FeaturedBusinessCardProps {
  business: {
    id: string
    name: string
    fullName: string
    rating: number
    reviews: number
    image: string
    services: string[]
    distance?: string
    closingTime?: string
  }
}

function pseudoRandom(seed: string, offset: number = 0) {
  let hash = offset
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash)
}

function getKmVal(id: string) {
  const km = (pseudoRandom(id, 1) % 30) / 10 + 0.8 // 0.8 – 3.8 km
  return km.toFixed(1)
}

function getTimeVal(id: string) {
  const times = ["8 PM", "9 PM", "10 PM", "11 PM", "7 PM", "6 PM"]
  return times[pseudoRandom(id, 2) % times.length]
}

export function FeaturedBusinessCard({ business }: FeaturedBusinessCardProps) {
  const { t } = useTranslation()
  const [isFavorited, setIsFavorited] = useState(false)

  const rawCategory = business.services?.[0] || "landing.catOther"
  const category = rawCategory.startsWith("landing.") ? t(rawCategory) : rawCategory
  
  const kmVal = getKmVal(business.id)
  const distanceStr = business.distance || t("common.kmAway", { distance: kmVal, defaultValue: `${kmVal} km away` })
  
  const timeVal = getTimeVal(business.id)
  const closingTimeStr = business.closingTime || t("common.closesAt", { time: timeVal, defaultValue: `Closes ${timeVal}` })

  return (
    <Link
      href={`/b/${business.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full border border-slate-100/90"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100">
        <Image
          src={business.image}
          alt={business.fullName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Verified Badge – top left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-[#FF385C] flex items-center gap-1 shadow-2xs">
          <BadgeCheck className="h-3.5 w-3.5 fill-[#FF385C] text-white" />
          {t("common.verified", "Verified")}
        </div>

        {/* Favorite Button – top right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsFavorited((prev) => !prev)
          }}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-2xs"
          aria-label="Add to favorites"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              isFavorited ? "fill-[#FF385C] text-[#FF385C]" : "text-slate-500"
            }`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category + Rating row */}
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className="text-xs font-semibold text-slate-500 truncate min-w-0 flex-1">
            {category}
          </span>
          <div className="flex items-center gap-1 shrink-0 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{business.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({business.reviews})</span>
          </div>
        </div>

        {/* Business Name */}
        <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-3">
          {business.name}
        </h3>

        {/* Distance + Closing Time */}
        <div className="flex items-center gap-4 mt-auto text-xs text-slate-400">
          <div className="flex items-center gap-1 shrink-0">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{distanceStr}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{closingTimeStr}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
