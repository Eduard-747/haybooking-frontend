"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { TodayTimeline } from "@/components/dashboard/today-timeline"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { BranchTarget } from "@/components/dashboard/branch-target"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Analytics Overview
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back. Here&apos;s what&apos;s happening at your branches today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Booking
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <KpiCards />

          {/* Main Grid - Timeline and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Today's Timeline - Takes 2 columns */}
            <div className="lg:col-span-2">
              <TodayTimeline />
            </div>

            {/* Right Column - Recent Activity and Branch Target */}
            <div className="space-y-6">
              <RecentActivity />
              <BranchTarget />
            </div>
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}
