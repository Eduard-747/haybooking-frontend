"use client"

import { Heart } from "lucide-react"
import { ClientBusinessCard } from "@/components/client/business-card"
import { useFavorites } from "@/components/client/favorites-context"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"
import { useTranslation } from "react-i18next"

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const { t } = useTranslation()

  return (
    <RoleGuard allowedRole="client">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        
        {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Heart className="h-7 w-7 text-[#E5555E] fill-[#E5555E]" />
          {t("nav.favorites", "My Favorites")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {favorites.length > 0
            ? t("clientFavorites.savedBusinesses", "You have {{count}} saved businesses.", { count: favorites.length })
            : t("clientFavorites.businessesWillAppear", "Businesses you like will appear here.")}
        </p>
      </div>

      {favorites.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-full bg-[#FDF6F6] flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-[#C69C9B]" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t("clientFavorites.noFavorites", "No favorites yet")}</h2>
          <p className="text-muted-foreground text-sm max-w-xs mb-8">
            {t("clientFavorites.browseAndSave", "Browse services and tap the heart icon to save businesses you love.")}
          </p>
          <Link
            href="/client/discover"
            className="px-8 py-3 bg-[#C69C9B] hover:bg-[#BCAAA4] text-white rounded-full text-sm font-semibold transition-colors shadow-sm"
          >
            {t("landing.discoverServices", "Discover Services")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map(business => (
            <ClientBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      </div>
    </RoleGuard>
  )
}
