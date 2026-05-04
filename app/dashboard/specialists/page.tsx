"use client"

import { useState } from "react"
import { SpecialistsHeader } from "@/components/specialists/specialists-header"
import { SpecialistsStats } from "@/components/specialists/specialists-stats"
import { SpecialistsGrid } from "@/components/specialists/specialists-grid"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

export default function SpecialistsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SpecialistsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="flex-1 px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground mb-3">
                Organization Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Manage Specialists
              </h1>
              <p className="text-muted-foreground mt-1">
                Coordinate your professional team, assign service branches, and maintain staff profiles.
              </p>
            </div>
          </div>

          <SpecialistsStats />
          
          <SpecialistsGrid searchQuery={searchQuery} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
