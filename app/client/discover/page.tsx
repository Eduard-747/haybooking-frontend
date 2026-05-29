"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, MapPin, Search as SearchIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { ClientBusinessCard, type BusinessCardData } from "@/components/client/business-card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const BranchMapOverview = dynamic(
  () => import("@/components/maps/branch-map-overview"),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-muted animate-pulse rounded-2xl" /> }
)

const categories = [
  { value: "All", label: "All" },
  { value: "salon", label: "Salon & Spa" },
  { value: "fitness", label: "Fitness Studio" },
  { value: "medical", label: "Medical Practice" },
  { value: "restaurant", label: "Restaurant & Dining" },
  { value: "auto", label: "Auto Service" },
  { value: "pet", label: "Pet Grooming" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" }
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
    tags: ["salon", "Men's Haircut"],
  },
  {
    id: "2",
    name: "Smile Dental Clinic",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    distance: "1.2 miles away",
    tags: ["medical", "Teeth Whitening"],
  },
  {
    id: "3",
    name: "Precision Auto Care",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1632823465306-cdbb2b47bbf1?w=600&h=400&fit=crop",
    distance: "2.5 miles away",
    tags: ["auto", "Oil Change"],
  },
  {
    id: "4",
    name: "Zenith Wellness Spa",
    rating: 5.0,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    distance: "1.5 miles away",
    tags: ["salon", "Swedish Massage"],
  },
  {
    id: "5",
    name: "Iron Gate Fitness",
    rating: 4.6,
    reviews: 342,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    distance: "3.1 miles away",
    tags: ["fitness", "Personal Training"],
  },
  {
    id: "6",
    name: "The Barkery Grooming",
    rating: 4.9,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=400&fit=crop",
    distance: "1.1 miles away",
    tags: ["pet", "Dog Wash"],
  },
]

const ITEMS_PER_PAGE = 9;

function DiscoverContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"
  const urlQuery = searchParams.get("q") || ""

  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [businesses, setBusinesses] = useState<BusinessCardData[]>(fallbackBusinesses)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pastBookedIds, setPastBookedIds] = useState<Set<string>>(new Set())
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapMarkers, setMapMarkers] = useState<{ id: string; lat: number; lng: number; label: string }[]>([])
  const router = useRouter()

  // Sync with URL query
  useEffect(() => {
    setSearchQuery(urlQuery)
  }, [urlQuery])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeCategory])

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true)
        const [res, branchesRes] = await Promise.all([
          api.get('/partners'),
          api.get('/branches').catch(() => ({ data: [] }))
        ]);

        const branchesData = branchesRes.data;

        // Fetch all branches for the map
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

        if (res.data && res.data.length > 0) {
          const formatted: BusinessCardData[] = res.data.map((p: any) => {
            const partnerBranches = branchesData.filter((b: any) => b.partnerId && b.partnerId._id === p._id);
            const addresses = partnerBranches.map((b: any) => [b.address?.line1, b.address?.city, b.address?.country, b.address?.zipCode].filter(Boolean).join(" "));

            const typeLabels: Record<string, string> = {
              salon: "Salon & Spa",
              medical: "Medical Practice",
              fitness: "Fitness Studio",
              consulting: "Consulting Services",
              restaurant: "Restaurant & Dining",
              auto: "Auto Service",
              pet: "Pet Grooming",
              other: "Other"
            };
            
            return {
              id: p._id,
              name: p.businessName,
              rating: 5.0,
              reviews: p.bookingCount || 0,
              image: p.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop",
              distance: "Nearby",
              tags: [typeLabels[p.businessType] || p.businessType || "Service"].filter(Boolean),
              addresses: addresses.join(" | ")
            }
          })
          setBusinesses(formatted)
        }

        if (localStorage.getItem('access_token')) {
          try {
            const bookingsRes = await api.get('/bookings/my');
            const ids = new Set<string>();
            bookingsRes.data.forEach((b: any) => {
              if (b.partnerId && b.partnerId._id) {
                ids.add(b.partnerId._id);
              }
            });
            setPastBookedIds(ids);
          } catch (e) {
            // Silently ignore if user bookings fetch fails
          }
        }

        // Map markers are already set above
      } catch (err) {
        console.error("Failed to fetch partners, using fallback", err)
        // Keep fallback businesses
      } finally {
        setIsLoading(false)
      }
    }
    fetchPartners()
  }, [])

  // Sort businesses based on past bookings and rating
  const sortedBusinesses = [...businesses].sort((a, b) => {
    const aUsed = pastBookedIds.has(a.id) ? 1 : 0;
    const bUsed = pastBookedIds.has(b.id) ? 1 : 0;
    if (aUsed !== bUsed) {
      return bUsed - aUsed; // Prioritize already used businesses
    }
    // Fallback sorting by rating/reviews as "activity"
    const aActivity = a.reviews;
    const bActivity = b.reviews;
    return bActivity - aActivity;
  });

  // Filter businesses based on search query and category
  const filteredBusinesses = sortedBusinesses.filter(business => {
    const safeName = business.name || "";
    const safeTags = Array.isArray(business.tags) ? business.tags : [];
    const safeAddresses = (business as any).addresses || "";

    const matchesCategory = activeCategory === "All" || safeTags.some((tag: string) => (tag || "").toLowerCase().includes(activeCategory.toLowerCase()));
    
    const query = (searchQuery || "").toLowerCase();
    const matchesQuery = !query || 
      safeName.toLowerCase().includes(query) ||
      safeTags.some((tag: string) => (tag || "").toLowerCase().includes(query)) ||
      safeAddresses.toLowerCase().includes(query);
    
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
            <h1 className="text-3xl font-bold text-foreground">Discover Services</h1>
            {searchQuery ? (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                Results for "<span className="font-semibold text-foreground">{searchQuery}</span>"
              </p>
            ) : (
              <p className="text-muted-foreground mt-1">Browse the top-rated professionals in your area</p>
            )}
          </div>
          <Button variant="outline" className="shrink-0 bg-white shadow-sm border-border">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            All Filters
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
                activeCategory === category.value 
                  ? "bg-[#C69C9B] border-[#C69C9B] text-white shadow-sm" 
                  : "bg-white border-border/60 text-muted-foreground hover:border-[#C69C9B] hover:text-[#C69C9B]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#C69C9B] rounded-full" />
          <h2 className="text-xl font-bold text-foreground">Recommended for You</h2>
          {!isLoading && (
            <span className="text-xs text-muted-foreground ml-auto">
              {businesses.length} businesses
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[16/10] bg-[#F5EAEA]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#F5EAEA] rounded w-2/3" />
                  <div className="h-3 bg-[#F5EAEA] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {searchQuery ? "Search Results" : activeCategory !== "All" ? `${activeCategory} Specialists` : "Recommended for You"}
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">{filteredBusinesses.length} Results</span>
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
                <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any businesses matching your filters. Try adjusting your search criteria.
                </p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="mt-6 px-6 py-2.5 bg-foreground text-background font-semibold rounded-xl transition-colors"
                >
                  Clear Filters
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
          <h2 className="text-2xl font-bold text-foreground">Don't see what you're looking for?</h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            Our database is updated daily with hundreds of new service providers. Search by location or specific treatment to find exactly what fits your schedule.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="bg-[#C69C9B] hover:bg-[#BCAAA4] text-white rounded-full px-8">
              Explore All Categories
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full px-8 bg-white border-border/60 hover:bg-[#FAFAFA] text-muted-foreground hover:text-foreground"
              onClick={() => setShowMapModal(true)}
            >
              View Map
            </Button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center relative z-10">
          <div className="relative w-full max-w-md h-48 bg-[#FAFAFA] rounded-2xl border border-border/60 overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C69C9B_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-border/40 flex items-center gap-4 relative z-10">
              <div className="h-10 w-10 rounded-full bg-[#FDEAEA] flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-[#C69C9B]" />
              </div>
              <p className="font-semibold text-sm text-foreground">Over 500+ locations near you</p>
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
                <h3 className="text-xl font-bold text-foreground">Discover via Map</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Find businesses near your location.</p>
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
                    <p className="text-sm font-medium text-muted-foreground">No map locations available yet.</p>
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
        <div className="animate-spin h-8 w-8 border-2 border-[#E5555E] border-t-transparent rounded-full" />
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  )
}
