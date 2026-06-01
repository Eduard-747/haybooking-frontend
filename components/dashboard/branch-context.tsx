"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePartner } from "@/hooks/usePartner"
import api from "@/lib/api"

export interface Branch {
  _id: string
  address: {
    line1: string
    city: string
    country: string
  }
  breaks?: {
    weekday: number
    startTime: string
    endTime: string
  }[]
}

interface BranchContextType {
  branches: Branch[]
  selectedBranchId: string | null
  setSelectedBranchId: (id: string | null) => void
  isLoading: boolean
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { partnerId } = usePartner()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (partnerId) {
      setIsLoading(true)
      api.get(`/branches?partnerId=${partnerId}`)
        .then(res => {
          setBranches(res.data || [])
        })
        .catch(err => console.error("Failed to fetch branches", err))
        .finally(() => setIsLoading(false))
    } else {
      setBranches([])
      setSelectedBranchId(null)
      setIsLoading(false)
    }
  }, [partnerId])

  return (
    <BranchContext.Provider value={{ branches, selectedBranchId, setSelectedBranchId, isLoading }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranchContext() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error("useBranchContext must be used within a BranchProvider")
  }
  return context
}
