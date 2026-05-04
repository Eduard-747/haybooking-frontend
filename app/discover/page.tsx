"use client"

import { useState } from "react"
import { DiscoverHeader } from "@/components/discover/discover-header"
import { DiscoverSidebar } from "@/components/discover/discover-sidebar"
import { CategoryPills } from "@/components/discover/category-pills"
import { BusinessCard } from "@/components/discover/business-card"
import { DiscoverCTA } from "@/components/discover/discover-cta"
import { DiscoverFooter } from "@/components/discover/discover-footer"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, Clock } from "lucide-react"

const categories = [
  { id: "all", label: "All" },
  { id: "haircut", label: "Haircut" },
  { id: "dentist", label: "Dentist" },
  { id: "oil-change", label: "Oil Change" },
  { id: "spa", label: "Spa" },
  { id: "fitness", label: "Fitness" },
  { id: "pet-grooming", label: "Pet Grooming" },
  { id: "yoga", label: "Yoga" },
]

const businesses = [
  {
    id: 1,
    name: "Urban Cuts & S",
    fullName: "Urban Cuts & Styling",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop",
    services: ["Men's Haircut", "Beard Trim", "Hot Towel Shave"],
    distance: "0.8 miles",
    featured: true,
  },
  {
    id: 2,
    name: "Smile Dental Cli",
    fullName: "Smile Dental Clinic",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop",
    services: ["Teeth Whitening", "General Checkup", "Orthodontics"],
    distance: "1.2 miles",
    featured: false,
  },
  {
    id: 3,
    name: "Precision Auto",
    fullName: "Precision Auto Care",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    services: ["Oil Change", "Brake Inspection", "Tire Rotation"],
    distance: "2.5 miles",
    featured: true,
  },
  {
    id: 4,
    name: "Zenith Wellness S",
    fullName: "Zenith Wellness Spa",
    rating: 5,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
    services: ["Swedish Massage", "Facial Therapy", "Aromatherapy"],
    distance: "1.5 miles",
    featured: true,
  },
  {
    id: 5,
    name: "Iron Gate Fitne",
    fullName: "Iron Gate Fitness",
    rating: 4.6,
    reviews: 342,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    services: ["Personal Training", "HIIT Classes", "Yoga Sessions"],
    distance: "3.1 miles",
    featured: false,
  },
  {
    id: 6,
    name: "The Barkery Gro",
    fullName: "The Barkery Grooming",
    rating: 4.9,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop",
    services: ["Dog Wash", "Full Grooming", "Nail Trimming"],
    distance: "1.1 miles",
    featured: false,
  },
  {
    id: 7,
    name: "Radiant Skin Stu",
    fullName: "Radiant Skin Studio",
    rating: 4.8,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
    services: ["Laser Treatment", "Chemical Peel", "Microdermabrasion"],
    distance: "2.0 miles",
    featured: false,
  },
  {
    id: 8,
    name: "Elite Performanc",
    fullName: "Elite Performance Center",
    rating: 4.7,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    services: ["Cryotherapy", "IV Drip", "Recovery Massage"],
    distance: "4.5 miles",
    featured: true,
  },
]

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <DiscoverHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <DiscoverSidebar />

        {/* Main Content */}
        <main className="flex-1 px-6 lg:px-8 py-8">
          {/* Title and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Discover Services</h1>
              <p className="text-muted-foreground mt-1">Browse the top-rated professionals in your area</p>
            </div>
            <Button variant="outline" className="gap-2 self-start">
              <Filter className="h-4 w-4" />
              All Filters
            </Button>
          </div>

          {/* Category Pills */}
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Recommended Section */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <DiscoverCTA />

          {/* Show More */}
          <div className="flex flex-col items-center mt-12 gap-2">
            <span className="text-muted-foreground text-sm">Show more businesses</span>
            <button className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <DiscoverFooter />
    </div>
  )
}
