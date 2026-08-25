"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePartner } from "@/hooks/usePartner"
import api from "@/lib/api"
import { format, formatDistanceToNow } from "date-fns"
import { hy, ru, enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export function NotificationsPopover() {
  const { t, i18n } = useTranslation()
  const { partnerId } = usePartner()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const dateLocale = i18n.language === 'am' || i18n.language === 'hy' ? hy : i18n.language === 'ru' ? ru : enUS

  const fetchNotifications = useCallback(async () => {
    if (!partnerId) return
    try {
      const res = await api.get(`/notifications?partnerId=${partnerId}`)
      setNotifications(res.data)
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }, [partnerId])

  // Fetch on mount and when popover opens
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  const markAsRead = async (id: string) => {
    if (!partnerId) return
    try {
      await api.patch(`/notifications/${id}/read?partnerId=${partnerId}`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  const markAllAsRead = async () => {
    if (!partnerId) return
    try {
      await api.patch(`/notifications/read-all?partnerId=${partnerId}`)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error("Failed to mark all as read", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getTranslatedTitle = (title: string) => {
    switch (title) {
      case "New Booking Received": return t("dashboard.newBookingReceived", { defaultValue: "New Booking Received" })
      case "Reservation Submitted": return t("dashboard.reservationSubmitted", { defaultValue: "Reservation Submitted" })
      case "Reservation Confirmed": return t("dashboard.reservationConfirmed", { defaultValue: "Reservation Confirmed" })
      case "Reservation Updated": return t("dashboard.reservationUpdated", { defaultValue: "Reservation Updated" })
      case "Booking Accepted": return t("dashboard.bookingAccepted", { defaultValue: "Booking Accepted" })
      case "Booking Completed": return t("dashboard.bookingCompleted", { defaultValue: "Booking Completed" })
      case "Booking Declined": return t("dashboard.bookingDeclined", { defaultValue: "Booking Declined" })
      case "Booking Cancelled": return t("dashboard.bookingCancelled", { defaultValue: "Booking Cancelled" })
      case "Booking Submitted": return t("dashboard.bookingSubmitted", { defaultValue: "Booking Submitted" })
      default: return title
    }
  }

  const getTranslatedMessage = (msg: string) => {
    if (!msg) return ""

    if (msg === "A client has requested a new appointment.") {
      return t("dashboard.clientRequestedNew", { defaultValue: "A client has requested a new appointment." })
    }
    if (msg === "Your reservation has been submitted to the restaurant and is pending confirmation.") {
      return t("dashboard.reservationPendingConfirmation", { defaultValue: "Your reservation has been submitted to the restaurant and is pending confirmation." })
    }
    if (msg === "Your table reservation has been confirmed!") {
      return t("dashboard.tableReservationConfirmed", { defaultValue: "Your table reservation has been confirmed!" })
    }
    if (msg === "Your table reservation details have been updated.") {
      return t("dashboard.tableReservationUpdated", { defaultValue: "Your table reservation details have been updated." })
    }
    if (msg === "Your appointment request has been submitted.") {
      return t("dashboard.appointmentSubmittedMsg", { defaultValue: "Your appointment request has been submitted." })
    }
    if (msg === "Your booking has been marked as completed. Thank you!") {
      return t("dashboard.bookingCompletedMsg", { defaultValue: "Your booking has been marked as completed. Thank you!" })
    }
    if (msg === "Your booking has been accepted by the business.") {
      return t("dashboard.bookingAcceptedMsg", { defaultValue: "Your booking has been accepted by the business." })
    }
    if (msg === "Your booking has been declined by the business.") {
      return t("dashboard.bookingDeclinedMsg", { defaultValue: "Your booking has been declined by the business." })
    }
    if (msg === "Your booking has been cancelled.") {
      return t("dashboard.bookingCancelledMsg", { defaultValue: "Your booking has been cancelled." })
    }
    if (msg.includes("has cancelled their appointment.")) {
      const name = msg.split(" ")[0]
      return t("dashboard.userCancelledAppointment", { name, defaultValue: "{{name}} has cancelled their appointment." })
    }
    if (msg.toLowerCase().includes("a new reservation request has been submitted for")) {
      const rawDateStr = msg.replace(/.*a new reservation request has been submitted for/i, "").trim().replace(/\.$/, "")
      const cleanDateStr = rawDateStr.replace(/\s*\([^)]*\)/g, "").trim()
      let formattedDate = rawDateStr
      try {
        let d: Date
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(cleanDateStr)) {
          const parts = cleanDateStr.split('.')
          d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
        } else {
          d = new Date(cleanDateStr)
        }
        if (!isNaN(d.getTime())) {
          formattedDate = (i18n.language === 'am' || i18n.language === 'hy')
            ? format(d, "dd.MM.yyyy")
            : format(d, "MMM d, yyyy", { locale: dateLocale })
        }
      } catch {}
      return t("dashboard.newReservationSubmittedFor", { date: formattedDate, defaultValue: "A new reservation request has been submitted for {{date}}." })
    }

    return msg
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors relative outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-[#FF4444] text-white rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2 border-border/40 shadow-xl rounded-xl overflow-hidden" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-[#FAFAFA]">
          <h4 className="font-semibold text-sm text-foreground">{t("dashboard.notifications", "Notifications")}</h4>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-[#FF4444] hover:text-foreground font-medium transition-colors"
            >
              {t("dashboard.markAllRead", "Mark all read")}
            </button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{t("dashboard.noNotifications", "No notifications yet")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.allCaughtUp", "You're all caught up!")}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n._id}
                  className={`p-4 border-b border-border/40 last:border-0 transition-colors cursor-pointer hover:bg-muted/30 ${!n.read ? 'bg-[#FF4444]/5' : ''}`}
                  onClick={() => !n.read && markAsRead(n._id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {!n.read ? (
                        <span className="h-2 w-2 rounded-full bg-[#FF4444] block mt-1.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                        {getTranslatedTitle(n.title)}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {getTranslatedMessage(n.message)}
                      </p>
                      <div className="flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground/80">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
