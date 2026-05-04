"use client"

import { useRouter } from "next/navigation"
import { XCircle, Pause, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReviewActions() {
  const router = useRouter()

  const handleReject = () => {
    // In a real app, this would call an API
    console.log("Application rejected")
    router.push("/admin/onboarding")
  }

  const handleHold = () => {
    // In a real app, this would call an API
    console.log("Application put on hold")
  }

  const handleApprove = () => {
    // In a real app, this would call an API
    console.log("Application approved")
    router.push("/admin/onboarding")
  }

  return (
    <div className="sticky bottom-0 z-40 bg-background border-t border-border">
      <div className="px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Actions */}
          <div className="flex items-center gap-3 order-2 sm:order-1">
            {/* Reject Button */}
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive px-6"
              onClick={handleReject}
            >
              <XCircle className="h-5 w-5" />
              Reject Application
            </Button>

            {/* Hold Button */}
            <Button
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground px-6"
              onClick={handleHold}
            >
              Hold for Review
            </Button>
          </div>

          {/* Right Action - Approve */}
          <div className="order-1 sm:order-2 w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold"
              onClick={handleApprove}
            >
              <CheckCircle className="h-5 w-5" />
              Approve Partner
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
