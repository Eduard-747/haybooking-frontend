"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import api from "@/lib/api"
import {
  detectLanguage,
  generateQueryVariants,
  SupportedLanguage,
} from "@/lib/search-transliteration"

export interface UseMultilingualSearchOptions {
  endpoint?: string
  debounceMs?: number
  initialQuery?: string
  params?: Record<string, any>
  enabled?: boolean
}

export function useMultilingualSearch<T = any>({
  endpoint,
  debounceMs = 250,
  initialQuery = "",
  params = {},
  enabled = true,
}: UseMultilingualSearchOptions = {}) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage>("unknown")
  const [queryVariants, setQueryVariants] = useState<string[]>([])
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. Language detection on typing (instant feedback)
  useEffect(() => {
    if (!query.trim()) {
      setDetectedLang("unknown")
      setQueryVariants([])
      return
    }
    const lang = detectLanguage(query)
    setDetectedLang(lang)
    const { variants } = generateQueryVariants(query)
    setQueryVariants(variants)
  }, [query])

  // 2. Debounce query by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // 3. Fetch search results with AbortController cancellation
  const executeSearch = useCallback(
    async (searchQuery: string, searchParams: Record<string, any>) => {
      if (!endpoint || !enabled) return

      // Abort previous in-flight request if present
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get(endpoint, {
          signal: controller.signal,
          params: {
            ...searchParams,
            q: searchQuery.trim() || undefined,
          },
        })
        setResults(response.data)
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError" || axios.isCancel(err)) {
          // Ignore canceled request errors
          return
        }
        setError(err)
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false)
        }
      }
    },
    [endpoint, enabled]
  )

  useEffect(() => {
    executeSearch(debouncedQuery, params)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedQuery, JSON.stringify(params), executeSearch])

  return {
    query,
    setQuery,
    debouncedQuery,
    detectedLang,
    queryVariants,
    results,
    setResults,
    isLoading,
    error,
    refetch: () => executeSearch(debouncedQuery, params),
  }
}
