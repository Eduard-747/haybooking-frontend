"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Calendar, Clock, Check, X, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const pendingRequests = [
  {
    id: "1",
    clientName: "Isabella Garcia",
    clientImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    service: "HydraFacial Premium",
    date: "Oct 19, Sat",
    time: "11:00 AM",
  },
  {
    id: "2",
    clientName: "Daniel Craig",
    clientImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    service: "Beard Trim & Sculpt",
    date: "Oct 20, Sun",
    time: "02:30 PM",
  },
  {
    id: "3",
    clientName: "Sarah Jenkins",
    clientImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    service: "Laser Consultation",
    date: "Oct 19, Sat",
    time: "09:15 AM",
  },
  {
    id: "4",
    clientName: "Kevin Peters",
    clientImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    service: "Kinesio Taping",
    date: "Oct 21, Mon",
    time: "04:00 PM",
  },
  {
    id: "5",
    clientName: "Linda Wu",
    clientImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    service: "Aromatherapy Massage",
    date: "Oct 20, Sun",
    time: "10:30 AM",
  },
]

export function CalendarSidebar({ isOpen, onToggle }: CalendarSidebarProps) {
  const [requests, setRequests] = useState(pendingRequests)

  const handleAccept = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id))
  }

  const handleDecline = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id))
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          absolute top-1/2 -translate-y-1/2 z-30
          h-10 w-6 rounded-l-md bg-background border border-r-0 border-border
          flex items-center justify-center
          hover:bg-muted transition-colors
          ${isOpen ? "right-[320px]" : "right-0"}
        `}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          w-[320px] border-l border-border bg-background flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Requests</h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {requests.length}
              </span>
            </div>
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              {/* Client Info */}
              <div className="flex items-start gap-3 mb-3">
                <Image
                  src={request.clientImage}
                  alt={request.clientName}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {request.clientName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {request.service}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{request.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{request.time}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                  onClick={() => handleAccept(request.id)}
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-destructive hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={() => handleDecline(request.id)}
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Optimization Tip */}
        <div className="p-4 m-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Optimization Tip</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"You have a 2-hour gap on Wednesday. Would you like to offer a 'Last Minute' discount to fill it?"}
              </p>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-2">
                Optimize Calendar
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
