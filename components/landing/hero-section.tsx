"use client"

import {
  Search,
  Utensils,
  Scissors,
  Heart,
  Car,
  Home,
  PawPrint,
  Camera,
  MoreHorizontal,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
} from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { detectLanguage } from "@/lib/search-transliteration"

export interface CategoryItem {
  key: string
  icon?: any
  labelKey: string
  defaultLabel: string
  count?: number
}

interface HeroSectionProps {
  onSearch?: (query: string) => void
  onCategorySelect?: (category: string) => void
  activeCategory?: string
  categories?: CategoryItem[]
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { key: "All", icon: null, labelKey: "landing.allCategory", defaultLabel: "All Categories" },
  { key: "beauty", icon: Scissors, labelKey: "landing.catBeautyWellness", defaultLabel: "Beauty & Wellness" },
  { key: "health", icon: Heart, labelKey: "landing.catHealthMedical", defaultLabel: "Health & Medical" },
  { key: "fitness", icon: Dumbbell, labelKey: "landing.catFitnessSports", defaultLabel: "Fitness & Sports" },
  { key: "restaurant", icon: Utensils, labelKey: "landing.catRestaurantHospitality", defaultLabel: "Restaurant & Hospitality" },
  { key: "home", icon: Home, labelKey: "landing.catHomeServices", defaultLabel: "Home Services" },
  { key: "pet", icon: PawPrint, labelKey: "landing.catPetServices", defaultLabel: "Pet Services" },
  { key: "events", icon: Camera, labelKey: "landing.catEventsPhotography", defaultLabel: "Events & Photography" },
  { key: "automotive", icon: Car, labelKey: "landing.catAutomotive", defaultLabel: "Automotive" },
  { key: "other", icon: MoreHorizontal, labelKey: "landing.catOther", defaultLabel: "More" },
]

