"use client"

import Link from "next/link"
import { Search, Bell } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Logo } from "@/components/ui/logo"
export function ConfirmationHeader() {
  const { user } = useAuth();

  return (
    <header className="w-full bg-white border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          
          <Link href="/dashboard" className="hidden md:block text-sm font-semibold text-foreground hover:text-[#FF4444] transition-colors">
            My Bookings
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            placeholder="Explore services..." 
            className="w-full h-9 pl-9 pr-4 bg-[#FAFAFA] border border-border/50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FF4444]/50"
          />
        </div>

        {/* Right: Auth / Actions */}
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors p-2 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#FF4444] rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3">
            {user ? (
              <Avatar className="h-9 w-9 border border-border cursor-pointer">
                <AvatarFallback>{user.phoneNumber?.substring(0, 2) || "U"}</AvatarFallback>
                <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" />
              </Avatar>
            ) : (
              <Avatar className="h-9 w-9 border border-border cursor-pointer">
                <AvatarFallback>U</AvatarFallback>
                <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" />
              </Avatar>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
