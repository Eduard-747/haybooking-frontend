"use client"

import { Search, Bell, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

import { Logo } from "@/components/ui/logo"
interface DiscoverHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function DiscoverHeader({ searchQuery, onSearchChange }: DiscoverHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services or businesses..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Mobile Search */}
          <button className="sm:hidden p-2 rounded-full hover:bg-muted transition-colors">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <AvatarFallback>{user.phoneNumber ? user.phoneNumber.substring(0, 2) : "U"}</AvatarFallback>
                </Avatar>
                <button 
                  onClick={logout} 
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Sign In & Sign Up Buttons */}
              <Link 
                href="/auth" 
                className="hidden sm:flex text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="hidden sm:flex px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
