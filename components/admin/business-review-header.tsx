import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function BusinessReviewHeader() {
  return (
    <div className="border-b border-border bg-background px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Link
          href="/admin/onboarding"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Partner Onboarding
        </Link>
        <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
        <span className="text-foreground font-medium">Review Application</span>
      </div>

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            The Heritage Retreat & Spa
          </h1>
          <p className="text-muted-foreground mt-1">
            Application ID:{" "}
            <span className="text-primary font-medium">HB-99283-RE</span>
            {" "}&bull;{" "}
            <span className="text-amber-600">Submitted 2 days ago</span>
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <span className="inline-flex px-4 py-1.5 text-sm font-semibold text-amber-700 bg-amber-100 rounded-full uppercase tracking-wide">
            Pending Review
          </span>
        </div>
      </div>
    </div>
  )
}
