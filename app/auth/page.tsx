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
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    tab === "signup" ? "signup" : "signin"
  )

  useEffect(() => {
    if (tab === "signup") setActiveTab("signup")
    else setActiveTab("signin")
  }, [tab])

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <AuthBranding />

      {/* Right side - Form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8 relative">
        {/* Mobile Logo */}
        <Link href="/" className="absolute top-8 left-6 flex items-center gap-2 hover:opacity-80 transition-opacity lg:hidden">
          <Logo />
        </Link>
        
        <div className="w-full max-w-md mt-10 lg:mt-0">
          <AuthForm activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </main>
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
