"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { SmsVerification } from "./sms-verification"
import { useTranslation } from "react-i18next"
import { useCountryCode } from "@/lib/hooks/use-country-code"
import { getPhonePlaceholder, formatPhoneNumber, validatePhoneNumber } from "@/lib/countries"

import { auth } from "@/lib/firebase"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  type ConfirmationResult,
} from "firebase/auth"

interface AuthFormProps {
  activeTab: "signin" | "signup" | "forgot" | "reset-verify"
  onTabChange: (tab: "signin" | "signup" | "forgot" | "reset-verify") => void
  pendingBookingSlug?: string | null
}

const businessTypes = [
  { value: "medical", labelKey: "landing.catHealthMedical" },
  { value: "salon", labelKey: "landing.catBeautyWellness" },
  { value: "fitness", labelKey: "landing.catFitnessSports" },
  { value: "consulting", labelKey: "landing.catProfessionalServices" },
  { value: "education", labelKey: "landing.catEducationTraining" },
  { value: "auto", labelKey: "landing.catAutomotive" },
  { value: "home", labelKey: "landing.catHomeServices" },
  { value: "pet", labelKey: "landing.catPetServices" },
  { value: "events", labelKey: "landing.catEventsPhotography" },
  { value: "restaurant", labelKey: "landing.catRestaurantHospitality" },
  { value: "technology", labelKey: "landing.catTechnologyServices" },
  { value: "government", labelKey: "landing.catGovernmentServices" },
  { value: "other", labelKey: "landing.catOther" },
]

