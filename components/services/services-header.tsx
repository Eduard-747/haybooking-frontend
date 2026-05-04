"use client"

import { Search, ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ServicesHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "grooming", label: "Premium Grooming" },
  { value: "massage", label: "Massage Therapy" },
  { value: "facial", label: "Facial Treatments" },
  { value: "nails", label: "Nail Services" },
]

const sortOptions = [
  { value: "modified", label: "Last Modified" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "duration", label: "Duration" },
]

export function ServicesHeader({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: ServicesHeaderProps) {
  return (
    <div className="mb-8">
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Manage Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Define and organize your service catalog across all business locations.
          </p>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add New Service
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-background border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select defaultValue="modified">
            <SelectTrigger className="w-full sm:w-40 bg-background border-border">
              <SelectValue placeholder="Last Modified" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
