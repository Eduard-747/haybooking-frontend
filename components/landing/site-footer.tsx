"use client"

import Link from "next/link"
import { Twitter, Instagram, Facebook } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/ui/logo"
import { ProductLinks } from "./product-links"
import { SupportLinks } from "./support-links"
import { LegalLinks } from "./legal-links"
import { CompanyLinks } from "./company-links"

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-white pt-14 pb-8 border-t border-slate-100/90 shadow-2xs">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12 mb-14">
          
          {/* Brand Col */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 flex flex-col justify-between pr-0 lg:pr-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group transition-transform active:scale-98 mb-4">
                <Logo width={200} height={56} className="h-10 sm:h-12 md:h-13 w-auto" />
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-sm">
                {t("landing.footerDesc", "Simplifying appointments for busy people. Find, book, and enjoy your local services with ease.")}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2.5">
              <Link href="#" aria-label="Twitter" className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#FF385C] hover:border-[#FF385C]/30 hover:bg-[#FFF0F3]/60 transition-all shadow-2xs active:scale-95">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Instagram" className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#FF385C] hover:border-[#FF385C]/30 hover:bg-[#FFF0F3]/60 transition-all shadow-2xs active:scale-95">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Facebook" className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#FF385C] hover:border-[#FF385C]/30 hover:bg-[#FFF0F3]/60 transition-all shadow-2xs active:scale-95">
                <Facebook className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C]"></span>
              {t("landing.product", "Product")}
            </h4>
            <ProductLinks />
          </div>

          {/* Support */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C]"></span>
              {t("landing.support", "Support")}
            </h4>
            <SupportLinks />
          </div>

          {/* Legal */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C]"></span>
              {t("landing.legal", "Legal")}
            </h4>
            <LegalLinks />
          </div>

          {/* Company */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF385C]"></span>
              {t("landing.company", "Company")}
            </h4>
            <CompanyLinks />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-500">
            {t("landing.copyright", "© 2026 HayBooking Technologies Inc. All rights reserved.")}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>Yerevan, Armenia</span>
            <span>•</span>
            <span className="text-[#FF385C]">HayBooking Platform</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
