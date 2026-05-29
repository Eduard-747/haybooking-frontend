"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import api from "@/lib/api"

interface Partner {
  _id: string
  businessName: string
  businessType: string
  subscriptionStatus: boolean
  image?: string
  slug?: string
  verified?: boolean
  publicDescription?: string
  autoAcceptBookings?: boolean
  autoCompleteBookings?: boolean
  currency?: string
}

export function usePartner() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/partners/me')
      .then(res => setPartner(res.data))
      .catch(() => setPartner(null))
      .finally(() => setLoading(false))
  }, [user])

  return { partner, loading, partnerId: partner?._id || null }
}
