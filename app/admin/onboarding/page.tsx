"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { OnboardingStats } from "@/components/admin/onboarding-stats"
import { OnboardingTable } from "@/components/admin/onboarding-table"
import { AdminFooter } from "@/components/admin/admin-footer"

export default function AdminOnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar activePath="/admin/onboarding" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 p-6 lg:p-8">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Partner Onboarding
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and review incoming business registration requests.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh List
            </button>
          </div>

          {/* Stats Cards */}
          <OnboardingStats />

          {/* Data Table */}
          <OnboardingTable />
        </main>

        <AdminFooter />
      </div>
    </div>
  )
}
