"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  Store,
  MapPin,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/ui/logo"

interface DashboardSidebarProps {
  activePath?: string
}

export function DashboardSidebar({ activePath }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const currentPath = activePath || pathname

  const navItems = [
    { label: t("nav.dashboard", "Home"), href: "/dashboard", icon: Home },
    { label: t("nav.calendar", "Calendar"), href: "/dashboard/calendar", icon: Calendar },
    { label: t("nav.createBooking", "Create Booking"), href: "/dashboard/book", icon: PlusCircle },
    { label: t("nav.services", "Manage Services"), href: "/dashboard/services", icon: Store },
    { label: t("nav.branches", "Branches"), href: "/dashboard/branches", icon: MapPin },
    { label: t("nav.specialists", "Specialists"), href: "/dashboard/specialists", icon: Users },
    { label: t("nav.analytics", "Analytics"), href: "/dashboard/analytics", icon: BarChart3 },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-background">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href + "/"))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#FDF6F6] text-[#E5555E] border-l-2 border-[#E5555E] -ml-[2px] pl-[14px]"
                      : "text-muted-foreground hover:bg-[#FAFAFA] hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            currentPath === "/dashboard/settings"
              ? "bg-[#FDF6F6] text-[#E5555E]"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          {t("nav.settings", "Settings")}
        </Link>
      </div>
    </aside>
  )
}
