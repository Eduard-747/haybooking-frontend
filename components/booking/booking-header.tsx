"use client"

import Link from "next/link"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Search, HelpCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

import { Logo } from "@/components/ui/logo"
import { useTranslation } from "react-i18next"
export function BookingHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <header className="w-full bg-white border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Middle: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            placeholder={t("common.searchPlaceholder", "Search for services or locations...")} 
            className="w-full h-10 pl-10 pr-4 bg-[#FAFAFA] border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#E5555E]/50"
          />
        </div>

        {/* Right: Auth / Actions */}
        <div className="flex items-center gap-6">
          <LanguageSwitcher />

          {/* User Account / Sign In */}    <div className="flex items-center gap-3">
            {user ? (
              <Avatar 
                className="h-9 w-9 border border-border cursor-pointer hover:ring-2 hover:ring-[#E5555E]/50 transition-all"
                onClick={() => router.push('/client/discover')}
              >
                <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : user.phoneNumber?.substring(0, 2) || "U"}</AvatarFallback>
                {(user.image || user.name) && (
                  <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.name || '') + ' ' + (user.surname || ''))}&background=FDF6F6&color=C69C9B&size=100`} />
                )}
              </Avatar>
            ) : (
              <Link href="/auth" className="text-sm font-semibold text-foreground hover:text-[#E5555E]">
                {t("auth.signIn", "Sign In")}
              </Link>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
