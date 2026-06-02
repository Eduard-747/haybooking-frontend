"use client"

import { Search, Utensils, Scissors, Stethoscope, Car, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface HeroSectionProps {
  onSearch?: (query: string) => void
  onCategorySelect?: (category: string) => void
  activeCategory?: string
}

export function HeroSection({ onSearch, onCategorySelect, activeCategory = "All" }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useTranslation()

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (onSearch) {
      onSearch(searchQuery.trim())
    }
  }

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category)
    }
  }
  return (
    <section className="w-full flex flex-col items-center justify-center pt-20 pb-4 px-4 text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#1C1F26] mb-4" dangerouslySetInnerHTML={{ __html: t("landing.heroTitle", "Book Your Next <span class=\"bg-clip-text text-transparent bg-gradient-to-r from-[#b3888b] to-[#d6b4b6]\">Service</span><br/>Instantly") }} />
      <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10">
        {t("landing.heroDesc", "Discover and book appointments with top-rated local professionals. From your morning coffee to your next hair appointment, we've got you covered.")}
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-8 flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input 
          type="text" 
          placeholder={t("landing.searchPlaceholder", "Search for services, businesses, or locations...") as string} 
          className="w-full h-14 pl-12 pr-32 rounded-full border-border/60 shadow-sm text-base focus-visible:ring-1 focus-visible:ring-[#BC9B9E]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#BC9B9E] text-white rounded-full font-medium hover:bg-[#a68689] transition-colors"
        >
          {t("common.search", "Search")}
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button 
          onClick={() => handleCategoryClick("All")} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            activeCategory === "All" 
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        <button 
          onClick={() => handleCategoryClick("salon")} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            activeCategory === "salon" 
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Scissors className="h-4 w-4" />
          Salon & Spa
        </button>
        <button 
          onClick={() => handleCategoryClick("fitness")} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            activeCategory === "fitness" 
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Activity className="h-4 w-4" />
          Fitness Studio
        </button>
        <button 
          onClick={() => handleCategoryClick("medical")} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            activeCategory === "medical"
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          Medical Practice
        </button>
        <button 
          onClick={() => handleCategoryClick("restaurant")} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            activeCategory === "restaurant" 
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Utensils className="h-4 w-4" />
          Restaurant & Dining
        </button>
        <button 
          onClick={() => handleCategoryClick("auto")} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm ${
            activeCategory === "auto"
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Car className="h-4 w-4" />
          Auto Service
        </button>
      </div>
    </section>
  )
}
