"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Compass, Calendar, Heart, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

import { Logo } from "@/components/ui/logo"
export function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const navItems = [
    { name: "Discover", href: "/client/discover", icon: Compass },
    { name: "My Bookings", href: "/client/bookings", icon: Calendar },
    { name: "Favorites", href: "/client/favorites", icon: Heart },
    { name: "Settings", href: "/client/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border/40 flex-col hidden lg:flex sticky top-0 h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
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
            logout()
            router.push('/auth')
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </nav>

      {/* Footer CTA */}
      <div className="p-4 m-4 border border-border/60 rounded-xl bg-[#FAFAFA] shrink-0">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Partner with us</p>
        <p className="text-xs text-foreground font-medium mb-3">Register your business to accept bookings.</p>
        <Link 
          href="/auth?tab=signup"
          className="block w-full text-center px-4 py-2 bg-white border border-border rounded-lg text-xs font-semibold text-[#C69C9B] hover:bg-[#FDF6F6] transition-colors"
        >
          Become a Partner
        </Link>
      </div>
    </aside>
  )
}
