"use client"

import Link from "next/link"
import { Twitter, Instagram, Facebook } from "lucide-react"

import { Logo } from "@/components/ui/logo"
import { useTranslation } from "react-i18next"
import { ProductLinks } from "./product-links"
import { SupportLinks } from "./support-links"
import { LegalLinks } from "./legal-links"
import { CompanyLinks } from "./company-links"

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-[#FAFAFA] pt-16 pb-8 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("landing.footerDesc")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">{t("landing.product")}</h4>
            <ProductLinks />
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">{t("landing.support")}</h4>
            <SupportLinks />
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">{t("landing.legal", "Legal")}</h4>
            <LegalLinks />
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">{t("landing.company")}</h4>
            <CompanyLinks />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t("landing.copyright")}
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="#" className="hover:text-foreground"><Twitter className="h-4 w-4" /></Link>
            <Link href="#" className="hover:text-foreground"><Instagram className="h-4 w-4" /></Link>
            <Link href="#" className="hover:text-foreground"><Facebook className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
