import { RoleGuard } from "@/components/auth/role-guard"
import { BranchProvider } from "@/components/dashboard/branch-context"
import { MobileNavProvider } from "@/components/mobile-nav-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="partner">
      <BranchProvider>
        <MobileNavProvider>
          {children}
        </MobileNavProvider>
      </BranchProvider>
    </RoleGuard>
  )
}
