"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"
import { ServicesHeader } from "@/components/services/services-header"
import { ServicesTable } from "@/components/services/services-table"
import { ServicesInfoCards } from "@/components/services/services-info-cards"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span>Admin</span>
            <span>/</span>
            <span className="text-foreground font-medium">Manage Services</span>
          </div>

          {/* Page Header */}
          <ServicesHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Services Table */}
          <ServicesTable 
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />

          {/* Info Cards */}
          <ServicesInfoCards />
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}
