"use client"

import Image from "next/image"
import { Calendar, ChevronRight, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  time: string
  customerName: string
  customerImage: string
  service: string
  specialist: string
  status: "completed" | "confirmed" | "pending"
  isHighlighted?: boolean
}

const timelineData: TimelineItem[] = [
  {
    id: "1",
    time: "09:00 AM",
    customerName: "Alexandria Smith",
    customerImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    service: "Signature Haircut",
    specialist: "Marco Rossi",
    status: "completed",
  },
  {
    id: "2",
    time: "10:30 AM",
    customerName: "Benjamin Carter",
    customerImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    service: "Luxury Beard Grooming",
    specialist: "Sonia V.",
    status: "completed",
  },
  {
    id: "3",
    time: "11:45 AM",
    customerName: "Diana Prince",
    customerImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    service: "Color Correction",
    specialist: "Marco Rossi",
    status: "confirmed",
    isHighlighted: true,
  },
  {
    id: "4",
    time: "01:30 PM",
    customerName: "Ethan Hunt",
    customerImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    service: "Deep Tissue Massage",
    specialist: "Dr. Miller",
    status: "confirmed",
    isHighlighted: true,
  },
  {
    id: "5",
    time: "03:00 PM",
    customerName: "Fiona Gallagher",
    customerImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    service: "HydraFacial Deluxe",
    specialist: "Sarah J.",
    status: "pending",
  },
]

function StatusBadge({ status }: { status: TimelineItem["status"] }) {
  const styles = {
    completed: "bg-muted text-muted-foreground",
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
  }

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        styles[status]
      )}
    >
      {status}
    </span>
  )
}

export function TodayTimeline() {
  return (
    <div className="bg-background border border-border rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
            <Calendar className="h-5 w-5 text-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Today&apos;s Timeline
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">Tuesday, Oct 24</span>
      </div>

      {/* Timeline Items */}
      <div className="divide-y divide-border">
        {timelineData.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
              item.isHighlighted && "bg-primary/5 border-l-2 border-primary"
            )}
          >
            {/* Time */}
            <div className="w-16 md:w-20 flex-shrink-0">
              <span className="text-sm text-muted-foreground">{item.time}</span>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={item.customerImage}
                  alt={item.customerName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.customerName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.service}
                  <span className="hidden sm:inline">
                    {" "}
                    &middot; with {item.specialist}
                  </span>
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusBadge status={item.status} />
              <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto">
          View full agenda
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
