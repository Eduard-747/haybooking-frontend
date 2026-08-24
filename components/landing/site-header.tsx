"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Logo } from "@/components/ui/logo"

export function SiteHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const handleAvatarClick = () => {
    if (user?.role === 'partner') {
      router.push('/dashboard')
    } else {
      router.push('/client/discover')
    }
  }

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-slate-100/90 shadow-2xs">
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between py-2 sm:py-3.5">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-98 shrink-0">
          <Logo width={180} height={50} className="h-8 sm:h-11 md:h-12 w-auto" />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageSwitcher />

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button 
                onClick={() => {
                  logout()
                  window.location.href = '/auth'
                }} 
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-slate-200 bg-white shrink-0"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{t("auth.logout", "Sign Out")}</span>
              </button>
              <Avatar 
                onClick={handleAvatarClick}
                className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer border-2 border-white ring-2 ring-[#FF385C]/20 hover:ring-[#FF385C]/50 transition-all shrink-0"
              >
                <AvatarFallback className="bg-[#FFF0F3] text-[#FF385C] font-bold text-xs">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : <User className="h-4 w-4 text-[#FF385C]" />}
                </AvatarFallback>
                {(user.image || user.name) && (
                  <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.name || '') + ' ' + (user.surname || ''))}&background=FFF0F3&color=FF385C&size=100`} />
                )}
              </Avatar>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="px-3.5 sm:px-6 py-1.5 sm:py-2.5 bg-[#FF385C] hover:bg-[#E0304F] active:scale-95 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs whitespace-nowrap flex items-center justify-center shrink-0"
            >
              {t("auth.signIn", "Sign in")}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
