"use client"

import { Search, User, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMobileNav } from "@/components/mobile-nav-context"
import { ClientNotificationsPopover } from "./client-notifications-popover"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from "react-i18next"

import { detectLanguage } from "@/lib/search-transliteration"

export function ClientTopHeader() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const { setIsOpen } = useMobileNav()

  const detectedLang = detectLanguage(searchQuery)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      router.push(`/client/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-border/40 h-14 sm:h-16 flex items-center px-3 sm:px-6 sticky top-0 z-40 gap-2 sm:gap-4">
      
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Middle: Search Bar */}
      <div className="flex-1 max-w-2xl relative min-w-0">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder={t("common.search", "Search...")} 
          className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-12 bg-[#FAFAFA] border-none rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#FF4444]/50"
        />
        {detectedLang !== 'unknown' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 uppercase pointer-events-none">
            {detectedLang}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4 pl-4">
        <LanguageSwitcher />
        <ClientNotificationsPopover />

        <button 
          onClick={() => { logout(); router.push('/auth'); }}
          className="text-muted-foreground hover:text-red-500 transition-colors p-2 md:hidden"
          title={t("auth.signOut", "Sign Out")}
        >
          <LogOut className="h-5 w-5" />
        </button>
        
        <Avatar 
          className="h-9 w-9 border border-border cursor-pointer bg-[#FEF2F2] hover:ring-2 hover:ring-[#FF4444]/50 transition-all"
          onClick={() => router.push('/client/settings')}
        >
          <AvatarFallback className="bg-[#FEF2F2]">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : <User className="h-4 w-4 text-[#FF4444]" />}
          </AvatarFallback>
          {user && (user.image || user.name) && (
            <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.name || '') + ' ' + (user.surname || ''))}&background=FEF2F2&color=FF4444&size=100`} />
          )}
        </Avatar>
      </div>
      
    </header>
  )
}
