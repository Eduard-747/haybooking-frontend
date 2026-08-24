"use client"

import { useState } from "react"
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
  X,
  Layers,
  Grid,
  List,
  Utensils,
  Image,
  ChevronDown,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useMobileNav } from "@/components/mobile-nav-context"
import { useRestaurant } from "@/hooks/useRestaurant"

import { Logo } from "@/components/ui/logo"
import { useBranchContext } from "@/components/dashboard/branch-context"

interface DashboardSidebarProps {
  activePath?: string
}

function DrawerBranchSelector() {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranchContext()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (!branches || branches.length === 0) return null

  const selectedBranch = branches.find(b => b._id === selectedBranchId)
  const displayLabel = selectedBranch 
    ? (selectedBranch.name ? `${selectedBranch.name}, ${selectedBranch.address.city}` : `${selectedBranch.address.line1}, ${selectedBranch.address.city}`)
    : t("common.allBranches", "All Branches")

  return (
    <div className="px-5 mb-3 relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-red-50/60 hover:bg-red-50 border border-red-200/80 rounded-2xl p-2.5 transition-all text-left shadow-2xs group"
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <div className="w-6 h-6 rounded-lg bg-[#FF4444] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground truncate">
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-5 right-5 mt-1.5 bg-white rounded-2xl border border-gray-200/90 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedBranchId(null)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                !selectedBranchId ? "bg-[#FF4444] text-white font-bold" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span>{t("common.allBranches", "All Branches")}</span>
              {!selectedBranchId && <Check className="w-3.5 h-3.5" />}
            </button>

            {branches.map(b => {
              const isSelected = b._id === selectedBranchId
              const bLabel = b.name ? `${b.name}, ${b.address.city}` : `${b.address.line1}, ${b.address.city}`
              return (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => {
                    setSelectedBranchId(b._id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected ? "bg-[#FF4444] text-white font-bold" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="truncate pr-2">{bLabel}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function SidebarContent({ activePath }: { activePath?: string }) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { setIsOpen } = useMobileNav()
  const currentPath = activePath || pathname

  const { isRestaurant } = useRestaurant()

  const navItems = isRestaurant ? [
    { label: t("nav.dashboard", "Home"), href: "/dashboard", icon: Home },
    { label: t("nav.floorPlan", "Floor Plan"), href: "/dashboard/restaurant/floor-plan", icon: Layers },
    { label: t("nav.tables", "Tables"), href: "/dashboard/restaurant/tables", icon: Grid },
    { label: t("nav.reservations", "Reservations"), href: "/dashboard/restaurant/reservations", icon: List },
    { label: t("nav.menu", "Menu"), href: "/dashboard/restaurant/menu", icon: Utensils },
    { label: t("nav.gallery", "Gallery"), href: "/dashboard/restaurant/gallery", icon: Image },
    { label: t("nav.branches", "Branches"), href: "/dashboard/branches", icon: MapPin },
    { label: t("nav.analytics", "Analytics"), href: "/dashboard/analytics", icon: BarChart3 },
    { label: t("nav.settings", "Settings"), href: "/dashboard/restaurant/settings", icon: Settings },
  ] : [
    { label: t("nav.dashboard", "Home"), href: "/dashboard", icon: Home },
    { label: t("nav.calendar", "Calendar"), href: "/dashboard/calendar", icon: Calendar },
    { label: t("nav.createBooking", "Create Booking"), href: "/dashboard/book", icon: PlusCircle },
    { label: t("nav.services", "Manage Services"), href: "/dashboard/services", icon: Store },
    { label: t("nav.branches", "Branches"), href: "/dashboard/branches", icon: MapPin },
    { label: t("nav.specialists", "Specialists"), href: "/dashboard/specialists", icon: Users },
    { label: t("nav.analytics", "Analytics"), href: "/dashboard/analytics", icon: BarChart3 },
    { label: t("nav.settings", "Settings"), href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <>
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Logo />
        </Link>
      </div>

      {/* Custom Branch Selector Popover in Mobile Drawer */}
      <DrawerBranchSelector />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href + "/"))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#FEF2F2] text-[#FF4444] font-semibold border-l-2 border-[#FF4444] -ml-[2px] pl-[14px]"
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


    </>
  )
}

export function DashboardSidebar({ activePath }: DashboardSidebarProps) {
  const { isOpen, setIsOpen } = useMobileNav()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-background shrink-0">
        <SidebarContent activePath={activePath} />
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
          <aside className="absolute left-0 top-0 h-full w-72 bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent activePath={activePath} />
          </aside>
        </div>
      )}
    </>
  )
}
