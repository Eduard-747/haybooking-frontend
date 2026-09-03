"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, MapPin, Search as SearchIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { ClientBusinessCard, type BusinessCardData } from "@/components/client/business-card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

const BranchMapOverview = dynamic(
  () => import("@/components/maps/branch-map-overview"),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-muted animate-pulse rounded-2xl" /> }
)

const categories = [
  { value: "All", label: "common.all", fallback: "All" },
  { value: "salon", label: "landing.catBeautyWellness", fallback: "Salon & Spa" },
  { value: "fitness", label: "landing.catFitnessSports", fallback: "Fitness Studio" },
  { value: "medical", label: "landing.catHealthMedical", fallback: "Medical Practice" },
  { value: "restaurant", label: "landing.catRestaurantHospitality", fallback: "Restaurant & Dining" },
  { value: "auto", label: "landing.catAutomotive", fallback: "Auto Service" },
  { value: "pet", label: "landing.catPetServices", fallback: "Pet Grooming" },
  { value: "consulting", label: "landing.catProfessionalServices", fallback: "Consulting" },
  { value: "other", label: "landing.catOther", fallback: "Other" }
]

// Fallback businesses shown if DB returns nothing
const fallbackBusinesses: BusinessCardData[] = [
  {
    id: "1",
    name: "Urban Cuts & Shave",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop",
    distance: "0.8 miles away",
    tags: ["landing.catBeautyWellness"],
    serviceNames: "Lulu Լուլու Haircut Hair Trim Beard Styling" as any,
  },
  {
    id: "2",
    name: "Smile Dental Clinic",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    distance: "1.2 miles away",
    tags: ["landing.catHealthMedical"],
    serviceNames: "Teeth Cleaning Whitening Orthodontics Լուլու" as any,
  },
  {
    id: "3",
    name: "Precision Auto Care",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1632823465306-cdbb2b47bbf1?w=600&h=400&fit=crop",
    distance: "2.5 miles away",
    tags: ["landing.catAutomotive"],
    serviceNames: "Oil Change Tire Service Diagnostics" as any,
  },
  {
    id: "4",
    name: "Zenith Wellness Spa",
    rating: 5.0,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    distance: "1.5 miles away",
    tags: ["landing.catBeautyWellness"],
    serviceNames: "Swedish Massage Facial Sauna Spa Lulu Լուլու" as any,
  },
  {
    id: "5",
    name: "Iron Gate Fitness",
    rating: 4.6,
    reviews: 342,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    distance: "3.1 miles away",
    tags: ["landing.catFitnessSports"],
    serviceNames: "Personal Training Yoga Pilates Gym" as any,
  },
  {
    id: "6",
    name: "The Barkery Grooming",
    rating: 4.9,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=400&fit=crop",
    distance: "1.1 miles away",
    tags: ["landing.catPetServices"],
    serviceNames: "Dog Washing Cat Grooming Nail Trimming" as any,
  },
]

const ITEMS_PER_PAGE = 9;

import { useMultilingualSearch } from "@/hooks/use-multilingual-search"
import { matchMultilingualQuery } from "@/lib/search-transliteration"

function DiscoverContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"
  const urlQuery = searchParams.get("q") || ""

  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const categoryContainerRef = useRef<HTMLDivElement>(null)

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    detectedLang,
    isLoading: isSearchLoading,
    results: rawServerPartners,
  } = useMultilingualSearch<any>({
    endpoint: "/partners",
    debounceMs: 250,
    initialQuery: urlQuery,
    params: {
      category: activeCategory !== "All" ? activeCategory : undefined,
    },
  })

  useEffect(() => {
    const checkOverflow = () => {
      if (categoryContainerRef.current) {
        setShowExpandButton(categoryContainerRef.current.scrollHeight > 100)
      }
    }
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [])

  const [businesses, setBusinesses] = useState<BusinessCardData[]>(fallbackBusinesses)
  const [currentPage, setCurrentPage] = useState(1)
  const [pastBookedIds, setPastBookedIds] = useState<Set<string>>(new Set())
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapMarkers, setMapMarkers] = useState<{ id: string; lat: number; lng: number; label: string }[]>([])
  const router = useRouter()

  // Sync search input if URL changes
  useEffect(() => {
    if (urlQuery !== searchQuery && urlQuery !== debouncedQuery) {
      setSearchQuery(urlQuery)
    }
  }, [urlQuery])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeCategory])

  // Update businesses state whenever rawServerPartners or fallback update
  useEffect(() => {
    const fetchBranchesAndFormat = async () => {
      try {
        const branchesRes = await api.get('/branches').catch(() => ({ data: [] }))
        const branchesData = branchesRes.data || []

        const markers = branchesData
          .filter((b: any) => b.location?.latitude && b.location?.longitude && b.partnerId)
          .map((b: any) => ({
            id: b.partnerId.slug || b.partnerId._id,
            branchId: b._id,
            lat: b.location.latitude,
            lng: b.location.longitude,
            label: `${b.partnerId.businessName} - ${b.address?.city || 'Location'}`
          }))
        setMapMarkers(markers)

        if (Array.isArray(rawServerPartners) && rawServerPartners.length > 0) {
          const typeLabels: Record<string, string> = {
            salon: "landing.catBeautyWellness",
            medical: "landing.catHealthMedical",
            fitness: "landing.catFitnessSports",
            consulting: "landing.catProfessionalServices",
            restaurant: "landing.catRestaurantHospitality",
            auto: "landing.catAutomotive",
            pet: "landing.catPetServices",
            other: "landing.catOther"
          };

          const formatted: BusinessCardData[] = rawServerPartners.map((p: any) => {
            const partnerBranches = branchesData.filter((b: any) => b.partnerId && b.partnerId._id === p._id);
            const addresses = partnerBranches.map((b: any) => [b.address?.line1, b.address?.city, b.address?.country, b.address?.zipCode].filter(Boolean).join(" "));
            const serviceNames = (p.partnerServices || []).map((s: any) => s.name).join(" ");

            return {
              id: p._id,
              name: p.businessName,
              rating: 5.0,
              reviews: p.bookingCount || 0,
              image: p.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop",
              distance: t("common.nearby", "Nearby"),
              tags: [typeLabels[p.businessType] || "landing.catOther"],
              addresses: addresses.join(" | "),
              serviceNames: serviceNames,
            }
          })
          setBusinesses(formatted)
        } else if (rawServerPartners && rawServerPartners.length === 0 && debouncedQuery) {
          setBusinesses([])
        }
      } catch (err) {
        console.error("Failed to process partner search results", err)
      }
    }

    fetchBranchesAndFormat()
  }, [rawServerPartners])

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      api.get('/bookings/my')
        .then(bookingsRes => {
          const ids = new Set<string>();
          bookingsRes.data.forEach((b: any) => {
            if (b.partnerId && b.partnerId._id) {
              ids.add(b.partnerId._id);
            }
          });
          setPastBookedIds(ids);
        })
        .catch(() => {})
    }
  }, [])

  // Sort businesses based on past bookings and rating
  const sortedBusinesses = [...businesses].sort((a, b) => {
    const aUsed = pastBookedIds.has(a.id) ? 1 : 0;
    const bUsed = pastBookedIds.has(b.id) ? 1 : 0;
    if (aUsed !== bUsed) {
      return bUsed - aUsed;
    }
    const aActivity = a.reviews;
    const bActivity = b.reviews;
    return bActivity - aActivity;
  });

  // Filter businesses based on search query and category with multilingual transliteration fallback
  const filteredBusinesses = sortedBusinesses.filter(business => {
    const safeName = business.name || "";
    const safeTags = Array.isArray(business.tags) ? business.tags : [];
    const safeAddresses = (business as any).addresses || "";
    const safeServices = (business as any).serviceNames || "";

    const matchesCategory = activeCategory === "All" || safeTags.some((tag: string) => (tag || "").toLowerCase().includes(activeCategory.toLowerCase()));
    
    const matchesQuery = !searchQuery || 
      matchMultilingualQuery(safeName, searchQuery) ||
      safeTags.some((tag: string) => matchMultilingualQuery(tag, searchQuery)) ||
      matchMultilingualQuery(safeAddresses, searchQuery) ||
      matchMultilingualQuery(safeServices, searchQuery);
    
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      
      {/* Header & Categories */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("landing.discoverServices", "Discover Services")}</h1>
            {searchQuery ? (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                {t("common.showingResultsFor", "Results for")} &quot;<span className="font-semibold text-foreground">{searchQuery}</span>&quot;
                {detectedLang !== 'unknown' && (
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                    {detectedLang}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground mt-1">{t("landing.browseTopRated", "Browse the top-rated professionals in your area")}</p>
            )}
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.search", "Search...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 bg-white border border-border/60 rounded-xl text-sm focus:outline-none focus:border-[#FF4444] shadow-sm transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              {isSearchLoading && (
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              {detectedLang !== 'unknown' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">
                  {detectedLang}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="relative mb-2">
          <div 
            ref={categoryContainerRef}
            className={`flex flex-wrap items-center gap-3 transition-all duration-300 relative ${!isExpanded ? 'max-h-[96px] overflow-hidden' : 'pb-2'}`}
          >
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
                  activeCategory === category.value 
                    ? "bg-[#FF4444] border-[#FF4444] text-white shadow-sm" 
                    : "bg-white border-border/60 text-muted-foreground hover:border-[#FF4444] hover:text-[#FF4444]"
                }`}
              >
                {t(category.label, category.fallback)}
              </button>
            ))}
          </div>
          {showExpandButton && !isExpanded && (
            <div className="absolute bottom-2 right-0 bg-gradient-to-l from-background via-background to-transparent pl-12 pr-1 flex items-center z-10">
              <button
                onClick={() => setIsExpanded(true)}
                className="bg-white shadow-sm border border-border/60 rounded-full px-4 py-1.5 text-sm font-bold text-muted-foreground hover:text-[#FF4444] transition-colors"
              >
                ...
              </button>
            </div>
          )}
          {showExpandButton && isExpanded && (
            <div className="flex justify-center mt-3">
              <button
                 onClick={() => setIsExpanded(false)}
                 className="bg-white shadow-sm border border-border/60 rounded-full px-5 py-1.5 text-xs font-bold text-foreground hover:border-[#FF4444] transition-colors flex items-center gap-1"
              >
                 {t("common.showLess", "Show Less")} <ChevronUp className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#FF4444] rounded-full" />
          <h2 className="text-xl font-bold text-foreground">{t("landing.recommendedForYou", "Recommended for You")}</h2>
          {!isSearchLoading && (
            <span className="text-xs text-muted-foreground ml-auto">
              {businesses.length} {t("landing.businesses", "businesses")}
            </span>
          )}
        </div>
        {isSearchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[16/10] bg-[#FEF2F2]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#FEF2F2] rounded w-2/3" />
                  <div className="h-3 bg-[#FEF2F2] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {searchQuery ? t("landing.searchResults", "Search Results") : activeCategory !== "All" ? `${t(categories.find(c => c.value === activeCategory)?.label || "", activeCategory)} ${t("landing.specialists", "Specialists")}` : t("landing.recommendedForYou", "Recommended for You")}
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">{filteredBusinesses.length} {t("common.results", "Results")}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedBusinesses.map(business => (
                <ClientBusinessCard key={business.id} business={business} />
              ))}
            </div>

            {filteredBusinesses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-border/40 shadow-sm mt-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t("landing.noResultsFound", "No results found")}</h3>
                <p className="text-muted-foreground max-w-md">
                  {t("landing.noResultsDesc", "We couldn't find any businesses matching your filters. Try adjusting your search criteria.")}
                </p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="mt-6 px-6 py-2.5 bg-foreground text-background font-semibold rounded-xl transition-colors"
                >
                  {t("common.clearFilters", "Clear Filters")}
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border/60 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
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
                          ? "bg-foreground text-background shadow-md"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground bg-white border border-border/60"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border/60 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="w-full bg-white rounded-3xl p-8 md:p-12 border border-border/40 shadow-sm flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="flex-1 space-y-4 relative z-10">
          <h2 className="text-2xl font-bold text-foreground">{t("landing.dontSeeWhatYouNeed", "Don't see what you're looking for?")}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            {t("landing.databaseUpdatedDaily", "Our database is updated daily with hundreds of new service providers. Search by location or specific treatment to find exactly what fits your schedule.")}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="bg-[#FF4444] hover:bg-[#BCAAA4] text-white rounded-full px-8">
              {t("landing.exploreAllCategories", "Explore All Categories")}
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full px-8 bg-white border-border/60 hover:bg-[#FAFAFA] text-muted-foreground hover:text-foreground"
              onClick={() => setShowMapModal(true)}
            >
              {t("landing.viewMap", "View Map")}
            </Button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center relative z-10">
          <div className="relative w-full max-w-md h-48 bg-[#FAFAFA] rounded-2xl border border-border/60 overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FF4444_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-border/40 flex items-center gap-4 relative z-10">
              <div className="h-10 w-10 rounded-full bg-[#FDEAEA] flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-[#FF4444]" />
              </div>
              <p className="font-semibold text-sm text-foreground">{t("landing.over500Locations", "Over 500+ locations near you")}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-xl border border-border/60 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">{t("landing.discoverViaMap", "Discover via Map")}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t("landing.findNearLocation", "Find businesses near your location.")}</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 w-full bg-[#FAFAFA] relative">
              <BranchMapOverview 
                markers={mapMarkers as any} 
                onMarkerClick={(slugOrId, branchId) => {
                  setShowMapModal(false)
                  if (branchId) {
                    router.push(`/b/${slugOrId}?branch=${branchId}`)
                  } else {
                    router.push(`/b/${slugOrId}`)
                  }
                }}
              />
              {mapMarkers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-border">
                    <p className="text-sm font-medium text-muted-foreground">{t("landing.noMapLocations", "No map locations available yet.")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#FF4444] border-t-transparent rounded-full" />
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  )
}
