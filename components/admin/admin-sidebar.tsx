"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Monitor, Settings, LogOut } from "lucide-react"

const navItems = [
  {
    label: "Partner Onboarding",
    href: "/admin/onboarding",
    icon: LayoutGrid,
  },
  {
    label: "Global Bookings",
    href: "/admin/bookings",
    icon: Monitor,
  },
  {
    label: "App Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AdminSidebarProps {
  activePath?: string
}

export function AdminSidebar({ activePath }: AdminSidebarProps) {
  const pathname = usePathname()
  const currentPath = activePath || pathname

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-background">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin/onboarding" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-foreground">HayBooking Dashboard</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-border">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
