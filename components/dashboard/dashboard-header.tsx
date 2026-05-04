"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings, clients or services..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                Theodore Roosevelt
              </p>
              <p className="text-xs text-muted-foreground">Branch Manager</p>
            </div>
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-border">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="Theodore Roosevelt"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background p-4">
          <nav className="space-y-2">
            {[
              "Home",
              "Calendar",
              "Services",
              "Branches",
              "Specialists",
              "Analytics",
              "Settings",
            ].map((item) => (
              <a
                key={item}
                href={`/dashboard/${item.toLowerCase()}`}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
