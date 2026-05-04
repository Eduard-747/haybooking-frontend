"use client"

import { Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BranchFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

const filters = [
  { id: "all", label: "All", count: 24 },
  { id: "active", label: "Active", count: 18 },
  { id: "draft", label: "Draft", count: 6 },
]

export function BranchFilters({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}: BranchFiltersProps) {
  return (
    <div className="mb-8">
      {/* Title and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Manage Branches
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your business locations and their operating schedules.
          </p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-muted-foreground mr-2">BRANCH STATUS</span>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <button 
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
            onClick={() => onSortChange(sortBy === "newest" ? "oldest" : "newest")}
          >
            Newest First
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
