"use client"

import { useState } from "react"
import { MapPin, Phone, Clock, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditBranchModal } from "./edit-branch-modal"

interface Branch {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  status: "open" | "closed"
  hours: string
  isActive: boolean
}

const branches: Branch[] = [
  {
    id: "1",
    name: "Downtown Central Hub",
    address: "124 Market Street, Suite 400",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    phone: "+1 (415) 555-0123",
    status: "open",
    hours: "09:00 AM - 08:00 PM",
    isActive: true,
  },
  {
    id: "2",
    name: "Mission District Branch",
    address: "890 Valencia St",
    city: "San Francisco",
    state: "CA",
    zip: "94110",
    phone: "+1 (415) 555-0198",
    status: "open",
    hours: "10:00 AM - 07:00 PM",
    isActive: true,
  },
  {
    id: "3",
    name: "SOMA Performance Studio",
    address: "345 Brannan St",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    phone: "+1 (415) 555-0144",
    status: "open",
    hours: "08:00 AM - 09:00 PM",
    isActive: true,
  },
  {
    id: "4",
    name: "Oakland Lakeside Center",
    address: "1550 Lakeside Dr",
    city: "Oakland",
    state: "CA",
    zip: "94612",
    phone: "+1 (510) 555-0177",
    status: "closed",
    hours: "09:00 AM - 06:00 PM",
    isActive: true,
  },
  {
    id: "5",
    name: "Palo Alto Tech Plaza",
    address: "220 University Ave",
    city: "Palo Alto",
    state: "CA",
    zip: "94301",
    phone: "+1 (650) 555-0155",
    status: "open",
    hours: "09:00 AM - 08:00 PM",
    isActive: true,
  },
]

interface BranchListProps {
  activeFilter: string
}

export function BranchList({ activeFilter }: BranchListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    setEditModalOpen(true)
  }

  const filteredBranches = branches.filter((branch) => {
    if (activeFilter === "active") return branch.isActive
    if (activeFilter === "draft") return !branch.isActive
    return true
  })

  return (
    <div className="space-y-4">
      {/* Branch Cards */}
      {filteredBranches.map((branch) => (
        <div
          key={branch.id}
          className="bg-background border border-border rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Location Icon */}
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Branch Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground">
                {branch.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {branch.address}, {branch.city}, {branch.state} {branch.zip}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{branch.phone}</span>
              </div>
            </div>

            {/* Status and Hours */}
            <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${branch.status === "open"
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {branch.status === "open" ? "Open Now" : "Closed"}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Today: {branch.hours}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => handleEditBranch(branch)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">1-10</span> of{" "}
          <span className="font-medium text-foreground">24</span> branches
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`w-9 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Branch Modal */}
      <EditBranchModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        branch={selectedBranch ? {
          id: selectedBranch.id,
          name: selectedBranch.name,
          address: selectedBranch.address,
          city: selectedBranch.city,
          zipCode: selectedBranch.zip,
          phone: selectedBranch.phone,
        } : undefined}
      />
    </div>
  )
}
