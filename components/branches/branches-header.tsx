"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { Logo } from "@/components/ui/logo"
export function BranchesHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="px-4 md:px-8 lg:px-16 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Logo />
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search branches..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Globe className="h-5 w-5" />
          </Button>
          
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-border">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="User"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
