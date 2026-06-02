"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthBranding } from "@/components/auth/auth-branding"
import Link from "next/link"
import { CalendarCheck } from "lucide-react"

import { Logo } from "@/components/ui/logo"
function AuthPageContent() {
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
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <main className="flex w-full lg:w-[45%] flex-col items-center justify-center px-6 py-12 lg:px-8 relative bg-white z-10 shadow-2xl">
        {/* Desktop Logo */}
        <Link href="/" className="absolute top-8 left-8 hidden lg:flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        
        <div className="w-full max-w-md mt-10 lg:mt-0">
          <AuthForm activeTab={activeTab} onTabChange={setActiveTab} />
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
