import Link from "next/link"
import { Button } from "@/components/ui/button"

import { Logo } from "@/components/ui/logo"
const footerLinks = {
  discovery: {
    title: "Discovery",
    links: [
      { label: "Categories", href: "/categories" },
      { label: "Nearby", href: "/nearby" },
      { label: "Top Rated", href: "/top-rated" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  business: {
    title: "Business",
    links: [
      { label: "Partner Login", href: "/partner/login" },
      { label: "List your Business", href: "/partner/register" },
    ],
  },
}

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Facebook", href: "#" },
]

export function DiscoverFooter() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Partner CTA */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Partner with us</p>
              <p className="text-sm font-medium text-foreground">Register your business to accept bookings.</p>
            </div>
            <Button variant="outline" size="sm">
              Become a Partner
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting you with the best local services in your area.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-medium text-foreground mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 HayBooking. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
