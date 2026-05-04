"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Business {
  id: number
  name: string
  fullName: string
  rating: number
  reviews: number
  image: string
  services: string[]
  distance: string
  featured: boolean
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <article className="group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={business.image}
          alt={business.fullName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Featured Badge */}
        {business.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground text-xs backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
              Featured
            </Badge>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 left-3" style={{ marginTop: business.featured ? "32px" : "0" }}>
          <Badge className="bg-emerald-500 text-white border-0 gap-1">
            <Star className="h-3 w-3 fill-white" />
            {business.rating}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
            "bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm",
            isFavorite && "text-red-500"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Name and Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1" title={business.fullName}>
            {business.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{business.rating}</span>
            <span className="text-muted-foreground/60">({business.reviews})</span>
          </div>
        </div>

        {/* Services Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {business.services.slice(0, 3).map((service, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Distance and View Details */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{business.distance}</span>
            <span>away</span>
          </div>
          <Link 
            href={`/booking/${business.id}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
