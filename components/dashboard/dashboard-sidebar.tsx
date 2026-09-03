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
import { usePartner } from "@/hooks/usePartner"

interface DashboardSidebarProps {
  activePath?: string
}

function DrawerBranchSelector() {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranchContext()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const selectedBranch = branches?.find(b => b._id === selectedBranchId)
  const displayLabel = selectedBranch 
    ? (selectedBranch.name ? `${selectedBranch.name}, ${selectedBranch.address.city}` : `${selectedBranch.address.line1}, ${selectedBranch.address.city}`)
    : "Buzand 8, Yerevan"

  return (
    <div className="px-4 mb-4 relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#FFF0F0] hover:bg-[#FFE5E5] border border-[#FFE0E0] rounded-2xl p-2.5 transition-all text-left shadow-2xs group cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1">
          <div className="w-7 h-7 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 truncate">
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-4 right-4 mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedBranchId(null)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                !selectedBranchId ? "bg-[#FF3B30] text-white font-bold" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>{t("common.allBranches", "All Branches")}</span>
              {!selectedBranchId && <Check className="w-3.5 h-3.5" />}
            </button>

            {branches?.map(b => {
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
                    isSelected ? "bg-[#FF3B30] text-white font-bold" : "hover:bg-slate-50 text-slate-700"
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
  const { partner } = usePartner()

  const initials = partner?.businessName
    ? partner.businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : "LB"

  const navItems = isRestaurant ? [
    { label: t("nav.dashboard", "Dashboard"), href: "/dashboard", icon: Home },
    { label: t("nav.floorPlan", "Floor Plan"), href: "/dashboard/restaurant/floor-plan", icon: Layers },
    { label: t("nav.tables", "Tables"), href: "/dashboard/restaurant/tables", icon: Grid },
    { label: t("nav.reservations", "Reservations"), href: "/dashboard/restaurant/reservations", icon: List },
    { label: t("nav.menu", "Menu"), href: "/dashboard/restaurant/menu", icon: Utensils },
    { label: t("nav.gallery", "Gallery"), href: "/dashboard/restaurant/gallery", icon: Image },
    { label: t("nav.branches", "Branches"), href: "/dashboard/branches", icon: MapPin },
    { label: t("nav.analytics", "Analytics"), href: "/dashboard/analytics", icon: BarChart3 },
    { label: t("nav.settings", "Settings"), href: "/dashboard/restaurant/settings", icon: Settings },
  ] : [
    { label: t("nav.dashboard", "Dashboard"), href: "/dashboard", icon: Home },
    { label: t("nav.calendar", "Calendar"), href: "/dashboard/calendar", icon: Calendar },
    { label: t("nav.createBooking", "Create Booking"), href: "/dashboard/book", icon: PlusCircle },
    { label: t("nav.services", "Manage Services"), href: "/dashboard/services", icon: Store },
    { label: t("nav.branches", "Branches"), href: "/dashboard/branches", icon: MapPin },
    { label: t("nav.specialists", "Specialists"), href: "/dashboard/specialists", icon: Users },
    { label: t("nav.analytics", "Analytics"), href: "/dashboard/analytics", icon: BarChart3 },
    { label: t("nav.settings", "Settings"), href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Logo />
        </Link>
      </div>

      {/* Custom Branch Selector */}
      <DrawerBranchSelector />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href + "/"))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                    isActive
                      ? "bg-[#FFF0F0] text-[#FF3B30] font-bold border-l-4 border-[#FF3B30] pl-2.5"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-[#FF3B30]" : "text-slate-400 group-hover:text-slate-600")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Profile Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#FFEAEA] text-[#FF3B30] font-extrabold text-xs flex items-center justify-center shrink-0 border border-rose-100">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {partner?.businessName || "La Bohem"}
              </h4>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                {t("dashboard.administrator", "Administrator")}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ activePath }: DashboardSidebarProps) {
  const { isOpen, setIsOpen } = useMobileNav()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-100 bg-white shrink-0 h-screen sticky top-0">
        <SidebarContent activePath={activePath} />
      </aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
