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
  refreshBranches: () => Promise<void>
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { partnerId } = usePartner()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedBranchId")
      if (saved === "all") return null
      return saved || null
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(true)

  const setSelectedBranchId = (id: string | null) => {
    setSelectedBranchIdState(id)
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("selectedBranchId", id)
      } else {
        localStorage.setItem("selectedBranchId", "all")
      }
    }
  }

  const refreshBranches = async () => {
    if (!partnerId) return
    setIsLoading(true)
    try {
      const res = await api.get(`/branches?partnerId=${partnerId}`)
      const fetchedBranches: Branch[] = res.data || []
      setBranches(fetchedBranches)

      if (fetchedBranches.length > 0) {
        const savedId = typeof window !== "undefined" ? localStorage.getItem("selectedBranchId") : null

        if (savedId === "all") {
          setSelectedBranchIdState(null)
        } else if (savedId && fetchedBranches.some((b: Branch) => b._id === savedId)) {
          setSelectedBranchIdState(savedId)
        } else {
          // If no branch was saved yet in localStorage (first time ever), default to first branch
          setSelectedBranchId(fetchedBranches[0]._id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch branches", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      refreshBranches()
    } else {
      setBranches([])
      setIsLoading(false)
    }
  }, [partnerId])

  return (
    <BranchContext.Provider value={{ branches, selectedBranchId, setSelectedBranchId, isLoading, refreshBranches }}>
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
