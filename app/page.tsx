"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthBranding } from "@/components/auth/auth-branding"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup")

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <AuthBranding />

      {/* Right side - Form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          <AuthForm activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </main>
    </div>
  )
}
