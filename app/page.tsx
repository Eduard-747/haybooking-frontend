"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { SiteHeader } from "@/components/landing/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedBusinessCard } from "@/components/landing/featured-business-card"
import { SiteFooter } from "@/components/landing/site-footer"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

const ITEMS_PER_PAGE = 9;

const fallbackBusinesses = [
  {
    id: "1",
    name: "Nordic Roast & Bakery",
    fullName: "Nordic Roast & Bakery",
    rating: 4.9,
    reviews: 174,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    services: ["landing.catOther"],
  },
  {
    id: "2",
    name: "The Velvet Chair",
    fullName: "The Velvet Chair",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&h=400&fit=crop",
    services: ["landing.catBeautyWellness"],
  },
  {
    id: "3",
    name: "Lumière Brasserie",
    fullName: "Lumière Brasserie",
    rating: 4.7,
    reviews: 715,
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=400&fit=crop",
    services: ["landing.catRestaurantHospitality"],
  },
  {
    id: "4",
    name: "Bright Dental Studio",
    fullName: "Bright Dental Studio",
    rating: 5.0,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
    services: ["landing.catHealthMedical"],
  },
  {
    id: "5",
    name: "Precision Auto Care",
    fullName: "Precision Auto Care",
    rating: 4.6,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1632823465306-cdbb2b47bbf1?w=600&h=400&fit=crop",
    services: ["landing.catAutomotive"],
  },
  {
    id: "6",
    name: "Saffron & Spice",
    fullName: "Saffron & Spice",
    rating: 4.8,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    services: ["landing.catRestaurantHospitality"],
  }
];

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<any[]>(fallbackBusinesses)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [pastBookedIds, setPastBookedIds] = useState<Set<string>>(new Set())

  const categoryKeys: Record<string, string> = {
    health: "catHealthMedical",
    beauty: "catBeautyWellness",
    fitness: "catFitnessSports",
    professional: "catProfessionalServices",
    education: "catEducationTraining",
    automotive: "catAutomotive",
    home: "catHomeServices",
    pet: "catPetServices",
    events: "catEventsPhotography",
    restaurant: "catRestaurantHospitality",
    technology: "catTechnologyServices",
    government: "catGovernmentServices",
    other: "catOther"
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeCategory])

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const [res, branchesRes] = await Promise.all([
          api.get('/partners'),
          api.get('/branches').catch(() => ({ data: [] }))
        ]);

        const branchesData = branchesRes.data;

        const formatted = res.data.map((p: any) => {
          const partnerBranches = branchesData.filter((b: any) => b.partnerId && b.partnerId._id === p._id);
          const addresses = partnerBranches.map((b: any) => [b.address?.line1, b.address?.city, b.address?.country, b.address?.zipCode].filter(Boolean).join(" "));

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
          };
          
          return {
            id: p._id,
            name: p.businessName,
            fullName: p.businessName,
            rating: 5.0, // Give them a perfect 5.0 base rating
            reviews: p.bookingCount || 0, // Map bookingCount to reviews metric for sorting
            image: p.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop",
            services: [typeLabels[p.businessType] || p.businessType || "landing.other"],
            addresses: addresses.join(" | ")
          };
        });
        if (formatted.length > 0) {
          setBusinesses(formatted);
        }

        // Fetch past bookings if user is logged in to prioritize them
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
      } catch (err) {
        console.error("Failed to fetch partners", err);
      }
    };
    fetchPartners();
  }, []);

  const sortedBusinesses = [...businesses].sort((a, b) => {
    const aUsed = pastBookedIds.has(a.id) ? 1 : 0;
    const bUsed = pastBookedIds.has(b.id) ? 1 : 0;
    if (aUsed !== bUsed) {
      return bUsed - aUsed; // Prioritize already used businesses
    }
    // Fallback sorting by bookingCount ("activity")
    const aActivity = a.reviews; // reviews now equals bookingCount
    const bActivity = b.reviews;
    return bActivity - aActivity;
  });

  const filteredBusinesses = sortedBusinesses.filter(business => {
    const safeName = business.name || "";
    const safeServices = Array.isArray(business.services) ? business.services : [];
    const safeAddresses = business.addresses || "";

    const matchesCategory = activeCategory === "All" || safeServices.some((s: string) => (s || "").toLowerCase().includes(activeCategory.toLowerCase()));
    
    const query = (searchQuery || "").toLowerCase();
    const matchesQuery = !query || 
      safeName.toLowerCase().includes(query) ||
      safeServices.some((s: string) => (s || "").toLowerCase().includes(query)) ||
      safeAddresses.toLowerCase().includes(query);
    
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center">
        <HeroSection 
          activeCategory={activeCategory}
          onSearch={(query) => setSearchQuery(query)}
          onCategorySelect={(cat) => {
            setActiveCategory(cat)
            // Scroll to the results smoothly
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* Featured Businesses Section */}
        <section id="results-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                {searchQuery || activeCategory !== "All" ? t("landing.searchResults", "Search Results") : t("landing.handPicked", "Hand-Picked for You")}
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                {searchQuery || activeCategory !== "All" ? t("landing.matching", "Matching Businesses") : t("landing.featured", "Featured Businesses")}
              </h2>
              {searchQuery && (
                <p className="text-foreground font-medium mb-3">
                  {t("common.showingResultsFor")} "{searchQuery}"
                </p>
              )}
              {activeCategory !== "All" && !searchQuery && (
                <p className="text-foreground font-medium mb-3">
                  {t("common.showingResultsFor")} {t(`landing.${categoryKeys[activeCategory] || 'catOther'}`)}
                </p>
              )}
              {(!searchQuery && activeCategory === "All") && (
                <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                  {t("landing.topRecommendations")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBusinesses.map(business => (
              <FeaturedBusinessCard key={business.id} business={business} />
            ))}
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
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
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
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
