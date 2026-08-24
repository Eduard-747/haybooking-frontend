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
    <header className="h-14 sm:h-16 border-b border-border/40 bg-white flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40">
      
      {/* Left: Hamburger + Business Name & Branch Selector */}
      <div className="flex-1 flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center min-w-0">
          <Link href="/dashboard" className="text-sm font-semibold text-foreground truncate hover:text-[#FF4444] transition-colors cursor-pointer">
            {partner?.businessName || "La Bohem"}
          </Link>
          {partner?.verified && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        
        {/* Language Selector */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationsPopover />
        
        {/* Business Image / Avatar */}
        <Link href="/dashboard/settings">
          <Avatar className="h-9 w-9 rounded-full border border-border cursor-pointer bg-[#FF4444]/20 hover:ring-2 hover:ring-[#FF4444]/50 transition-all flex items-center justify-center">
            {partner?.image ? (
              <AvatarImage src={partner.image} alt={partner.businessName} className="object-cover rounded-full" />
            ) : null}
            <AvatarFallback className="text-[#FF4444] font-semibold text-xs rounded-full flex items-center justify-center">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

    </header>
  )
}
