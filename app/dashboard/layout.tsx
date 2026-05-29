import { RoleGuard } from "@/components/auth/role-guard"
import { BranchProvider } from "@/components/dashboard/branch-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="partner">
      <BranchProvider>
        {children}
      </BranchProvider>
    </RoleGuard>
  )
}
