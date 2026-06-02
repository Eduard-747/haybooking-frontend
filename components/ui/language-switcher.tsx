"use client"

import React from "react"
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

  const currentLangCode = (i18n.language || "en").substring(0, 2)
  const currentLang = languages.find((l) => l.code === currentLangCode) || languages[0]

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem("app_lang", lng)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] border border-border/60 hover:border-[#C69C9B] rounded-xl text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C69C9B]/20">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{currentLang.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1.5 border-border/60 shadow-lg bg-white">
        {languages.map((lang) => {
          const isActive = currentLangCode === lang.code
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors focus:bg-[#FAFAFA] ${
                isActive 
                  ? "bg-[#FDF6F6] text-[#C69C9B] font-bold focus:bg-[#FDF6F6]" 
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
