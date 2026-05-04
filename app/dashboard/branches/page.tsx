"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { BranchesHeader } from "@/components/branches/branches-header"
import { BranchFilters } from "@/components/branches/branch-filters"
import { BranchList } from "@/components/branches/branch-list"
import { BranchesTip } from "@/components/branches/branches-tip"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

export default function BranchesPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <DashboardSidebar activePath="/dashboard/branches" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <BranchesHeader />
          
          <div className="flex-1 px-4 md:px-8 lg:px-16 py-8">
            <div className="max-w-5xl mx-auto">
              <BranchFilters 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
              
              <BranchList activeFilter={activeFilter} />
              
              <BranchesTip />
            </div>
          </div>

          <DashboardFooter />
        </main>
      </div>
    </div>
  )
}
