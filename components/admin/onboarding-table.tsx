"use client"

import { useState } from "react"
import Link from "next/link"
import { Filter, MoreVertical, Eye, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Application {
  id: string
  businessName: string
  businessType: string
  submittedDate: string
  contactName: string
  contactEmail: string
  status: "Pending" | "Approved" | "Rejected"
}

const applications: Application[] = [
  {
    id: "HB-99283-RE",
    businessName: "The Rusty Haystack",
    businessType: "Boutique Hotel",
    submittedDate: "Oct 24, 2023",
    contactName: "Sarah Jenkins",
    contactEmail: "sarah.j@rustyhaystack.com",
    status: "Pending",
  },
  {
    id: "HB-99284-GF",
    businessName: "Golden Fields Resort",
    businessType: "Luxury Spa",
    submittedDate: "Oct 23, 2023",
    contactName: "Michael Chen",
    contactEmail: "m.chen@goldenfields.resort",
    status: "Pending",
  },
  {
    id: "HB-99285-AM",
    businessName: "Alpine Meadows Lodge",
    businessType: "Mountain Retreat",
    submittedDate: "Oct 22, 2023",
    contactName: "Elena Rodriguez",
    contactEmail: "elena@alpine-meadows.com",
    status: "Approved",
  },
  {
    id: "HB-99286-UO",
    businessName: "Urban Oasis Suites",
    businessType: "City Apartment",
    submittedDate: "Oct 21, 2023",
    contactName: "David Thompson",
    contactEmail: "david@urbanoasis.io",
    status: "Rejected",
  },
  {
    id: "HB-99287-LS",
    businessName: "Lakeside Serenity Inn",
    businessType: "Bed & Breakfast",
    submittedDate: "Oct 20, 2023",
    contactName: "Martha Stewart",
    contactEmail: "martha@lakeside-inn.net",
    status: "Pending",
  },
]

export function OnboardingTable() {
  const [currentPage, setCurrentPage] = useState(1)

  const getStatusBadge = (status: Application["status"]) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700",
      Approved: "bg-emerald-100 text-emerald-700",
      Rejected: "bg-red-100 text-red-600",
    }

    return (
      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Pending Registrations</h2>
          <span className="px-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-full">
            Showing 5 of 12 requests
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Business Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Person
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{app.businessName}</p>
                    <p className="text-sm text-muted-foreground">{app.businessType}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {app.submittedDate}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{app.contactName}</p>
                    <p className="text-sm text-muted-foreground">{app.contactEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(app.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/onboarding/${app.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/onboarding/${app.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/admin/onboarding/${app.id}`}
            className="block p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-medium text-foreground">{app.businessName}</p>
                <p className="text-sm text-muted-foreground">{app.businessType}</p>
              </div>
              {getStatusBadge(app.status)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{app.contactName}</span>
              <span className="text-muted-foreground">{app.submittedDate}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">1-5</span> of{" "}
          <span className="font-medium text-foreground">12</span> results
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`w-9 ${currentPage === page ? "bg-muted text-foreground border-border" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
