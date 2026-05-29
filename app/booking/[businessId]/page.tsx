"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function LegacyBookingRedirect() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    if (businessId) {
      router.replace(`/b/${businessId}`)
    }
  }, [businessId, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-[#E5555E] border-t-transparent rounded-full" />
    </div>
  )
}
