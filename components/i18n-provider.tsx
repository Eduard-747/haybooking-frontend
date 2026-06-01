"use client"

import React, { useEffect, useState } from "react"
import i18next from "i18next"
import { I18nextProvider, initReactI18next } from "react-i18next"
import { resources } from "@/lib/i18n/locales"

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language on mount
    const savedLng = localStorage.getItem("app_lang")
    if (savedLng && ["en", "am", "ru"].includes(savedLng)) {
      i18next.changeLanguage(savedLng)
    }
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
}
