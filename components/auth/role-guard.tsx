"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

interface RoleGuardProps {
  allowedRole: "client" | "partner" | "admin"
  children: React.ReactNode
}

/**
 * Wraps a page and redirects users who don't have the required role.
 * - clients trying to access /dashboard → /client/discover
 * - partners trying to access /client/* → /dashboard
 * - unauthenticated → /auth
 */
export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/auth")
      return
    }

    if (user.role !== allowedRole && user.role !== "admin") {
      if (user.role === "client") {
        router.replace("/client/discover")
      } else if (user.role === "partner") {
        router.replace("/dashboard")
      }
    }
  }, [user, loading, allowedRole, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-[#C69C9B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || (user.role !== allowedRole && user.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
