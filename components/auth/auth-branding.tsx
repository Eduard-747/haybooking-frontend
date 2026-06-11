"use client"

import Image from "next/image"
import { useTranslation } from "react-i18next"

import { LanguageSwitcher } from "@/components/ui/language-switcher"

export function AuthBranding() {
  return (
    <aside className="hidden lg:w-[55%] lg:flex relative overflow-hidden min-h-screen sticky top-0 h-screen">
      {/* Full-size Image filling the entire right panel edge-to-edge */}
      <Image
        src="/auth-booking.png"
        alt="Professional calendar and booking management interface"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay gradient at left for seamless blend with white panel */}
      <div className="absolute inset-y-0 left-0 w-2/3 lg:w-1/2 bg-gradient-to-r from-white via-white/70 to-transparent pointer-events-none z-10" />

      {/* Overlay gradient at bottom for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Floating Footer over the image */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 text-sm text-white z-20">
        <span className="font-semibold drop-shadow-md">&copy; 2026 Haybooking Inc.</span>
        <div className="shadow-lg rounded-xl overflow-hidden">
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  )
}
