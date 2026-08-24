"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthBranding } from "@/components/auth/auth-branding"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Logo } from "@/components/ui/logo"

function AuthPageContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot" | "reset-verify">(
    tab === "signup" ? "signup" : "signin"
  )

  useEffect(() => {
    if (tab === "signup") setActiveTab("signup")
    else setActiveTab("signin")
  }, [tab])

  return (
    <div className="flex flex-col min-h-screen lg:h-screen w-full bg-white overflow-x-hidden">
      {/* Top Header Bar across full width with mobile responsive scaling */}
      <header className="w-full h-14 sm:h-20 bg-white border-b border-slate-100/90 px-3 sm:px-8 lg:px-12 flex items-center justify-between shrink-0 z-50">
        <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-98 shrink-0">
          <Logo width={160} height={44} className="h-7 sm:h-11 w-auto" />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageSwitcher />

          {/* Wishlist Heart Icon Button */}
          <Link
            href="/client/favorites"
            className="hidden xs:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs hover:shadow-xs active:scale-95 shrink-0"
            title={t("common.favorites", "Favorites")}
          >
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700 stroke-[2]" />
          </Link>

          {/* Coral-Red Dynamic Sign In / Sign Up Header Button */}
          <button
            onClick={() => setActiveTab((prev) => (prev === "signin" ? "signup" : "signin"))}
            className="px-3 sm:px-6 py-1.5 sm:py-2.5 bg-[#FF385C] hover:bg-[#E0304F] active:scale-95 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs whitespace-nowrap shrink-0 flex items-center justify-center"
          >
            {activeTab === "signin" ? t("auth.signUp", "Sign up") : t("auth.signIn", "Sign in")}
          </button>
        </div>
      </header>

      {/* Main 2-Column Split Section */}
      <div className="flex flex-1 w-full lg:h-[calc(100vh-80px)] overflow-y-auto lg:overflow-hidden">
        {/* Left Side: Form Panel */}
        <main className="w-full lg:w-[46%] xl:w-[44%] flex flex-col px-4 sm:px-8 lg:px-12 py-6 sm:py-8 relative bg-white z-10 min-h-full overflow-y-auto scrollbar-thin">
          <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center py-2 sm:py-4">
            <AuthForm activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </main>

        {/* Right Side: Visual Scene & Floating Badges */}
        <AuthBranding />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  )
}
