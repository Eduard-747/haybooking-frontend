"use client"

import { Bell, Globe, Menu } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { usePartner } from "@/hooks/usePartner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { NotificationsPopover } from "./notifications-popover"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useMobileNav } from "@/components/mobile-nav-context"

export function DashboardHeader() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { partner } = usePartner()
  const pathname = usePathname()
  
  // Get initials for fallback avatar
  const initials = partner?.businessName
    ? partner.businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.phoneNumber?.substring(0, 2) || "HB"

  const { setIsOpen } = useMobileNav()

  return (
    <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 shadow-2xs">
      
      {/* Left: Hamburger + Business Name */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center min-w-0">
          <Link href="/dashboard" className="text-sm sm:text-base font-extrabold text-slate-900 truncate hover:text-[#FF3B30] transition-colors cursor-pointer tracking-tight">
            {partner?.businessName || "La Bohem"}
          </Link>
          {partner?.verified && (
            <span className="ml-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* Language Selector */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationsPopover />
        
        {/* Profile Avatar Badge */}
        <Link href="/dashboard/settings">
          <div className="w-9 h-9 rounded-full bg-[#FFEAEA] text-[#FF3B30] font-extrabold text-xs flex items-center justify-center border border-rose-100 cursor-pointer hover:ring-2 hover:ring-[#FF3B30]/30 transition-all">
            {initials}
          </div>
        </Link>
      </div>

    </header>
  )
}
