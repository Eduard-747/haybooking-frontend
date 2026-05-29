"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import api from '@/lib/api'

interface Business {
  id: string
  name: string
  rating: number
  reviews: number
  image: string
  distance: string
  tags: string[]
}

interface FavoritesContextType {
  favorites: Business[]
  favoriteIds: Set<string>
  isFavorited: (id: string) => boolean
  toggleFavorite: (business: Business) => void
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Business[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Load favorite IDs from the backend on mount / user change
  useEffect(() => {
    if (!user) {
      setFavorites([])
      setFavoriteIds(new Set())
      setIsLoading(false)
      return
    }

    const loadFavorites = async () => {
      try {
        setIsLoading(true)
        const res = await api.get('/users/favorites')
        const ids: string[] = res.data || []
        setFavoriteIds(new Set(ids))

        // Fetch partner details for each favorited ID
        if (ids.length > 0) {
          const partnerRequests = ids.map(id =>
            api.get(`/partners/${id}`).catch(() => null)
          )
          const results = await Promise.all(partnerRequests)
          const loadedFavorites: Business[] = results
            .filter(r => r?.data)
            .map(r => ({
              id: r!.data._id,
              name: r!.data.businessName,
              rating: 4.8,
              reviews: 0,
              image: r!.data.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop",
              distance: "Nearby",
              tags: [r!.data.businessType || "Service"],
            }))
          setFavorites(loadedFavorites)
        } else {
          setFavorites([])
        }
      } catch {
        console.error("Failed to load favorites")
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  const isFavorited = useCallback((id: string) => {
    return favoriteIds.has(id)
  }, [favoriteIds])

  const toggleFavorite = useCallback((business: Business) => {
    const isCurrentlyFavorited = favoriteIds.has(business.id)

    if (isCurrentlyFavorited) {
      // Optimistic removal
      setFavoriteIds(prev => {
        const next = new Set(prev)
        next.delete(business.id)
        return next
      })
      setFavorites(prev => prev.filter(b => b.id !== business.id))

      // Persist to backend
      api.delete(`/users/favorites/${business.id}`).catch(() => {
        // Rollback on failure
        setFavoriteIds(prev => new Set(prev).add(business.id))
        setFavorites(prev => [...prev, business])
      })
    } else {
      // Optimistic addition
      setFavoriteIds(prev => new Set(prev).add(business.id))
      setFavorites(prev => [...prev, business])

      // Persist to backend
      api.post(`/users/favorites/${business.id}`).catch(() => {
        // Rollback on failure
        setFavoriteIds(prev => {
          const next = new Set(prev)
          next.delete(business.id)
          return next
        })
        setFavorites(prev => prev.filter(b => b.id !== business.id))
      })
    }
  }, [favoriteIds])

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteIds, isFavorited, toggleFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider')
  return context
}
