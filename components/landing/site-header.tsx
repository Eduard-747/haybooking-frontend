"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

import { Logo } from "@/components/ui/logo"
export function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAvatarClick = () => {
    if (user?.role === 'partner') {
      router.push('/dashboard');
    } else {
      router.push('/client/discover');
    }
  };

  return (
    <header className="w-full bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Middle: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#services" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Find Services
          </Link>
          <Link href="#list-business" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            List Your Business
          </Link>
          <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  logout();
                  window.location.href = '/auth';
                }} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              <Avatar 
                onClick={handleAvatarClick}
                className="h-10 w-10 cursor-pointer border border-border bg-[#FDF6F6] hover:ring-2 hover:ring-[#C69C9B]/50 transition-all"
              >
                <AvatarFallback className="bg-[#FDF6F6]">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : <User className="h-5 w-5 text-[#C69C9B]" />}
                </AvatarFallback>
                {(user.image || user.name) && (
                  <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.name || '') + ' ' + (user.surname || ''))}&background=FDF6F6&color=C69C9B&size=100`} />
                )}
              </Avatar>
            </div>
          ) : (
            <>
              <Link href="/auth" className="text-sm font-semibold text-foreground hover:text-rose-500 transition-colors">
                Sign In
              </Link>
              <Link href="/auth?tab=signup" className="px-5 py-2.5 bg-[#BC9B9E] text-white rounded-md text-sm font-semibold hover:bg-[#a68689] transition-colors shadow-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