export function HeroSection({
  onSearch,
  onCategorySelect,
  activeCategory = "All",
  categories = DEFAULT_CATEGORIES,
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { t } = useTranslation()

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    onSearch?.(val)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    onSearch?.(searchQuery.trim())
  }

  const handleCategoryClick = (categoryKey: string) => {
    setShowCategoryDropdown(false)
    onCategorySelect?.(categoryKey)
  }

  // Derive category display label dynamically using i18n
  const currentCat = categories.find((c) => c.key.toLowerCase() === activeCategory.toLowerCase())
  const displayCategoryLabel = !currentCat || currentCat.key.toLowerCase() === "all"
    ? t("landing.allCategory", t("common.allCategories", "All Categories"))
    : t(currentCat.labelKey, currentCat.defaultLabel)

  return (
    <section className="w-full relative bg-[#F9FAFB] sm:bg-[#F7F7F6] overflow-visible pt-6 sm:pt-10 md:pt-14 pb-16 md:pb-24">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[55%] lg:w-[50%] overflow-hidden">
          <Image
            src="/hero-desk-scene.png"
            alt="Calendar desk scene"
            fill
            className="object-cover object-center md:object-left-center saturate-[1.15] contrast-[1.06] brightness-[1.02]"
            priority
          />
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#F7F7F6] via-[#F7F7F6]/60 to-transparent hidden md:block" />
        </div>
        <div className="absolute inset-0 bg-[#F7F7F6]/85 md:hidden" />
      </div>

      {/* Hero Content Area */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-full md:max-w-[660px] lg:max-w-[720px] py-4 md:py-6">
          
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#111827] leading-[1.12] tracking-tight mb-3 sm:mb-4">
            {t("landing.heroTitlePart1", "Book local services you'll")}{" "}
            <span
              className="text-[#FF385C] inline-block"
              style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: "1.16em" }}
            >
              {t("landing.heroTitleLove", "love")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 max-w-[480px] font-normal">
            {t("landing.heroDesc", "Discover and book the best salons, spas, restaurants, and professionals near you.")}
          </p>

          {/* Promotional Banner Card: "Book services without registering" */}
          <div
            onClick={() => {
              document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-full border border-rose-100/90 shadow-md shadow-rose-500/5 hover:shadow-lg hover:border-rose-200/90 transition-all p-3 sm:py-3.5 sm:px-5 mb-4 sm:mb-5 w-full max-w-full sm:max-w-[640px] lg:max-w-[700px] flex items-center justify-between gap-3 sm:gap-4 group cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFE8EE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF385C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2.5" ry="2.5" fill="#FF385C" fillOpacity="0.15" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#FF385C" strokeWidth="2.5" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#FF385C" strokeWidth="2.5" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#FF385C" strokeWidth="2" />
                  <circle cx="12" cy="15" r="1.8" fill="#FF385C" />
                  <path d="M12 15L14 13" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-[14px] md:text-[15px] leading-snug group-hover:text-[#FF385C] transition-colors">
                  {t("landing.bookWithoutRegistering", "Book services without registering")}
                </h3>
                <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-0.5 leading-snug">
                  {t("landing.quickEasyHassleFree", "Quick, easy, and hassle-free.")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="hidden sm:block w-px h-8 bg-slate-200/90" />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[#FF385C] font-extrabold text-xs sm:text-sm whitespace-nowrap group-hover:translate-x-0.5 transition-transform hidden sm:inline-block">
                  {t("landing.exploreServices", "Explore Services")}
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFE8EE] group-hover:bg-[#FF385C] group-hover:text-white text-[#FF385C] flex items-center justify-center transition-colors shrink-0 shadow-xs">
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-3xl sm:rounded-full border border-slate-200/90 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow p-2 pl-4 sm:pl-5 pr-2 w-full max-w-full sm:max-w-[640px] lg:max-w-[700px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 relative z-40"
          >
            {/* Live Search Location Input */}
            <div className="flex items-center flex-1 px-1 py-1.5 sm:py-0 min-w-0 relative">
              <MapPin className="h-4.5 w-4.5 text-slate-500 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder={t("landing.searchPlaceholder", "Where are you looking?") as string}
                className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent outline-none border-none focus:ring-0 pr-10"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {detectLanguage(searchQuery) !== 'unknown' && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase pointer-events-none">
                  {detectLanguage(searchQuery)}
                </span>
              )}
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200 shrink-0 mx-1" />

            {/* Dynamic Category Dropdown Tab */}
            <div className="relative shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 text-xs sm:text-sm text-slate-800 hover:text-[#FF385C] font-semibold whitespace-nowrap rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  <span>{displayCategoryLabel}</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Styled Dropdown Popup */}
              {showCategoryDropdown && (
                <div className="absolute top-full right-0 mt-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 py-2 w-72 sm:w-80 max-h-80 overflow-y-auto overflow-x-hidden">
                  {categories.map((cat) => {
                    const label = t(cat.labelKey, cat.defaultLabel)
                    const isSelected = activeCategory.toLowerCase() === cat.key.toLowerCase()

                    return (
                      <button
                        key={cat.key}
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm transition-colors text-left ${
                          isSelected
                            ? "bg-[#FFF0F3] text-[#FF385C] font-bold"
                            : "text-slate-700 hover:bg-slate-50 font-medium"
                        }`}
                        onClick={() => handleCategoryClick(cat.key)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          {cat.icon ? (
                            <cat.icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-[#FF385C]" : "text-slate-400"}`} />
                          ) : (
                            <div className="w-4 shrink-0" />
                          )}
                          <span className="truncate">{label}</span>
                        </div>
                        {cat.count !== undefined && cat.count > 0 && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                              isSelected ? "bg-[#FF385C] text-white" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {cat.count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Circular Pink Search Button */}
            <button
              type="submit"
              className="w-full sm:w-11 sm:h-11 py-2.5 sm:py-0 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-xl sm:rounded-full flex items-center justify-center transition-all shadow-md shadow-[#FF385C]/30 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5 stroke-[2.5] hidden sm:block" />
              <span className="sm:hidden flex items-center gap-2 font-semibold text-xs">
                <Search className="h-4 w-4 stroke-[2.5]" />
                <span>{t("common.search", "Search")}</span>
              </span>
            </button>
          </form>

        </div>
      </div>

      {/* Floating Category Filter Bar */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 -mb-20 sm:-mb-24 mt-6 sm:mt-8 relative z-10">
        <div className="relative group/bar bg-white/95 backdrop-blur-md rounded-full border border-slate-200/80 shadow-xl shadow-slate-200/40 p-2 px-3 sm:p-2.5 sm:px-4">
          
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-[#FF385C] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5 stroke-[2.5]" />
            </button>
          )}

          {/* Left Gradient Fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 rounded-l-full" />
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-[#FF385C] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 stroke-[2.5]" />
            </button>
          )}

          {/* Right Gradient Fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 rounded-r-full" />
          )}

          {/* Category Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.key.toLowerCase()
              const Icon = cat.icon
              const label = t(cat.labelKey, cat.defaultLabel)

              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`flex flex-col items-center gap-1.5 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer group min-w-[80px] sm:min-w-[90px] snap-start border ${
                    isActive
                      ? "bg-gradient-to-b from-[#FFF0F3] to-[#FFE5EA] border-[#FF385C]/25 shadow-xs scale-[1.02]"
                      : "bg-transparent border-transparent hover:bg-slate-50/90 hover:border-slate-200/60 hover:-translate-y-0.5 active:scale-95"
                  }`}
                >
                  <div
                    className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-tr from-[#FF385C] to-[#E0304F] text-white shadow-md shadow-[#FF385C]/30 scale-105"
                        : "bg-slate-100/90 text-slate-600 group-hover:bg-[#FFF0F3] group-hover:text-[#FF385C] group-hover:scale-105"
                    }`}
                  >
                    {cat.key === "All" ? (
                      <svg className="h-4.5 sm:h-5 w-4.5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
                        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
                        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
                        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
                      </svg>
                    ) : Icon ? (
                      <Icon className="h-4.5 sm:h-5 w-4.5 sm:w-5 stroke-[2]" />
                    ) : (
                      <MoreHorizontal className="h-4.5 sm:h-5 w-4.5 sm:w-5" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs tracking-tight whitespace-nowrap transition-colors ${
                      isActive ? "text-[#FF385C] font-bold" : "text-slate-600 group-hover:text-slate-900 font-medium"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Global font style */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
