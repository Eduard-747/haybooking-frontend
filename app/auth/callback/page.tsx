"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    
    if (token) {
      // Save the token
      localStorage.setItem("access_token", token)
      
      // Force a full reload to the home page so AuthProvider can fetch the fresh profile
      window.location.href = "/"
    } else {
      // If no token, something went wrong, go back to auth
      router.push("/auth")
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Authenticating securely with Google...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background">Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  )
}
