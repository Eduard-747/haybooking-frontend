import Link from "next/link"

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 md:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; 2024 HayBooking Analytics. All rights reserved.
          </p>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Support
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
