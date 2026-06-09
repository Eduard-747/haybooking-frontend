"use client"

import { Search, Utensils, Scissors, Stethoscope, Car, Activity, Briefcase, BookOpen, Home, PawPrint, Camera, Laptop, Building, MoreHorizontal } from "lucide-react"
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
    <section className="w-full flex flex-col items-center justify-center pt-8 md:pt-12 pb-4 px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C1F26] mb-3" dangerouslySetInnerHTML={{ __html: t("landing.heroTitle", "Book Your Next <span class=\"bg-clip-text text-transparent bg-gradient-to-r from-[#b3888b] to-[#d6b4b6]\">Service</span><br/>Instantly") }} />
      <p className="text-muted-foreground text-base max-w-2xl mb-8">
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
          className="w-full h-12 pl-12 pr-28 rounded-full border-border/60 shadow-sm text-sm focus-visible:ring-1 focus-visible:ring-[#BC9B9E]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-1.5 bg-[#BC9B9E] text-white rounded-full text-sm font-medium hover:bg-[#a68689] transition-colors"
        >
          {t("common.search", "Search")}
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Row 1: 7 categories */}
        <div className="flex flex-wrap items-center justify-center gap-3">
        <button 
          onClick={() => handleCategoryClick("All")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "All" 
              ? "bg-[#C69C9B] border-[#C69C9B] text-white" 
              : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          {t("landing.allCategory")}
        </button>
        <button 
          onClick={() => handleCategoryClick("health")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "health" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          {t("landing.catHealthMedical")}
        </button>
        <button 
          onClick={() => handleCategoryClick("beauty")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "beauty" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Scissors className="h-4 w-4" />
          {t("landing.catBeautyWellness")}
        </button>
        <button 
          onClick={() => handleCategoryClick("fitness")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "fitness" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Activity className="h-4 w-4" />
          {t("landing.catFitnessSports")}
        </button>
        <button 
          onClick={() => handleCategoryClick("professional")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "professional" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          {t("landing.catProfessionalServices")}
        </button>
        <button 
          onClick={() => handleCategoryClick("education")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "education" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {t("landing.catEducationTraining")}
        </button>
        <button 
          onClick={() => handleCategoryClick("automotive")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "automotive" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Car className="h-4 w-4" />
          {t("landing.catAutomotive")}
        </button>
        </div>
        {/* Row 2: 7 categories */}
        <div className="flex flex-wrap items-center justify-center gap-3">
        <button 
          onClick={() => handleCategoryClick("home")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "home" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Home className="h-4 w-4" />
          {t("landing.catHomeServices")}
        </button>
        <button 
          onClick={() => handleCategoryClick("pet")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "pet" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <PawPrint className="h-4 w-4" />
          {t("landing.catPetServices")}
        </button>
        <button 
          onClick={() => handleCategoryClick("events")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "events" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Camera className="h-4 w-4" />
          {t("landing.catEventsPhotography")}
        </button>
        <button 
          onClick={() => handleCategoryClick("restaurant")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "restaurant" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Utensils className="h-4 w-4" />
          {t("landing.catRestaurantHospitality")}
        </button>
        <button 
          onClick={() => handleCategoryClick("technology")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "technology" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Laptop className="h-4 w-4" />
          {t("landing.catTechnologyServices")}
        </button>
        <button 
          onClick={() => handleCategoryClick("government")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "government" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <Building className="h-4 w-4" />
          {t("landing.catGovernmentServices")}
        </button>
        <button 
          onClick={() => handleCategoryClick("other")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm ${
            activeCategory === "other" ? "bg-[#C69C9B] border-[#C69C9B] text-white" : "border-border/60 bg-white text-foreground hover:bg-muted"
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
          {t("landing.catOther")}
        </button>
        </div>
      </div>
    </section>
  )
}
