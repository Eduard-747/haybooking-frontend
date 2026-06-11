"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { User, Bell, Shield, LogOut, Save, Camera, X } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { RoleGuard } from "@/components/auth/role-guard"
import { useCountryCode } from "@/lib/hooks/use-country-code"
import { getPhonePlaceholder } from "@/lib/countries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user, logout, updateToken } = useAuth()
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    image: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [originalPhone, setOriginalPhone] = useState("")
  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    promotions: false,
    newMessages: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  
  // SMS Verification Modal State
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const { countryCode: detectedCountryCode, countryCodesList } = useCountryCode("+1")
  const [countryCode, setCountryCode] = useState("+1")

  useEffect(() => {
    setCountryCode(detectedCountryCode)
  }, [detectedCountryCode])

  // Load user profile from API to populate name, surname, email
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/profile')
        const profile = res.data
        setForm(prev => ({
          ...prev,
          name: profile.name || "",
          surname: profile.surname || "",
          email: profile.email || "",
          phone: profile.phoneNumber || user?.phoneNumber || "",
          image: profile.image || "",
        }))
        setOriginalPhone(profile.phoneNumber || user?.phoneNumber || "")
      } catch (err) {
        // Fallback to what we have in context
        setForm(prev => ({
          ...prev,
          phone: user?.phoneNumber || "",
        }))
        setOriginalPhone(user?.phoneNumber || "")
      }
    }
    if (user) loadProfile()
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("clientSettings.imageTooLarge", "Image must be smaller than 2MB"));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileData = async (shouldShowToast = true) => {
    try {
      await api.put('/users/me', {
        name: form.name,
        surname: form.surname,
        email: form.email,
        image: form.image,
      });

      if (form.newPassword) {
        await api.put('/users/me/password', {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
      }

      if (shouldShowToast) {
        toast.success(t("clientSettings.settingsSaved", "Settings saved successfully!"));
      }
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("clientSettings.failedToSave", "Failed to save profile"));
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error(t("clientSettings.passwordsDontMatch", "New passwords don't match"))
      return
    }
    
    setIsSaving(true)
    
    let phoneToSave = form.phone;
    if (!phoneToSave.startsWith('+')) {
      phoneToSave = `${countryCode}${phoneToSave.replace(/\D/g, '')}`;
    }

    if (phoneToSave !== originalPhone) {
      try {
        await api.post('/auth/send-sms', { phoneNumber: phoneToSave });
        setShowSmsModal(true);
        setIsSaving(false);
        return; // wait for modal
      } catch (err: any) {
        toast.error(err.response?.data?.message || t("clientSettings.failedToSendSms", "Failed to send SMS to new number"));
        setIsSaving(false);
        return;
      }
    }

    await saveProfileData();
    setIsSaving(false);
  }

  const handleVerifyPhoneAndSave = async () => {
    if (otpCode.length < 4) {
      toast.error(t("clientSettings.enterValidCode", "Please enter a valid code"));
      return;
    }
    setIsVerifying(true);
    try {
      let phoneToSave = form.phone;
      if (!phoneToSave.startsWith('+')) {
        phoneToSave = `${countryCode}${phoneToSave.replace(/\D/g, '')}`;
      }

      const res = await api.put('/users/me/phone', {
        phoneNumber: phoneToSave,
        code: otpCode,
      });
      // Context uses updateToken implicitly via login logic? Wait, AuthProvider has updateToken.
      // we need to destructure updateToken from useAuth
      const { user: updatedUser, access_token } = res.data;
      updateToken(access_token, updatedUser);
      
      setOriginalPhone(phoneToSave);
      
      // Save the rest of the profile
      const success = await saveProfileData(false);
      
      if (success) {
        toast.success(t("clientSettings.phoneVerified", "Phone verified and settings saved successfully!"));
        setShowSmsModal(false);
        setOtpCode("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("clientSettings.failedToVerify", "Failed to verify phone number"));
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <RoleGuard allowedRole="client">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">{t("clientSettings.accountSettings", "Account Settings")}</h1>
        <p className="text-muted-foreground mt-1">{t("clientSettings.manageProfile", "Manage your profile and preferences.")}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative group cursor-pointer h-12 w-12 rounded-full overflow-hidden border border-border shrink-0">
              {form.image ? (
                <img src={form.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#FDF6F6] flex items-center justify-center">
                  <User className="h-6 w-6 text-[#C69C9B]" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{t("clientSettings.personalInfo", "Personal Information")}</h2>
              <p className="text-xs text-muted-foreground">{t("clientSettings.updatePhotoName", "Update your photo, name and contact details")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("common.firstName", "First Name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Jane"
                className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("common.lastName", "Last Name")}</label>
              <input
                type="text"
                value={form.surname}
                onChange={e => setForm({...form, surname: e.target.value})}
                placeholder="Doe"
                className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("common.phone", "Phone Number")}</label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[110px] shrink-0 h-10 border-border/60 bg-[#FAFAFA] focus:ring-[#C69C9B]/20 focus:border-[#C69C9B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countryCodesList.map((cc) => (
                      <SelectItem key={`${cc.code}-${cc.country}`} value={cc.code}>
                        {cc.flag} {cc.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder={getPhonePlaceholder(countryCode, countryCodesList)}
                  className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("common.email", "Email Address")}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="jane.doe@example.com"
                className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-full bg-[#FDF6F6] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#C69C9B]" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{t("clientSettings.passwordTitle", "Password")}</h2>
              <p className="text-xs text-muted-foreground">{t("clientSettings.leaveBlank", "Leave blank to keep your current password")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("clientSettings.currentPassword", "Current Password")}</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={e => setForm({...form, currentPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("clientSettings.newPassword", "New Password")}</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={e => setForm({...form, newPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("clientSettings.confirmPassword", "Confirm Password")}</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-full bg-[#FDF6F6] flex items-center justify-center">
              <Bell className="h-5 w-5 text-[#C69C9B]" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{t("clientSettings.notificationsTitle", "Notifications")}</h2>
              <p className="text-xs text-muted-foreground">{t("clientSettings.chooseNotifications", "Choose what you'd like to be notified about")}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: "bookingReminders" as const, label: t("clientSettings.bookingReminders", "Booking Reminders"), desc: t("clientSettings.bookingRemindersDesc", "Get notified before your appointments") },
              { key: "promotions" as const, label: t("clientSettings.promotions", "Promotions & Deals"), desc: t("clientSettings.promotionsDesc", "Receive special offers from businesses") },
              { key: "newMessages" as const, label: t("clientSettings.newMessages", "New Messages"), desc: t("clientSettings.newMessagesDesc", "Be alerted when businesses message you") },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? "bg-[#C69C9B]" : "bg-border"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications[key] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#E5555E] hover:bg-[#D4444D] text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? t("common.saving", "Saving...") : t("clientSettings.saveChanges", "Save Changes")}
          </button>
        </div>
      </form>
      </div>

      {/* SMS Verification Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-[#FAFAFA]">
              <h2 className="text-lg font-bold">{t("clientSettings.verifyNewPhone", "Verify New Phone Number")}</h2>
              <button type="button" onClick={() => setShowSmsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("clientSettings.verifyCodeSent", "We've sent a verification code to")} <span className="font-bold text-foreground">{form.phone}</span>. {t("clientSettings.enterBelowToConfirm", "Please enter it below to confirm your new phone number.")}
              </p>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("clientSettings.verificationCode", "Verification Code")}</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full px-4 py-2 text-center text-xl tracking-[0.5em] font-mono bg-[#FAFAFA] border border-border/60 rounded-lg focus:outline-none focus:border-[#C69C9B]"
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyPhoneAndSave}
                disabled={isVerifying || otpCode.length < 4}
                className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C69C9B] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isVerifying ? t("clientSettings.verifying", "Verifying...") : t("clientSettings.verifyAndSave", "Verify & Save Profile")}
              </button>
            </div>
          </div>
        </div>
      )}

    </RoleGuard>
  )
}
