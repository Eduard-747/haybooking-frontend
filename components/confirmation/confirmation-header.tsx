"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ConfirmationHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-transparent border-2 border-primary rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-primary"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <path d="M8 14l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-primary">HayBooking</span>
            </Link>

            {/* Nav Link */}
            <nav className="hidden md:flex items-center">
              <Link 
                href="/bookings" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                My Bookings
              </Link>
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden sm:flex relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Avatar */}
            <button className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                alt="User avatar"
                fill
                className="object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
