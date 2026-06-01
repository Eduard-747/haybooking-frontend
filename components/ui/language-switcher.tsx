"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = e.target.value
    i18n.changeLanguage(lng)
    localStorage.setItem("app_lang", lng)
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border/60 rounded-xl text-sm shadow-sm transition-all focus-within:border-[#C69C9B] focus-within:ring-1 focus-within:ring-[#C69C9B]/20">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={i18n.language || "en"}
        onChange={handleLanguageChange}
        className="bg-transparent border-none outline-none font-semibold text-foreground cursor-pointer appearance-none pr-4"
        style={{
          background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right center",
          backgroundSize: "12px"
        }}
      >
        <option value="en">English</option>
        <option value="am">Հայերեն</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  )
}
