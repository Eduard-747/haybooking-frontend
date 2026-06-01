"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { usePartner } from "@/hooks/usePartner"
import { useAuth } from "@/components/auth/auth-provider"
import { Building2, User, Save, Loader2, Camera, Globe, Phone, Mail, Bell, Key, LogOut, Copy } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export default function SettingsPage() {
  const { partner, partnerId, loading: partnerLoading } = usePartner()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"business" | "user">("business")
  const [saving, setSaving] = useState(false)

  // Business settings form
  const [businessForm, setBusinessForm] = useState({
    businessName: "",
    businessType: "",
    publicDescription: "",
    slug: "",
    image: "",
    autoAcceptBookings: false,
    autoCompleteBookings: false,
    currency: "AMD",
  })

  // User settings form
  const [userForm, setUserForm] = useState({
    name: "",
    surname: "",
    phoneNumber: "",
    email: "",
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [savingPassword, setSavingPassword] = useState(false)

  // Load business data
  useEffect(() => {
    if (partner) {
      setBusinessForm({
        businessName: partner.businessName || "",
        businessType: partner.businessType || "",
        publicDescription: partner.publicDescription || "",
        slug: partner.slug || "",
        image: partner.image || "",
        autoAcceptBookings: partner.autoAcceptBookings || false,
        autoCompleteBookings: partner.autoCompleteBookings || false,
        currency: partner.currency || "AMD",
      })
    }
  }, [partner])

  // Load user data
  useEffect(() => {
    if (user) {
      api.get('/users/me').then(res => {
        const u = res.data
        setUserForm({
          name: u.name || "",
          surname: u.surname || "",
          phoneNumber: u.phoneNumber || "",
          email: u.email || "",
          emailNotifications: u.notificationPreferences?.email ?? true,
          smsNotifications: u.notificationPreferences?.sms ?? false,
          pushNotifications: u.notificationPreferences?.push ?? true,
        })
      }).catch(() => {})
    }
  }, [user])

  const handleBusinessSave = async () => {
    if (!partnerId) return
    setSaving(true)
    try {
      await api.put(`/partners/${partnerId}`, {
        businessName: businessForm.businessName,
        businessType: businessForm.businessType,
        publicDescription: businessForm.publicDescription,
        image: businessForm.image,
        autoAcceptBookings: businessForm.autoAcceptBookings,
        autoCompleteBookings: businessForm.autoCompleteBookings,
        currency: businessForm.currency,
      })
      toast.success("Business settings saved!")
    } catch {
      toast.error("Failed to save business settings")
    } finally {
      setSaving(false)
    }
  }

  const handleUserSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/me', {
        name: userForm.name,
        surname: userForm.surname,
        email: userForm.email,
        notificationPreferences: {
          email: userForm.emailNotifications,
          sms: userForm.smsNotifications,
          push: userForm.pushNotifications,
        }
      })
      toast.success("User settings saved!")
    } catch {
      toast.error("Failed to save user settings")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSavingPassword(true)
    try {
      await api.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success("Password changed successfully!")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setBusinessForm(prev => ({ ...prev, image: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const tabs = [
    { id: "business" as const, label: t("nav.business", "Business"), icon: Building2 },
    { id: "user" as const, label: t("nav.account", "Account"), icon: User },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/settings" />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t("nav.settings", "Settings")}</h1>
                <p className="text-muted-foreground mt-1">{t("dashboard.settingsDesc", "Manage your business and account settings.")}</p>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("nav.signOut", "Sign Out")}
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-white rounded-xl border border-border/60 mb-8 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#E5555E] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Business Settings Tab */}
            {activeTab === "business" && (
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-6">
                
                {/* Business Image */}
                <div className="flex items-start gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-2xl bg-[#F5EAEA] border-2 border-dashed border-[#C69C9B]/30 flex items-center justify-center overflow-hidden">
                      {businessForm.image ? (
                        <img src={businessForm.image} alt="Business" className="h-full w-full object-cover rounded-2xl" />
                      ) : (
                        <Building2 className="h-8 w-8 text-[#C69C9B]" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="h-5 w-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-foreground">Business Photo</h3>
                    <p className="text-sm text-muted-foreground">This image will be shown to clients on your public booking page.</p>
                  </div>
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("dashboard.businessName", "Business Name")}</label>
                  <input
                    type="text"
                    value={businessForm.businessName}
                    onChange={e => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                    placeholder="Your Business Name"
                  />
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Type</label>
                  <select
                    value={businessForm.businessType}
                    onChange={e => setBusinessForm(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                  >
                    <option value="">Select type</option>
                    <option value="salon">Salon & Spa</option>
                    <option value="medical">Medical Practice</option>
                    <option value="fitness">Fitness Studio</option>
                    <option value="consulting">Consulting Services</option>
                    <option value="restaurant">Restaurant & Dining</option>
                    <option value="auto">Auto Service</option>
                    <option value="pet">Pet Grooming</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Currency</label>
                  <select
                    value={businessForm.currency}
                    onChange={e => setBusinessForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                  >
                    <option value="AMD">AMD (֏)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="RUB">RUB (₽)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                {/* Public Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Public Description</label>
                  <textarea
                    value={businessForm.publicDescription}
                    onChange={e => setBusinessForm(prev => ({ ...prev, publicDescription: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E] resize-none"
                    placeholder="Describe your business to attract clients..."
                  />
                </div>

                {/* Business URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business URL</label>
                  <div 
                    onClick={async () => {
                      const url = `https://haybooking.com/b/${businessForm.slug}`;
                      try {
                        await navigator.clipboard.writeText(url);
                        toast.success("URL copied to clipboard!");
                      } catch (err) {
                        toast.error("Failed to copy URL");
                      }
                    }}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-border/60 bg-[#FAFAFA] hover:bg-[#FDF6F6] hover:border-[#E5555E]/30 cursor-pointer transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-1.5 bg-white rounded-md border border-border/50 shrink-0">
                        <Globe className="h-4 w-4 text-[#C69C9B]" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 break-all">
                        https://haybooking.com/b/{businessForm.slug}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-border/50 text-xs font-semibold text-muted-foreground group-hover:text-[#E5555E] group-hover:border-[#E5555E]/30 transition-all shadow-sm">
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This is your public booking page. Share this link directly with your clients.</p>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-5">
                  <h3 className="font-semibold text-foreground">Automation Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Auto-Accept Bookings</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatically confirm incoming booking requests.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBusinessForm(p => ({ ...p, autoAcceptBookings: !p.autoAcceptBookings }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        businessForm.autoAcceptBookings ? 'bg-[#E5555E]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        businessForm.autoAcceptBookings ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Auto-Complete Bookings</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatically mark confirmed bookings as completed when their time is over.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBusinessForm(p => ({ ...p, autoCompleteBookings: !p.autoCompleteBookings }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        businessForm.autoCompleteBookings ? 'bg-[#E5555E]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        businessForm.autoCompleteBookings ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={handleBusinessSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E5555E] hover:bg-[#d44850] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t("dashboard.saveChanges", "Save Changes")}
                  </button>
                </div>
              </div>
            )}

            {/* User Settings Tab */}
            {activeTab === "user" && (
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-6">
                
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-[#C69C9B]" />
                  Personal Information
                </h3>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">First Name</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    <input
                      type="text"
                      value={userForm.surname}
                      onChange={e => setUserForm(prev => ({ ...prev, surname: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userForm.phoneNumber}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-gray-50 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Phone number cannot be changed after registration.</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Notifications */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#C69C9B]" />
                    Notification Preferences
                  </h3>

                  {[
                    { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive booking confirmations and updates via email" },
                    { key: "smsNotifications" as const, label: "SMS Notifications", desc: "Get text messages for booking reminders" },
                    { key: "pushNotifications" as const, label: "Push Notifications", desc: "Browser push notifications for real-time alerts" },
                  ].map(pref => (
                    <label key={pref.key} className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-foreground">{pref.label}</p>
                        <p className="text-xs text-muted-foreground">{pref.desc}</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={userForm[pref.key]}
                          onChange={e => setUserForm(prev => ({ ...prev, [pref.key]: e.target.checked }))}
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${userForm[pref.key] ? 'bg-[#E5555E]' : 'bg-gray-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-1 ${userForm[pref.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={handleUserSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E5555E] hover:bg-[#d44850] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t("dashboard.saveChanges", "Save Changes")}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "user" && (
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-6 mt-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#C69C9B]" />
                  Change Password
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={handlePasswordSave}
                    disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Update Password
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
