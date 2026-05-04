"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { BusinessReviewHeader } from "@/components/admin/business-review-header"
import { BusinessInformation } from "@/components/admin/business-information"
import { SupportingAssets } from "@/components/admin/supporting-assets"
import { ReviewActions } from "@/components/admin/review-actions"
import { AdminFooter } from "@/components/admin/admin-footer"

export default function BusinessReviewPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar activePath="/admin/onboarding" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1">
          {/* Header & Breadcrumb */}
          <BusinessReviewHeader />

          {/* Content Grid */}
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Business Information */}
              <div className="lg:col-span-2">
                <BusinessInformation />
              </div>

              {/* Right Column - Supporting Assets */}
              <div className="lg:col-span-1">
                <SupportingAssets />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <ReviewActions />
        </main>

        <AdminFooter />
      </div>
    </div>
  )
}
