"use client"

import { Bell, Globe } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { usePartner } from "@/hooks/usePartner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { useBranchContext } from "./branch-context"
import { MapPin } from "lucide-react"
import { NotificationsPopover } from "./notifications-popover"
import Link from "next/link"

export function DashboardHeader() {
  const { user } = useAuth()
  const { partner } = usePartner()
  const pathname = usePathname()
  
  // Get initials for fallback avatar
  const initials = partner?.businessName
    ? partner.businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.phoneNumber?.substring(0, 2) || "HB"

  const { branches, selectedBranchId, setSelectedBranchId } = useBranchContext()

  return (
    <header className="h-16 border-b border-border/40 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Business Name & Branch Selector */}
      <div className="flex-1 flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm font-semibold text-foreground">
            {partner?.businessName || "Dashboard"}
          </span>
          {partner?.verified && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              ✓ Verified
            </span>
          )}
        </div>

        {branches.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-border">|</span>
            <div className="relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground absolute left-2 pointer-events-none" />
              <select
                value={selectedBranchId || ""}
                onChange={(e) => setSelectedBranchId(e.target.value || null)}
                className="pl-7 pr-8 py-1.5 bg-[#FAFAFA] border border-border/60 hover:border-[#C69C9B] rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#C69C9B] appearance-none cursor-pointer transition-colors"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.address.line1}, {b.address.city}
                  </option>
                ))}
              </select>
              <svg className="w-3 h-3 text-muted-foreground absolute right-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        
        {/* Language Selector */}
        <button className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <Globe className="h-4 w-4" />
          EN
          <svg className="w-3 h-3 ml-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Notifications */}
        <NotificationsPopover />
        
        {/* Business Image / Avatar */}
        <Link href="/dashboard/settings">
          <Avatar className="h-10 w-10 rounded-xl border border-border cursor-pointer bg-[#C69C9B]/20 hover:ring-2 hover:ring-[#C69C9B]/50 transition-all">
            {partner?.image ? (
              <AvatarImage src={partner.image} alt={partner.businessName} className="object-cover rounded-xl" />
            ) : null}
            <AvatarFallback className="text-[#C69C9B] font-semibold text-sm rounded-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

    </header>
  )
}
