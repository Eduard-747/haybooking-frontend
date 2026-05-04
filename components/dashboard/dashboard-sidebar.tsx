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
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Services", href: "/dashboard/services", icon: Store },
  { label: "Branches", href: "/dashboard/branches", icon: MapPin },
  { label: "Specialists", href: "/dashboard/specialists", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

interface DashboardSidebarProps {
  activePath?: string
}

export function DashboardSidebar({ activePath }: DashboardSidebarProps) {
  const pathname = usePathname()
  const currentPath = activePath || pathname

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-background">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-primary">HayBooking</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[14px]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
