import Link from "next/link"
import { Twitter, Instagram, Facebook } from "lucide-react"

import { Logo } from "@/components/ui/logo"
export function SiteFooter() {
  return (
    <footer className="w-full bg-[#FAFAFA] pt-16 pb-8 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Simplifying appointments for busy people. Find, book, and enjoy your local services with ease.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">For Customers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">For Businesses</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Mobile App</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Partner Program</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Safety Center</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Press</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 HayBooking Technologies Inc. All rights reserved.
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
