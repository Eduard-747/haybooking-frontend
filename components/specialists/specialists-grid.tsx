"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditSpecialistModal } from "./edit-specialist-modal"

interface Specialist {
  id: string
  name: string
  avatar: string
  locations: string[]
  services: string[]
}

const specialists: Specialist[] = [
  {
    id: "1",
    name: "Marcus Thorne",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    locations: ["DOWNTOWN", "WEST END"],
    services: ["Master Stylist", "Haircut", "Beard Trim"],
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    locations: ["WEST END"],
    services: ["Color Specialist", "Balayage"],
  },
  {
    id: "3",
    name: "Julian Smet",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    locations: ["DOWNTOWN", "NORTH SIDE"],
    services: ["Barbering", "Shave"],
  },
  {
    id: "4",
    name: "Sophia Chen",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    locations: ["HARBOR", "DOWNTOWN"],
    services: ["Nail Artist", "Manicure"],
  },
  {
    id: "5",
    name: "Oliver Vance",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    locations: ["NORTH SIDE"],
    services: ["Skin Therapy", "Facial"],
  },
  {
    id: "6",
    name: "Aria Montgomery",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    locations: ["WEST END", "HARBOR"],
    services: ["Massage", "Aromatherapy"],
  },
]

interface SpecialistsGridProps {
  searchQuery: string
}

export function SpecialistsGrid({ searchQuery }: SpecialistsGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null)

  const handleAddSpecialist = () => {
    setSelectedSpecialist(null)
    setEditModalOpen(true)
  }

  const filteredSpecialists = specialists.filter((specialist) =>
    specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    specialist.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Active Specialists ({filteredSpecialists.length})
        </h2>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
          View all activity
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredSpecialists.map((specialist) => (
          <div
            key={specialist.id}
            className="bg-background border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
          >
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border">
                <Image
                  src={specialist.avatar}
                  alt={specialist.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name */}
            <h3 className="text-center font-semibold text-foreground mb-3">
              {specialist.name}
            </h3>

            {/* Location Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {specialist.locations.map((location) => (
                <span
                  key={location}
                  className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md"
                >
                  {location}
                </span>
              ))}
            </div>

            {/* Service Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {specialist.services.map((service) => (
                <span
                  key={service}
                  className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button 
          onClick={handleAddSpecialist}
          className="border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 hover:bg-muted/50 transition-all group min-h-[250px] flex flex-col items-center justify-center"
        >
          <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Register New Staff</h3>
          <p className="text-sm text-muted-foreground">Setup profile and assign services</p>
        </button>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center gap-4 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {filteredSpecialists.length} of 24 specialists
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>

          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
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
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact Support</a>
          <span className="text-muted-foreground/60">
            &copy; 2026 HayBooking Staff Management. All rights reserved.
          </span>
        </div>
      </div>

      {/* Edit/Add Specialist Modal */}
      <EditSpecialistModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        specialist={selectedSpecialist ? {
          id: selectedSpecialist.id,
          name: selectedSpecialist.name,
          branches: selectedSpecialist.locations,
          services: selectedSpecialist.services,
        } : undefined}
      />
    </div>
  )
}
