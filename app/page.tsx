"use client"

import { useState, useEffect, useMemo } from "react"
import api from "@/lib/api"
import { SiteHeader } from "@/components/landing/site-header"
import { HeroSection, CategoryItem } from "@/components/landing/hero-section"
import { FeaturedBusinessCard } from "@/components/landing/featured-business-card"
import { SiteFooter } from "@/components/landing/site-footer"
import { useAuth } from "@/components/auth/auth-provider"
import { ChevronLeft, ChevronRight, Scissors, Heart, Dumbbell, Utensils, Home, PawPrint, Camera, Car, MoreHorizontal } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useMultilingualSearch } from "@/hooks/use-multilingual-search"
import { matchMultilingualQuery } from "@/lib/search-transliteration"

const ITEMS_PER_PAGE = 12

const fallbackBusinesses = [
  {
    id: "1",
    name: "Lusy beauty salon",
    fullName: "Lusy beauty salon",
    rating: 5.0,
    reviews: 10,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop",
    services: ["landing.catBeautyWellness"],
    rawType: "beauty",
    distance: "3.5 km away",
    closingTime: "Closes 7 PM",
  },
  {
    id: "2",
    name: "Glamour Studio",
    fullName: "Glamour Studio",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop",
    services: ["landing.catBeautyWellness"],
    rawType: "beauty",
    distance: "1.2 km away",
    closingTime: "Closes 8 PM",
  },
  {
    id: "3",
    name: "Zen Spa Retreat",
    fullName: "Zen Spa Retreat",
    rating: 4.8,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    services: ["landing.catBeautyWellness"],
    rawType: "beauty",
    distance: "2.6 km away",
    closingTime: "Closes 9 PM",
  },
  {
    id: "4",
    name: "The Olive Garden",
    fullName: "The Olive Garden",
    rating: 4.7,
    reviews: 256,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    services: ["landing.catRestaurantHospitality"],
    rawType: "restaurant",
    distance: "1.8 km away",
    closingTime: "Closes 11 PM",
  },
  {
    id: "5",
    name: "Home Clean Experts",
    fullName: "Home Clean Experts",
    rating: 4.6,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    services: ["landing.catHomeServices"],
    rawType: "home",
    distance: "2.1 km away",
    closingTime: "Closes 10 PM",
  },
  {
    id: "6",
    name: "Precision Auto Care",
    fullName: "Precision Auto Care",
    rating: 4.6,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1632823465306-cdbb2b47bbf1?w=600&h=400&fit=crop",
    services: ["landing.catAutomotive"],
    rawType: "automotive",
    distance: "3.4 km away",
    closingTime: "Closes 7 PM",
  },
  {
    id: "7",
    name: "Bright Dental Studio",
    fullName: "Bright Dental Studio",
    rating: 5.0,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
    services: ["landing.catHealthMedical"],
    rawType: "health",
    distance: "0.9 km away",
    closingTime: "Closes 6 PM",
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [businesses, setBusinesses] = useState<any[]>(fallbackBusinesses)
  const [activeCategory, setActiveCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [pastBookedIds, setPastBookedIds] = useState<Set<string>>(new Set())

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    results: rawServerPartners,
  } = useMultilingualSearch<any>({
    endpoint: "/partners",
    debounceMs: 250,
    params: {
      category: activeCategory !== "All" ? activeCategory : undefined,
    },
  })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeCategory])

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const branchesRes = await api.get('/branches').catch(() => ({ data: [] }))
        const branchesData = branchesRes.data || []

        if (Array.isArray(rawServerPartners) && rawServerPartners.length > 0) {
          const typeLabels: Record<string, string> = {
            health: "landing.catHealthMedical",
            medical: "landing.catHealthMedical",
            beauty: "landing.catBeautyWellness",
            salon: "landing.catBeautyWellness",
            fitness: "landing.catFitnessSports",
            professional: "landing.catProfessionalServices",
            consulting: "landing.catProfessionalServices",
            education: "landing.catEducationTraining",
            automotive: "landing.catAutomotive",
            auto: "landing.catAutomotive",
            home: "landing.catHomeServices",
            pet: "landing.catPetServices",
            events: "landing.catEventsPhotography",
            restaurant: "landing.catRestaurantHospitality",
            technology: "landing.catTechnologyServices",
            government: "landing.catGovernmentServices",
            other: "landing.catOther"
          }

          const formatted = rawServerPartners.map((p: any) => {
            const partnerBranches = branchesData.filter((b: any) => b.partnerId && b.partnerId._id === p._id)
            const addresses = partnerBranches.map((b: any) =>
              [b.address?.line1, b.address?.city, b.address?.country, b.address?.zipCode].filter(Boolean).join(" ")
            )
            const serviceNames = (p.partnerServices || []).map((s: any) => s.name).join(" ")

            return {
              id: p._id,
              name: p.businessName,
              fullName: p.businessName,
              rating: 5.0,
              reviews: p.bookingCount || 0,
              image: p.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop",
              services: [typeLabels[p.businessType] || p.businessType || "landing.catOther"],
              rawType: p.businessType || "other",
              addresses: addresses.join(" | "),
              serviceNames,
            }
          })
          setBusinesses(formatted)
        } else if (rawServerPartners && rawServerPartners.length === 0 && debouncedQuery) {
          setBusinesses([])
        }

        if (localStorage.getItem('access_token')) {
          try {
            const bookingsRes = await api.get('/bookings/my')
            const ids = new Set<string>()
            bookingsRes.data.forEach((b: any) => {
              if (b.partnerId && b.partnerId._id) {
                ids.add(b.partnerId._id)
              }
            })
            setPastBookedIds(ids)
          } catch (e) {
            // ignore silent error
          }
        }
      } catch (err) {
        console.error("Failed to fetch partners", err)
      }
    }
    fetchPartners()
  }, [rawServerPartners])

  // Dynamically calculate category list & counts from backend business data
  const dynamicCategories = useMemo<CategoryItem[]>(() => {
    const counts: Record<string, number> = {}

    businesses.forEach((b) => {
      const raw = (b.rawType || "other").toLowerCase()
      const catKey =
        raw === "salon" ? "beauty" :
        raw === "medical" ? "health" :
        raw === "auto" ? "automotive" :
        raw
      counts[catKey] = (counts[catKey] || 0) + 1
    })

    return [
      { key: "All", icon: null, labelKey: "landing.allCategory", defaultLabel: "All", count: businesses.length },
      { key: "beauty", icon: Scissors, labelKey: "landing.catBeautyWellness", defaultLabel: "Beauty & Wellness", count: counts["beauty"] || 0 },
      { key: "health", icon: Heart, labelKey: "landing.catHealthMedical", defaultLabel: "Health & Medical", count: counts["health"] || 0 },
      { key: "fitness", icon: Dumbbell, labelKey: "landing.catFitnessSports", defaultLabel: "Fitness & Sports", count: counts["fitness"] || 0 },
      { key: "restaurant", icon: Utensils, labelKey: "landing.catRestaurantHospitality", defaultLabel: "Restaurant & Hospitality", count: counts["restaurant"] || 0 },
      { key: "home", icon: Home, labelKey: "landing.catHomeServices", defaultLabel: "Home Services", count: counts["home"] || 0 },
      { key: "pet", icon: PawPrint, labelKey: "landing.catPetServices", defaultLabel: "Pet Services", count: counts["pet"] || 0 },
      { key: "events", icon: Camera, labelKey: "landing.catEventsPhotography", defaultLabel: "Events & Photography", count: counts["events"] || 0 },
      { key: "automotive", icon: Car, labelKey: "landing.catAutomotive", defaultLabel: "Automotive", count: counts["automotive"] || 0 },
      { key: "other", icon: MoreHorizontal, labelKey: "landing.catOther", defaultLabel: "More", count: counts["other"] || 0 },
    ]
  }, [businesses])

  const sortedBusinesses = [...businesses].sort((a, b) => {
    const aUsed = pastBookedIds.has(a.id) ? 1 : 0
    const bUsed = pastBookedIds.has(b.id) ? 1 : 0
    if (aUsed !== bUsed) {
      return bUsed - aUsed
    }
    return b.reviews - a.reviews
  })

  const filteredBusinesses = sortedBusinesses.filter((business) => {
    const safeName = business.name || ""
    const safeServices = Array.isArray(business.services) ? business.services : []
    const safeAddresses = business.addresses || ""
    const safeServiceNames = business.serviceNames || ""
    const rawType = (business.rawType || "").toLowerCase()

    let matchesCategory = activeCategory === "All"
    if (!matchesCategory) {
      const activeLower = activeCategory.toLowerCase()
      const normalizedRaw =
        rawType === "salon" ? "beauty" :
        rawType === "medical" ? "health" :
        rawType === "auto" ? "automotive" :
        rawType

      matchesCategory =
        normalizedRaw === activeLower ||
        rawType.includes(activeLower) ||
        safeServices.some((s: string) => (s || "").toLowerCase().includes(activeLower))
    }

    const matchesQuery =
      !searchQuery ||
      matchMultilingualQuery(safeName, searchQuery) ||
      safeServices.some((s: string) => matchMultilingualQuery(s, searchQuery)) ||
      matchMultilingualQuery(safeAddresses, searchQuery) ||
      matchMultilingualQuery(safeServiceNames, searchQuery)

    return matchesCategory && matchesQuery
  })

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE)
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center">
        <HeroSection
          activeCategory={activeCategory}
          categories={dynamicCategories}
          onSearch={(query) => setSearchQuery(query)}
          onCategorySelect={(cat) => {
            setActiveCategory(cat)
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* Featured Businesses Section */}
        <section id="results-section" className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-24 sm:pt-28">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                {searchQuery || activeCategory !== "All"
                  ? t("landing.matching", "Matching Businesses")
                  : t("landing.featured", "Featured businesses")}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                {searchQuery
                  ? `${t("common.showingResultsFor", "Showing results for")} "${searchQuery}"`
                  : activeCategory !== "All"
                  ? `${t("common.showingResultsFor", "Showing results for")} ${t(`landing.cat${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`, activeCategory)}`
                  : t("landing.handPicked", "Hand-picked recommendations for you")}
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#FF385C] hover:text-[#E0304F] transition-colors shrink-0">
              {t("landing.viewAll", "View all")}
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {paginatedBusinesses.map((business) => (
                <FeaturedBusinessCard key={business.id} business={business} />
              ))}
            </div>

            {/* Floating Next Arrow button on the right side matching Image 2 */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next businesses"
              className="absolute -right-4 xl:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all z-10 hidden xl:flex disabled:opacity-0 hover:scale-105"
            >
              <ChevronRight className="h-5 w-5 text-slate-700 stroke-[2.5]" />
            </button>
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-border/40 shadow-sm mt-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 mb-4">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t("landing.noBusinessesFound")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("landing.tryAdjusting")}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("All")
                }}
                className="mt-6 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-xl transition-colors"
              >
                {t("common.clearFilters")}
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border/60 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === i + 1
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border/60 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
