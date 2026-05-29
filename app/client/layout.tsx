import { ClientSidebar } from "@/components/client/sidebar"
import { ClientTopHeader } from "@/components/client/top-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { FavoritesProvider } from "@/components/client/favorites-context"
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FavoritesProvider>
      <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
        <ClientSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <ClientTopHeader />
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </div>
    </FavoritesProvider>
  )
}
