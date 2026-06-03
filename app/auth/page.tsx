"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthBranding } from "@/components/auth/auth-branding"
import Link from "next/link"
import { useTranslation } from "react-i18next"

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
    <div className="flex min-h-screen w-full bg-slate-50/30">
      {/* Left side - Header, Tagline & Form */}
      <main className="flex w-full lg:w-[45%] flex-col px-6 py-10 lg:px-12 relative bg-white z-10 shadow-2xl min-h-screen">
        {/* Logo - aligned to the very left padding edge of the screen */}
        <div className="w-full flex items-center justify-start mb-10">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
        </div>

        {/* Tagline & Form Container */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-start pt-2 sm:pt-6 pb-8">
          {/* Tagline */}
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5555E]/10 text-[#E5555E] text-xs font-semibold tracking-wide normal-case">
              ✨ Haybooking Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 sm:whitespace-nowrap">
              {t("auth.intelligentScheduling")}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md font-normal">
              {t("auth.joinThousands")}
            </p>
          </div>

          {/* Form - pushed down slightly using margin-top */}
          <div className="w-full mt-6 sm:mt-14">
            <AuthForm activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </main>

      {/* Right side - Branding */}
      <AuthBranding />
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
