import { CalendarCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Logo } from "@/components/ui/logo"
export function AuthBranding() {
  return (
    <aside className="hidden lg:w-[55%] flex-col bg-slate-50 lg:flex border-l border-border/40 relative overflow-hidden">
      {/* Background decorative blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5555E]/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C69C9B]/10 blur-3xl" />

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center px-12 relative z-10">
        {/* Image */}
        <div className="relative mb-12 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/50">
          <Image
            src="/auth-booking.png"
            alt="Professional calendar and booking management interface"
            width={800}
            height={800}
            className="h-auto w-full object-cover hover:scale-[1.02] transition-transform duration-700"
            priority
          />
        </div>

        {/* Tagline */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Intelligent scheduling for your business.
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">
            Join thousands of professionals who manage their appointments, clients, and time with elegance and ease.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-6 text-sm text-muted-foreground">
        <span>&copy; 2024 HayBooking Inc.</span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
            EN
          </span>
          English (US)
        </span>
      </div>
    </aside>
  )
}
