"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Save, Settings2, Clock, Users, Calendar, ShieldAlert } from "lucide-react"

export default function RestaurantSettingsPage() {
  const { t, i18n } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    reservationDuration: 90,
    maxPartySize: 12,
    bookingLeadTime: 30, // days
    allowWalkIns: true,
    autoConfirm: false,
    vipRules: t("restaurant.settings.defaultVipRules", "Requires manager approval"),
    cancellationPolicy: t("restaurant.settings.defaultCancellationPolicy", "Please cancel at least 2 hours in advance.")
  })

  // Update default values when language switches
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      vipRules: t("restaurant.settings.defaultVipRules", "Requires manager approval"),
      cancellationPolicy: t("restaurant.settings.defaultCancellationPolicy", "Please cancel at least 2 hours in advance.")
    }))
  }, [i18n.language, t])

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 800))
      toast.success(t("restaurant.settings.saveSuccess", "Settings saved successfully"))
    } catch {
      toast.error(t("restaurant.settings.saveFailed", "Failed to save settings"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardSidebar activePath="/dashboard/restaurant/settings" />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("restaurant.settings.title", "Restaurant Settings")}</h1>
                <p className="text-muted-foreground mt-1">{t("restaurant.settings.subtitle", "Configure booking rules and operational preferences.")}</p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF4444] hover:bg-[#d44850] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? t("restaurant.settings.saving", "Saving...") : t("restaurant.settings.saveChanges", "Save Changes")}
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* General Booking Rules */}
              <div className="bg-white p-6 rounded-xl border border-border/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#FF4444] mb-4">
                  <Clock className="h-5 w-5" />
                  <h2 className="font-bold text-foreground">{t("restaurant.settings.timeAndDuration", "Time & Duration")}</h2>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{t("restaurant.settings.defaultDuration", "Default Reservation Duration (mins)")}</label>
                  <input 
                    type="number"
                    value={settings.reservationDuration}
                    onChange={e => handleChange('reservationDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-[#FAFAFA]"
                  />
                  <p className="text-xs text-muted-foreground">{t("restaurant.settings.defaultDurationDesc", "How long a table is booked for by default.")}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{t("restaurant.settings.maxAdvance", "Max Advance Booking (days)")}</label>
                  <input 
                    type="number"
                    value={settings.bookingLeadTime}
                    onChange={e => handleChange('bookingLeadTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-[#FAFAFA]"
                  />
                  <p className="text-xs text-muted-foreground">{t("restaurant.settings.maxAdvanceDesc", "How far in advance customers can book online.")}</p>
                </div>
              </div>

              {/* Party & Capacity Rules */}
              <div className="bg-white p-6 rounded-xl border border-border/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#FF4444] mb-4">
                  <Users className="h-5 w-5" />
                  <h2 className="font-bold text-foreground">{t("restaurant.settings.partyAndCapacity", "Party & Capacity")}</h2>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{t("restaurant.settings.maxPartySize", "Maximum Party Size")}</label>
                  <input 
                    type="number"
                    value={settings.maxPartySize}
                    onChange={e => handleChange('maxPartySize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-[#FAFAFA]"
                  />
                  <p className="text-xs text-muted-foreground">{t("restaurant.settings.maxPartyDesc", "Largest group allowed for online booking.")}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div>
                    <label className="text-sm font-semibold text-foreground block">{t("restaurant.settings.allowWalkIns", "Allow Walk-ins")}</label>
                    <p className="text-xs text-muted-foreground">{t("restaurant.settings.allowWalkInsDesc", "Enable the walk-in management flow.")}</p>
                  </div>
                  <button
                    onClick={() => handleChange('allowWalkIns', !settings.allowWalkIns)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowWalkIns ? 'bg-[#FF4444]' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allowWalkIns ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-[#ffffff] p-6 rounded-xl border border-border/60 shadow-sm space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 text-[#FF4444] mb-4">
                  <ShieldAlert className="h-5 w-5" />
                  <h2 className="font-bold text-foreground">{t("restaurant.settings.policiesAndAdvanced", "Policies & Advanced")}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-foreground block">{t("restaurant.settings.autoConfirm", "Auto-Confirm Reservations")}</label>
                        <p className="text-xs text-muted-foreground">{t("restaurant.settings.autoConfirmDesc", "Automatically confirm online bookings.")}</p>
                      </div>
                      <button
                        onClick={() => handleChange('autoConfirm', !settings.autoConfirm)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.autoConfirm ? 'bg-[#FF4444]' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoConfirm ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-semibold text-foreground">{t("restaurant.settings.vipRules", "VIP Rules")}</label>
                      <input 
                        type="text"
                        value={settings.vipRules}
                        onChange={e => handleChange('vipRules', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-[#FAFAFA]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t("restaurant.settings.cancellationPolicy", "Cancellation Policy")}</label>
                    <textarea 
                      value={settings.cancellationPolicy}
                      onChange={e => handleChange('cancellationPolicy', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-[#FAFAFA] resize-none h-24"
                      placeholder={t("restaurant.settings.cancellationPlaceholder", "Enter cancellation policy displayed to customers...")}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
