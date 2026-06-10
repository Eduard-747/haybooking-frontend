import { ClientSidebar } from "@/components/client/sidebar"
import { ClientTopHeader } from "@/components/client/top-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { FavoritesProvider } from "@/components/client/favorites-context"
import { MobileNavProvider } from "@/components/mobile-nav-context"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FavoritesProvider>
      <MobileNavProvider>
        <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
          <ClientSidebar />
          <div className="flex-1 flex flex-col min-w-0">
          <ClientTopHeader />
          <main className="flex-1">
            {children}
          </main>
          </div>
        </div>
      </MobileNavProvider>
    </FavoritesProvider>
  )
}