export function AuthForm({ activeTab, onTabChange, pendingBookingSlug }: AuthFormProps) {
  const { t } = useTranslation()
  const [isBusinessPartner, setIsBusinessPartner] = useState(false)
  const [showSmsVerification, setShowSmsVerification] = useState(false)
  const [showFirebaseEmailVerification, setShowFirebaseEmailVerification] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [signupMethod, setSignupMethod] = useState<"phone" | "email">("email")
  const [signinMethod, setSigninMethod] = useState<"phone" | "email">("email")
  const [forgotMethod, setForgotMethod] = useState<"phone" | "email">("email")
  const { countryCode: detectedCountryCode, countryCodesList } = useCountryCode("+374")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+374",
    password: "",
    confirmPassword: "",
    code: "",
    businessName: "",
    businessType: "",
  })

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      const formatted = formatPhoneNumber(value, formData.countryCode, countryCodesList)
      setFormData((prev) => ({ ...prev, phone: formatted }))
    } else if (field === "countryCode") {
      setFormData((prev) => ({
        ...prev,
        countryCode: value,
        phone: formatPhoneNumber(prev.phone, value, countryCodesList)
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, countryCode: detectedCountryCode }))
  }, [detectedCountryCode])

  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || undefined

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear()
        } catch {}
        ;(window as any).recaptchaVerifier = null
      }
    }
  }, [activeTab])

  const getOrCreateRecaptcha = () => {
    if (typeof window === "undefined") return null

    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear()
      } catch (e) {}
      ;(window as any).recaptchaVerifier = null
    }

    const container = document.getElementById("recaptcha-container")
    if (!container) return null
    container.innerHTML = ""

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
    })

    ;(window as any).recaptchaVerifier = verifier
    return verifier
  }

  const triggerPhoneSmsAuth = async (phoneNumberStr: string) => {
    try {
      const verifier = getOrCreateRecaptcha()
      if (!verifier) {
        throw new Error("Could not initialize reCAPTCHA container.")
      }

      const confirmation = await signInWithPhoneNumber(auth, phoneNumberStr, verifier)
      setConfirmationResult(confirmation)
      setShowSmsVerification(true)
      toast.success("SMS verification code sent to your phone!")
    } catch (err: any) {
      if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear()
        } catch {}
        ;(window as any).recaptchaVerifier = null
      }
      const container = document.getElementById("recaptcha-container")
      if (container) container.innerHTML = ""

      console.error("Firebase SMS Auth Error:", err)

      let msg = err?.message || "Failed to send SMS"
      if (err?.code === "auth/invalid-app-credential") {
        msg = "Firebase Auth Error: Invalid App Credential. Make sure you access via http://localhost:3000 (or add your local IP to Firebase Console > Authentication > Settings > Authorized Domains)."
      } else if (err?.code === "auth/too-many-requests") {
        msg = "Too many SMS requests sent to this number. Please wait a few minutes or try another phone number."
      } else if (err?.code === "auth/billing-not-enabled") {
        msg = "Firebase Auth: Billing not enabled. Please ensure Blaze Plan is active in Firebase Console."
      } else if (err?.code === "auth/operation-not-allowed") {
        msg = "Firebase Auth: SMS/Region not allowed. Please check SMS Region Policy in Firebase Console."
      }
      toast.error(msg)
      throw err
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "signup" && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      if (activeTab === "signup") {
        if (signupMethod === "email") {
          const cleanEmail = formData.email.trim()
          if (!cleanEmail) {
            toast.error(t("auth.enterEmail", "Please enter your email address"))
            setLoading(false)
            return
          }

          try {
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password)
            await sendEmailVerification(userCredential.user)
            setShowFirebaseEmailVerification(true)
            toast.success("Verification link sent to your email inbox! ✉️")
          } catch (fbErr: any) {
            console.error("Firebase Email Signup Error:", fbErr)
            if (fbErr?.code === "auth/operation-not-allowed") {
              toast.error("Firebase Auth Error: Email/Password provider is disabled in Firebase Console. Please enable Email/Password under Authentication > Sign-in method.")
            } else if (fbErr?.code === "auth/email-already-in-use") {
              toast.error("A user with this email address is already registered.")
            } else if (fbErr?.code === "auth/weak-password") {
              toast.error("Password should be at least 6 characters.")
            } else {
              toast.error(fbErr?.message || "Failed to send verification email.")
            }
          }
        } else {
          const validation = validatePhoneNumber(formData.phone, formData.countryCode, countryCodesList)
          if (!validation.isValid) {
            toast.error(validation.error)
            setLoading(false)
            return
          }
          const fullPhone = `${formData.countryCode}${validation.rawDigits}`
          await triggerPhoneSmsAuth(fullPhone)
        }
      } else if (activeTab === "forgot") {
        if (forgotMethod === "phone") {
          const validation = validatePhoneNumber(formData.phone, formData.countryCode, countryCodesList)
          if (!validation.isValid) {
            toast.error(validation.error)
            setLoading(false)
            return
          }
          const fullPhone = `${formData.countryCode}${validation.rawDigits}`
          await triggerPhoneSmsAuth(fullPhone)
          toast.success(t("auth.verifyDescPhone", "We sent an SMS verification code to your phone number."))
        } else {
          const cleanEmail = formData.email.trim()
          if (!cleanEmail) {
            toast.error("Please enter your email address")
            setLoading(false)
            return
          }
          try {
            await sendPasswordResetEmail(auth, cleanEmail)
          } catch {}
          await api.post("/auth/forgot-password", { identifier: cleanEmail, email: cleanEmail })
          toast.success(t("auth.verifyDescEmail", "We'll send you a verification code to your email address."))
          onTabChange("reset-verify")
        }
      } else if (activeTab === "reset-verify") {
        if (formData.password !== formData.confirmPassword) {
          toast.error(t("auth.passwordsNoMatch", "Passwords do not match"))
          setLoading(false)
          return
        }

        let payloadIdentifier = ""
        let fullPhone: string | undefined = undefined
        let payloadEmail: string | undefined = undefined

        if (forgotMethod === "phone") {
          fullPhone = formData.phone
          if (fullPhone !== "haybooking_super_admin") {
            const validation = validatePhoneNumber(formData.phone, formData.countryCode, countryCodesList)
            if (!validation.isValid) {
              toast.error(validation.error)
              setLoading(false)
              return
            }
            fullPhone = `${formData.countryCode}${validation.rawDigits}`
          }
          payloadIdentifier = fullPhone
        } else {
          payloadEmail = formData.email?.trim()
          payloadIdentifier = payloadEmail
        }

        const res = await api.post("/auth/reset-password", {
          identifier: payloadIdentifier,
          phoneNumber: fullPhone,
          email: payloadEmail,
          code: formData.code?.trim(),
          password: formData.password,
        })
        toast.success(res.data.message || "Password reset successful")
        onTabChange("signin")
      } else {
        let identifier = ""
        if (signinMethod === "phone") {
          identifier = formData.phone
          if (identifier !== "haybooking_super_admin") {
            const validation = validatePhoneNumber(formData.phone, formData.countryCode, countryCodesList)
            if (!validation.isValid) {
              toast.error(validation.error)
              setLoading(false)
              return
            }
            identifier = `${formData.countryCode}${validation.rawDigits}`
          }
        } else {
          identifier = formData.email
        }

        const res = await api.post("/auth/login", {
          identifier,
          password: formData.password,
        })

        const targetRedirect = res.data.role === "super_admin" ? "/admin/dashboard" : redirectTo
        login(res.data.access_token, { userId: "", phoneNumber: signinMethod === "phone" ? identifier : undefined, email: signinMethod === "email" ? identifier : undefined, role: res.data.role || "client" }, targetRedirect)
        toast.success("Logged in successfully!")
      }
    } catch (err: any) {
      if (err.code === "auth/billing-not-enabled" || err?.message?.includes("auth/billing-not-enabled")) {
        toast.error("Firebase billing (Blaze plan) is required to send real SMS. You can add Test Phone Numbers in Firebase Console for free local testing!")
      } else if (err.code === "auth/operation-not-allowed" || err?.message?.includes("auth/operation-not-allowed")) {
        toast.error("SMS auth or target region is not enabled in Firebase Console. Please enable Phone Auth & SMS Region Policy for your project.")
      } else {
        toast.error(err.response?.data?.message || err.message || "Authentication failed")
      }
      if (err?.response?.status !== 401) {
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSmsVerified = async (firebaseUid?: string) => {
    setShowSmsVerification(false)
    const fullPhone = `${formData.countryCode}${formData.phone.replace(/\D/g, "")}`
    
    if (activeTab === "signup") {
      try {
        const nameParts = (formData.firstName || "").trim().split(/\s+/)
        const firstName = nameParts[0] || "User"
        const lastName = nameParts.slice(1).join(" ") || ""

        const payload = signupMethod === "email" ? {
          email: formData.email.trim(),
          registrationMethod: "email",
          password: formData.password,
          name: firstName,
          surname: lastName,
          role: isBusinessPartner ? "partner" : "client",
          businessName: isBusinessPartner ? formData.businessName : undefined,
          businessType: isBusinessPartner ? formData.businessType : undefined,
        } : {
          phoneNumber: fullPhone,
          registrationMethod: "phone",
          firebaseUid,
          password: formData.password,
          name: firstName,
          surname: lastName,
          role: isBusinessPartner ? "partner" : "client",
          businessName: isBusinessPartner ? formData.businessName : undefined,
          businessType: isBusinessPartner ? formData.businessType : undefined,
        }

        const res = await api.post("/auth/signup", payload)
        login(res.data.access_token, {
          userId: "",
          email: signupMethod === "email" ? formData.email.trim() : undefined,
          phoneNumber: signupMethod === "phone" ? fullPhone : undefined,
          role: payload.role
        }, redirectTo)
        toast.success("Account created & verified successfully! 🎉")
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Registration failed after verification")
      }
    } else if (activeTab === "forgot") {
      onTabChange("reset-verify")
    }
  }

  if (showFirebaseEmailVerification) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => setShowFirebaseEmailVerification(false)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to registration
        </button>

        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#FF4444]">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We sent a Firebase verification link to{" "}
            <span className="font-semibold text-foreground">{formData.email.trim()}</span>. Please open your inbox and click the link to verify.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Button
            onClick={async () => {
              setLoading(true)
              try {
                if (auth.currentUser) {
                  await auth.currentUser.reload()
                  if (auth.currentUser.emailVerified) {
                    const nameParts = (formData.firstName || "").trim().split(/\s+/)
                    const firstName = nameParts[0] || "User"
                    const lastName = nameParts.slice(1).join(" ") || ""

                    const payload = {
                      email: formData.email.trim(),
                      registrationMethod: "email",
                      firebaseUid: auth.currentUser.uid,
                      password: formData.password,
                      name: firstName,
                      surname: lastName,
                      role: isBusinessPartner ? "partner" : "client",
                      businessName: isBusinessPartner ? formData.businessName : undefined,
                      businessType: isBusinessPartner ? formData.businessType : undefined,
                    }

                    const res = await api.post("/auth/signup", payload)
                    login(res.data.access_token, {
                      userId: "",
                      email: formData.email.trim(),
                      role: payload.role
                    }, redirectTo)
                    toast.success("Email verified & account created! 🎉")
                    return
                  }
                }
                toast.error("Email not verified yet. Please click the link in your email inbox.")
              } catch (err: any) {
                toast.error(err.response?.data?.message || err.message || "Verification check failed")
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="w-full bg-[#FF4444] hover:bg-[#FF3333] text-white py-6 text-base rounded-xl font-medium"
          >
            {loading ? "Checking verification..." : "I've verified my email"}
          </Button>

          <div className="text-center pt-2">
            <button
              onClick={async () => {
                try {
                  if (auth.currentUser) {
                    await sendEmailVerification(auth.currentUser)
                    toast.success("Verification link resent to your email!")
                  }
                } catch (e: any) {
                  toast.error("Failed to resend email.")
                }
              }}
              className="text-sm font-medium text-[#FF4444] hover:underline text-xs"
            >
              Didn't get an email? Resend link
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showSmsVerification) {
    const isEmailVerification = (activeTab === "signup" && signupMethod === "email") || (activeTab === "forgot" && forgotMethod === "email")
    return (
      <SmsVerification
        phoneNumber={isEmailVerification ? undefined : `${formData.countryCode}${formData.phone}`}
        email={isEmailVerification ? formData.email.trim() : undefined}
        confirmationResult={confirmationResult}
        onVerified={handleSmsVerified}
        onBack={() => setShowSmsVerification(false)}
        onResend={async () => {
          if (isEmailVerification) {
            await api.post("/auth/send-email-otp", { email: formData.email.trim() })
          } else {
            await triggerPhoneSmsAuth(`${formData.countryCode}${formData.phone.replace(/\D/g, "")}`)
          }
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div id="recaptcha-container" className="flex justify-center my-3" />
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {activeTab === "signup" ? (
            <>
              {t("auth.createPrefix", "Create")}{" "}
              <span className="text-[#FF385C]">{t("auth.yourAccount", "your account")}</span>
            </>
          ) : activeTab === "forgot" ? (
            t("auth.forgotPassword")
          ) : activeTab === "reset-verify" ? (
            t("auth.resetPasswordTitle", "Reset Password")
          ) : (
            <>
              {t("auth.welcomePrefix", "Welcome")}{" "}
              <span className="text-[#FF385C]">{t("auth.backSuffix", "back")}</span>
            </>
          )}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">
          {activeTab === "signup"
            ? t("auth.createAccountDesc", "Join Haybooking and discover the best local services.")
            : activeTab === "forgot"
              ? (forgotMethod === "email"
                  ? t("auth.verifyDescEmail", "We'll send you a verification code to your email address to reset your password.")
                  : t("auth.verifyDescPhone", "We'll send you a verification code via SMS to confirm your phone number."))
              : activeTab === "reset-verify"
                ? `${t("auth.weSentCode", "We sent a 6-digit code to")} ${forgotMethod === "email" ? (formData.email || "your email") : `${formData.countryCode} ${formData.phone}`}`
                : t("auth.welcomeDesc", "Sign in to continue to your account")}
        </p>
      </div>

      {/* Tab Switcher */}
      {(activeTab !== "forgot" && activeTab !== "reset-verify") && (
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => onTabChange("signup")}
            className={`relative px-5 pb-3 text-sm font-bold transition-colors ${
              activeTab === "signup"
                ? "text-[#FF385C]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t("auth.signUp", "Sign Up")}
            {activeTab === "signup" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("signin")}
            className={`relative px-5 pb-3 text-sm font-bold transition-colors ${
              activeTab === "signin"
                ? "text-[#FF385C]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t("auth.signIn", "Sign In")}
            {activeTab === "signin" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C] rounded-full" />
            )}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "signup" ? (
          <SignUpForm
            formData={formData}
            onInputChange={handleInputChange}
            isBusinessPartner={isBusinessPartner}
            setIsBusinessPartner={setIsBusinessPartner}
            countryCodesList={countryCodesList}
            signupMethod={signupMethod}
            setSignupMethod={setSignupMethod}
          />
        ) : activeTab === "forgot" ? (
          <ForgotPasswordForm
            formData={formData}
            onInputChange={handleInputChange}
            countryCodesList={countryCodesList}
            forgotMethod={forgotMethod}
            setForgotMethod={setForgotMethod}
          />
        ) : activeTab === "reset-verify" ? (
          <ResetVerifyForm formData={formData} onInputChange={handleInputChange} />
        ) : (
          <SignInForm
            formData={formData}
            onInputChange={handleInputChange}
            onForgot={() => {
              setForgotMethod(signinMethod)
              onTabChange("forgot")
            }}
            countryCodesList={countryCodesList}
            signinMethod={signinMethod}
            setSigninMethod={setSigninMethod}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#FF385C] hover:bg-[#E0304F] text-white h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-md shadow-[#FF385C]/25 transition-all hover:shadow-lg active:scale-98 mt-2 flex items-center justify-center gap-2"
          disabled={loading}
        >
          <span>
            {loading
              ? t("auth.processing")
              : activeTab === "signup"
                ? t("auth.createAccountButton", "Create Account")
                : activeTab === "forgot"
                  ? t("auth.sendCode")
                  : activeTab === "reset-verify"
                    ? t("auth.resetPasswordTitle", "Reset Password")
                    : t("auth.signIn")}
          </span>
          {!loading && <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />}
        </Button>

        {(activeTab === "forgot" || activeTab === "reset-verify") && (
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => onTabChange("signin")}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors"
            >
              {t("auth.backToSignIn", "Back to sign in")}
            </button>
          </div>
        )}

        {(activeTab !== "forgot" && activeTab !== "reset-verify") && (
          <div className="text-center pt-3">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {activeTab === "signup" ? (
                <>
                  {t("auth.hasAccount", "Already have an account?")}{" "}
                  <button
                    type="button"
                    onClick={() => onTabChange("signin")}
                    className="font-bold text-[#FF385C] underline hover:text-[#E0304F] ml-1"
                  >
                    {t("auth.signIn", "Sign In")}
                  </button>
                </>
              ) : (
                <>
                  {t("auth.noAccount", "Don't have an account?")}{" "}
                  <button
                    type="button"
                    onClick={() => onTabChange("signup")}
                    className="font-bold text-[#FF385C] underline hover:text-[#E0304F] ml-1"
                  >
                    {t("auth.signUp", "Sign Up")}
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

interface SignUpFormProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
    password: string
    confirmPassword: string
    businessName: string
    businessType: string
  }
  onInputChange: (field: string, value: string) => void
  isBusinessPartner: boolean
  setIsBusinessPartner: (value: boolean) => void
  countryCodesList: { code: string; country: string; flag: string }[]
  signupMethod: "phone" | "email"
  setSignupMethod: (method: "phone" | "email") => void
}

function SignUpForm({
  formData,
  onInputChange,
  isBusinessPartner,
  setIsBusinessPartner,
  countryCodesList,
  signupMethod,
  setSignupMethod,
}: SignUpFormProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-3.5">
      {/* Method Toggle */}
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          onClick={() => setSignupMethod("email")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            signupMethod === "email" ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t("common.email", "Email")}
        </button>
        <button
          type="button"
          onClick={() => setSignupMethod("phone")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            signupMethod === "phone" ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t("common.phone", "Phone Number")}
        </button>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
          {t("auth.fullName", "Full Name")}
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="firstName"
            placeholder={t("auth.enterFullName", "Enter your full name") as string}
            value={formData.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
            required
          />
        </div>
      </div>

      {/* Email or Phone Field based on Method */}
      {signupMethod === "email" ? (
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-700">
            {t("common.email", "Email Address")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder={t("auth.enterEmail", "Enter your email") as string}
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
            {t("common.phone", "Phone Number")}
          </Label>
          <div className="flex gap-2">
            <Select
              value={formData.countryCode}
              onValueChange={(value) => onInputChange("countryCode", value)}
            >
              <SelectTrigger className="w-[105px] h-11 shrink-0 rounded-xl border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countryCodesList.map((cc) => (
                  <SelectItem key={cc.code} value={cc.code}>
                    {cc.flag} {cc.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                placeholder={getPhonePlaceholder(formData.countryCode, countryCodesList)}
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
                className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700">
          {t("common.password", "Password")}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.createPassword", "Create a password") as string}
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Row 4: Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">
          {t("auth.confirmPass", "Confirm Password")}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("auth.confirmYourPassword", "Confirm your password") as string}
            value={formData.confirmPassword}
            onChange={(e) => onInputChange("confirmPassword", e.target.value)}
            className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-xs text-red-500 font-medium mt-1">{t("auth.passwordsNoMatch")}</p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <Checkbox
          id="terms"
          defaultChecked
          className="mt-0.5 shrink-0 rounded border-slate-300 data-[state=checked]:bg-[#FF385C] data-[state=checked]:border-[#FF385C]"
        />
        <Label htmlFor="terms" className="cursor-pointer text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed block select-text">
          <span>{t("auth.acceptTermsAgree", "I agree to Haybooking's")}</span>{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#FF385C] underline font-semibold hover:text-[#E0304F] transition-colors inline"
          >
            {t("auth.terms", "Terms of Service")}
          </Link>{" "}
          <span>{t("auth.and", "and")}</span>{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#FF385C] underline font-semibold hover:text-[#E0304F] transition-colors inline"
          >
            {t("auth.privacy", "Privacy Policy")}
          </Link>
          .
        </Label>
      </div>

      {/* Business Partner Checkbox */}
      <div className="flex items-center space-x-2.5 pt-1">
        <Checkbox
          id="business"
          checked={isBusinessPartner}
          onCheckedChange={(checked) => setIsBusinessPartner(checked as boolean)}
          className="rounded border-slate-300 data-[state=checked]:bg-[#FF385C] data-[state=checked]:border-[#FF385C]"
        />
        <Label htmlFor="business" className="cursor-pointer text-xs font-semibold text-slate-600">
          {t("auth.registerBusiness", "Register as a Business Partner")}
        </Label>
      </div>

      {/* Business Details Section */}
      {isBusinessPartner && (
        <div className="rounded-xl border border-dashed border-[#FF385C]/30 bg-[#FFF0F3]/30 p-3.5 space-y-3 mt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF385C] tracking-wider uppercase">
            <Building2 className="h-4 w-4" />
            {t("auth.businessDetails", "BUSINESS DETAILS")}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-xs font-bold text-slate-700">
              {t("dashboard.businessName", "Business Name")}
            </Label>
            <Input
              id="businessName"
              placeholder="HayBooking Solutions Ltd."
              value={formData.businessName}
              onChange={(e) => onInputChange("businessName", e.target.value)}
              className="h-10 text-xs rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessType" className="text-xs font-bold text-slate-700">
              {t("dashboard.businessType", "Business Type")}
            </Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => onInputChange("businessType", value)}
            >
              <SelectTrigger className="w-full h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder={t("dashboard.selectType", "Select type")} />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(type.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

interface SignInFormProps {
  formData: {
    phone: string
    countryCode: string
    email: string
    password: string
  }
  onInputChange: (field: string, value: string) => void
  onForgot?: () => void
  countryCodesList: { code: string; country: string; flag: string }[]
  signinMethod: "phone" | "email"
  setSigninMethod: (method: "phone" | "email") => void
}

function SignInForm({ formData, onInputChange, onForgot, countryCodesList, signinMethod, setSigninMethod }: SignInFormProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-4">
      {/* Method Toggle */}
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          onClick={() => setSigninMethod("email")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            signinMethod === "email" ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t("common.email", "Email")}
        </button>
        <button
          type="button"
          onClick={() => setSigninMethod("phone")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            signinMethod === "phone" ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t("common.phone", "Phone Number")}
        </button>
      </div>

      {signinMethod === "email" ? (
        <div className="space-y-1.5">
          <Label htmlFor="signin-email" className="text-xs font-bold text-slate-700">{t("common.email", "Email Address")}</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="signin-email"
              type="email"
              placeholder={t("auth.enterEmail", "Enter your email") as string}
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="signin-phone" className="text-xs font-bold text-slate-700">{t("common.phone", "Phone Number")}</Label>
          <div className="flex gap-2">
            <Select
              value={formData.countryCode}
              onValueChange={(value) => onInputChange("countryCode", value)}
            >
              <SelectTrigger className="w-[105px] h-11 shrink-0 rounded-xl border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countryCodesList.map((cc) => (
                  <SelectItem key={cc.code} value={cc.code}>
                    {cc.flag} {cc.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="signin-phone"
                type="tel"
                placeholder={getPhonePlaceholder(formData.countryCode, countryCodesList)}
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
                className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signin-password" className="text-xs font-bold text-slate-700">{t("common.password", "Password")}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#FF385C] focus:ring-[#FF385C]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-[#FF385C] font-semibold hover:underline"
          >
            {t("auth.forgotPassword", "Forgot password?")}
          </button>
        </div>
      </div>
    </div>
  )
}

function ForgotPasswordForm({
  formData,
  onInputChange,
  countryCodesList,
  forgotMethod,
  setForgotMethod,
}: {
  formData: { phone: string; countryCode: string; email: string }
  onInputChange: (field: string, value: string) => void
  countryCodesList: { code: string; country: string; flag: string }[]
  forgotMethod: "phone" | "email"
  setForgotMethod: (method: "phone" | "email") => void
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          onClick={() => setForgotMethod("email")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            forgotMethod === "email" ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t("common.email", "Email")}
        </button>
        <button
          type="button"
          onClick={() => setForgotMethod("phone")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            forgotMethod === "phone" ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t("common.phone", "Phone Number")}
        </button>
      </div>

      {forgotMethod === "email" ? (
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email" className="text-xs font-bold text-slate-700">{t("common.email", "Email Address")}</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="forgot-email"
              type="email"
              placeholder={t("auth.enterEmail", "Enter your email") as string}
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200"
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="forgot-phone" className="text-xs font-bold text-slate-700">{t("common.phone", "Phone Number")}</Label>
          <div className="flex gap-2">
            <Select
              value={formData.countryCode}
              onValueChange={(value) => onInputChange("countryCode", value)}
            >
              <SelectTrigger className="w-[105px] h-11 shrink-0 rounded-xl border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countryCodesList.map((cc) => (
                  <SelectItem key={cc.code} value={cc.code}>
                    {cc.flag} {cc.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="forgot-phone"
                type="tel"
                placeholder={getPhonePlaceholder(formData.countryCode, countryCodesList)}
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
                className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200"
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResetVerifyForm({
  formData,
  onInputChange,
}: {
  formData: { code: string; password: string; confirmPassword: string }
  onInputChange: (field: string, value: string) => void
}) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reset-code" className="text-xs font-bold text-slate-700">{t("auth.code", "6-Digit Code")}</Label>
        <Input
          id="reset-code"
          placeholder={t("auth.codePlaceholder", "Enter 6-digit code") as string}
          value={formData.code}
          onChange={(e) => onInputChange("code", e.target.value)}
          className="h-11 text-xs sm:text-sm rounded-xl border-slate-200"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-password" className="text-xs font-bold text-slate-700">{t("auth.newPassword", "New Password")}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm-password" className="text-xs font-bold text-slate-700">{t("auth.confirmNewPassword", "Confirm New Password")}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="reset-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => onInputChange("confirmPassword", e.target.value)}
            className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
