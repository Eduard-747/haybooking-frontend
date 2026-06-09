import { useState, useEffect } from "react"
import { defaultCountryCodes, getFlagEmoji } from "../countries"

export function useCountryCode(initialCode: string = "+1") {
  const [countryCode, setCountryCode] = useState(initialCode)
  const [countryCodesList, setCountryCodesList] = useState(defaultCountryCodes)

  useEffect(() => {
    async function fetchCountry() {
      try {
        // Try ipapi.co first
        const response = await fetch("https://ipapi.co/json/")
        if (response.ok) {
          const data = await response.json()
          if (data && data.country_calling_code && data.country) {
            updateCountryList(data.country_calling_code, data.country)
            return
          }
        }
      } catch (error) {
        // Silently fail and try fallback
      }

      try {
        // Fallback to ip-api.com
        const response = await fetch("http://ip-api.com/json/")
        if (response.ok) {
          const data = await response.json()
          if (data && data.countryCode) {
            // Find calling code from our list
            const match = defaultCountryCodes.find(c => c.country === data.countryCode)
            if (match) {
              updateCountryList(match.code, match.country)
              return
            }
          }
        }
      } catch (error) {
        // Silently fail and try language fallback
      }

      // Final fallback: Use application language or browser language
      try {
        const lang = window.localStorage.getItem("i18nextLng") || navigator.language
        if (lang.includes("am") || lang.includes("hy")) {
          updateCountryList("+374", "AM")
        } else if (lang.includes("ru")) {
          updateCountryList("+7", "RU")
        }
      } catch (e) {}
    }

    function updateCountryList(fetchedCode: string, isoCode: string) {
      setCountryCodesList((prev) => {
        const exists = prev.some((c) => c.code === fetchedCode)
        if (!exists && isoCode) {
          return [
            ...prev,
            {
              code: fetchedCode,
              country: isoCode,
              flag: getFlagEmoji(isoCode),
            },
          ]
        }
        return prev
      })
      setCountryCode(fetchedCode)
    }

    fetchCountry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { countryCode, setCountryCode, countryCodesList }
}
