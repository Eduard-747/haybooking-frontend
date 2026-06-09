import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, Info } from "lucide-react"
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
  }
}

export function FeaturedBusinessCard({ business }: FeaturedBusinessCardProps) {
  const { t } = useTranslation();
  const rawCategory = business.services?.[0] || "landing.catOther";
  const category = rawCategory.startsWith("landing.") ? t(rawCategory) : rawCategory;

  return (
    <div className="group bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={business.image}
          alt={business.fullName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Verified Badge – top left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-[#E5555E] flex items-center gap-1 shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 fill-[#E5555E] text-white" />
          {t("common.verified", "Verified")}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase line-clamp-1" title={category}>
            {category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-2">
          {business.name}
        </h3>

        <div className="flex items-center justify-between mt-auto mb-4">
          <Link
            href={`/b/${business.id}?tab=about`}
            className="flex items-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors py-1.5 px-3 rounded-md shadow-sm"
          >
            <Info className="h-3.5 w-3.5 mr-1.5" />
            {t("book.aboutUs")}
          </Link>
        </div>

        <Link
          href={`/booking/${business.id}`}
          className="w-full text-center py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          {t("common.checkAvailability", "Check Availability")}
        </Link>
      </div>
    </div>
  )
}
