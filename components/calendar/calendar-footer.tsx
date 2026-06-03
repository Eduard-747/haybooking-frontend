import Link from "next/link"

export function CalendarFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 md:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Haybooking Inc. All rights reserved.
          </p>

          {/* Links */}
          <nav className="flex items-center gap-4 sm:gap-6">
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
