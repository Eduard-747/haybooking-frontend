"use client"

import Image from "next/image"
import { Star, MapPin, List, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BusinessHeroProps {
  name: string
  rating: number
  reviewCount: number
  address: string
  status: string
  estimatedWait: string
}

export function BusinessHero({
  name,
  rating,
  reviewCount,
  address,
  status,
  estimatedWait,
}: BusinessHeroProps) {
  return (
    <div className="space-y-4">
      {/* Hero Image */}
      <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&h=400&fit=crop"
          alt={name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">{name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
              <span className="text-white/80">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="h-4 w-4" />
              <span>{address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-border">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground uppercase tracking-wide text-xs">Status</span>
            <p className="font-medium text-foreground">{status}</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-wide text-xs">Estimated Wait</span>
            <p className="font-medium text-foreground">{estimatedWait}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <List className="h-4 w-4" />
            List
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
      </div>
    </div>
  )
}
