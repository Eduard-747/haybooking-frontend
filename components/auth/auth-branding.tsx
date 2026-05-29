import { CalendarCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Logo } from "@/components/ui/logo"
export function AuthBranding() {
  return (
    <aside className="hidden w-1/2 flex-col bg-muted/30 lg:flex">
      {/* Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <Logo />
        </Link>
      </div>

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center px-12">
        {/* Image */}
        <div className="relative mb-10 w-full max-w-sm overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
            alt="Professional workspace with laptop and notebook"
            width={400}
            height={300}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Tagline */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Simplify your scheduling.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Join thousands of professionals who
            <br />
            manage their time with elegance and ease.
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
