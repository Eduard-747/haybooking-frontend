import { useState, useEffect } from "react"
import { usePartner } from "./usePartner"

export function useRestaurant() {
  const { partner, loading: partnerLoading } = usePartner()
  const [isRestaurant, setIsRestaurant] = useState(false)

  useEffect(() => {
    if (partner) {
      setIsRestaurant(partner.businessType === "restaurant")
    }
  }, [partner])

  return { isRestaurant, loading: partnerLoading }
}
