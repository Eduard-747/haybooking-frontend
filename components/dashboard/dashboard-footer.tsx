import Link from "next/link"
import Image from "next/image"

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 md:px-6 lg:px-8 py-4">
        {/* User Info Row (visible on services page) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Alexander Vance"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Alexander Vance</p>
              <p className="text-xs text-muted-foreground">Admin Partner</p>
            </div>
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Haybooking Inc.
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
            <span className="text-sm text-muted-foreground">
              Powered by Haystack Systems
            </span>
          </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
