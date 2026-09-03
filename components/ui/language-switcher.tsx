"use client"

import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Globe, ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en", label: "English" },
  { code: "am", label: "Հայերեն" },
  { code: "ru", label: "Русский" },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const rawCode = (i18n.language || "en").substring(0, 2)
  const currentLangCode = rawCode === "hy" ? "am" : rawCode
  const currentLang = languages.find((l) => l.code === currentLangCode) || languages[0]

  const displayLang = mounted ? currentLang : languages[0]
  const displayLangCode = mounted ? currentLangCode : "en"

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem("app_lang", lng)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-1.5 bg-[#FAFAFA] border border-border/60 hover:border-[#FF4444] rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4444]/20 shrink-0">
          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-foreground" suppressHydrationWarning>{displayLang.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1.5 border-border/60 shadow-lg bg-white">
        {languages.map((lang) => {
          const isActive = displayLangCode === lang.code
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors focus:bg-[#FAFAFA] ${
                isActive 
                  ? "bg-[#FEF2F2] text-[#FF4444] font-bold focus:bg-[#FEF2F2]" 
                  : "text-foreground"
              }`}
            >
              {lang.label}
              {isActive && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
