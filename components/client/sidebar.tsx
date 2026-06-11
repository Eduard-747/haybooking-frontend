"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Compass, Calendar, Heart, Settings, LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useMobileNav } from "@/components/mobile-nav-context"

import { Logo } from "@/components/ui/logo"
import { useTranslation } from "react-i18next"

function SidebarContent() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { setIsOpen } = useMobileNav()

  const navItems = [
    { name: t("nav.discover", "Discover"), href: "/client/discover", icon: Compass },
    { name: t("nav.myBookings", "My Bookings"), href: "/client/bookings", icon: Calendar },
    { name: t("nav.favorites", "Favorites"), href: "/client/favorites", icon: Heart },
    { name: t("nav.settings", "Settings"), href: "/client/settings", icon: Settings },
  ]

  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#FDF6F6] text-[#E5555E] border-l-2 border-[#E5555E] -ml-[2px] pl-[14px]"
                  : "text-muted-foreground hover:bg-[#FAFAFA] hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          )
        })}
        <button
          onClick={() => {
            setIsOpen(false)
            logout()
            router.push('/auth')
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {t("auth.signOut", "Sign Out")}
        </button>
      </nav>

      {/* Footer CTA */}
      <div className="p-4 mx-3 mb-6 border border-border/60 rounded-xl bg-[#FAFAFA] shrink-0">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">{t("landing.partnerWithUs", "Partner with us")}</p>
        <p className="text-xs text-foreground font-medium mb-3">{t("landing.registerBusinessDesc", "Register your business to accept bookings.")}</p>
        <Link 
          href="/auth?tab=signup"
          onClick={() => setIsOpen(false)}
          className="block w-full text-center px-4 py-2 bg-white border border-border rounded-lg text-xs font-semibold text-[#C69C9B] hover:bg-[#FDF6F6] transition-colors"
        >
          {t("landing.becomePartner", "Become a Partner")}
        </Link>
      </div>
    </>
  )
}

export function ClientSidebar() {
  const { isOpen, setIsOpen } = useMobileNav()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 min-h-screen bg-white border-r border-border/40 flex-col hidden lg:flex sticky top-0 h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
