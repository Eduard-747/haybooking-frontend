"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/components/auth/auth-provider"
import api from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
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

export function ClientNotificationsPopover() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const dateLocale = i18n.language === 'am' ? hy : i18n.language === 'ru' ? ru : enUS

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get(`/notifications/user`)
      setNotifications(res.data)
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }, [user])

  // Fetch on mount and when popover opens
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user, fetchNotifications])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  const markAsRead = async (id: string) => {
    if (!user) return
    try {
      await api.patch(`/notifications/user/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    try {
      await api.patch(`/notifications/user/read-all`)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error("Failed to mark all as read", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getTranslatedTitle = (title: string) => {
    switch (title) {
      case "Booking Accepted": return t("client.bookingAccepted", "Booking Accepted");
      case "Booking Completed": return t("client.bookingCompleted", "Booking Completed");
      case "Booking Declined": return t("client.bookingDeclined", "Booking Declined");
      case "Booking Cancelled": return t("client.bookingCancelled", "Booking Cancelled");
      default: return t(title, title);
    }
  }

  const getTranslatedMessage = (msg: string) => {
    if (msg.includes("has been accepted")) {
      return t("client.bookingAcceptedMsg", "Your booking has been accepted by the business.");
    }
    if (msg.includes("has been marked as completed")) {
      return t("client.bookingCompletedMsg", "Your booking has been marked as completed. Thank you!");
    }
    if (msg.includes("has been declined")) {
      return t("client.bookingDeclinedMsg", "Your booking has been declined by the business.");
    }
    if (msg.includes("has been cancelled")) {
      return t("client.bookingCancelledMsg", "Your booking has been cancelled.");
    }
    return t(msg, msg);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2 relative outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 text-[10px] font-bold bg-[#E5555E] text-white rounded-full flex items-center justify-center">
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
              className="text-xs text-[#C69C9B] hover:text-foreground font-medium transition-colors"
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
                  className={`p-4 border-b border-border/40 last:border-0 transition-colors cursor-pointer hover:bg-muted/30 ${!n.read ? 'bg-[#C69C9B]/5' : ''}`}
                  onClick={() => !n.read && markAsRead(n._id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {!n.read ? (
                        <span className="h-2 w-2 rounded-full bg-[#C69C9B] block mt-1.5" />
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
