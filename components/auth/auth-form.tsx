"use client"

import { useState } from "react"
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
  ChevronRight,
  CalendarCheck,
  Eye,
  EyeOff,
} from "lucide-react"
import Link from "next/link"
import { SmsVerification } from "./sms-verification"

import { Logo } from "@/components/ui/logo"
interface AuthFormProps {
  activeTab: "signin" | "signup" | "forgot" | "reset-verify"
  onTabChange: (tab: "signin" | "signup" | "forgot" | "reset-verify") => void
  pendingBookingSlug?: string | null
}

const businessTypes = [
  { value: "salon", label: "Salon & Spa" },
  { value: "medical", label: "Medical Practice" },
  { value: "fitness", label: "Fitness Studio" },
  { value: "consulting", label: "Consulting Services" },
  { value: "restaurant", label: "Restaurant & Dining" },
  { value: "auto", label: "Auto Service" },
  { value: "pet", label: "Pet Grooming" },
  { value: "other", label: "Other" },
]

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+374", country: "AM", flag: "🇦🇲" },
  { code: "+995", country: "GE", flag: "🇬🇪" },
  { code: "+994", country: "AZ", flag: "🇦🇿" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+90", country: "TR", flag: "🇹🇷" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+48", country: "PL", flag: "🇵🇱" },
]

export function AuthForm({ activeTab, onTabChange, pendingBookingSlug }: AuthFormProps) {
  const [isBusinessPartner, setIsBusinessPartner] = useState(false)
  const [showSmsVerification, setShowSmsVerification] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    password: "",
    confirmPassword: "",
    code: "",
    businessName: "",
    businessType: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "signup" && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true);
    try {
      if (activeTab === "signup") {
        const fullPhone = `${formData.countryCode}${formData.phone.replace(/\D/g, '')}`
        const payload = {
          phoneNumber: fullPhone,
          password: formData.password,
          name: formData.firstName,
          surname: formData.lastName,
          email: formData.email || undefined,
          role: isBusinessPartner ? 'partner' : 'client',
          businessName: isBusinessPartner ? formData.businessName : undefined,
          businessType: isBusinessPartner ? formData.businessType : undefined
        };
        const res = await api.post('/auth/signup', payload);
        login(res.data.access_token, { userId: '', phoneNumber: fullPhone, role: payload.role }, redirectTo);

        // Show SMS verification step
        setShowSmsVerification(true)
      } else if (activeTab === "forgot") {
        let fullPhone = formData.phone;
        if (fullPhone !== 'haybooking_super_admin') {
          fullPhone = fullPhone.startsWith('+') ? fullPhone : `${formData.countryCode}${fullPhone.replace(/\D/g, '')}`;
        }
        const res = await api.post('/auth/forgot-password', {
          phoneNumber: fullPhone
        });
        toast.success(res.data.message || 'If that phone number exists, a reset code has been sent via SMS.');
        onTabChange("reset-verify")
      } else if (activeTab === "reset-verify") {
        let fullPhone = formData.phone;
        if (fullPhone !== 'haybooking_super_admin') {
          fullPhone = fullPhone.startsWith('+') ? fullPhone : `${formData.countryCode}${fullPhone.replace(/\D/g, '')}`;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        const res = await api.post('/auth/reset-password', {
          phoneNumber: fullPhone,
          code: formData.code,
          password: formData.password
        });
        toast.success(res.data.message || 'Password reset successful');
        onTabChange("signin");
      } else {
        let fullPhone = formData.phone;
        if (fullPhone !== 'haybooking_super_admin') {
          fullPhone = fullPhone.startsWith('+') ? fullPhone : `${formData.countryCode}${fullPhone.replace(/\\D/g, '')}`;
        }
        const res = await api.post('/auth/login', {
          phoneNumber: fullPhone,
          password: formData.password
        });

        const targetRedirect = res.data.role === 'super_admin' ? '/admin/dashboard' : redirectTo;
        login(res.data.access_token, { userId: '', phoneNumber: fullPhone, role: res.data.role || 'client' }, targetRedirect);
        toast.success('Logged in successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSmsVerified = () => {
    toast.success('Account verified! 🎉')
    setShowSmsVerification(false)
  }

  // Show SMS verification page if in that step
  if (showSmsVerification) {
    return (
      <SmsVerification
        phoneNumber={`${formData.countryCode}${formData.phone}`}
        onVerified={handleSmsVerified}
        onBack={() => setShowSmsVerification(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
        <Logo />
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {activeTab === "signup" ? "Create an account" : activeTab === "forgot" ? "Reset your password" : activeTab === "reset-verify" ? "Set New Password" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeTab === "signup"
            ? "Start your journey with us today"
            : activeTab === "forgot"
              ? "Enter your phone number to receive a reset code"
              : activeTab === "reset-verify"
                ? "Enter the 6-digit code sent to your phone"
                : "Sign in to continue to your account"}
        </p>
      </div>

      {/* Tab Switcher */}
      {(activeTab !== "forgot" && activeTab !== "reset-verify") && (
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => onTabChange("signin")}
            className={`relative px-4 pb-3 text-sm font-medium transition-colors ${activeTab === "signin"
                ? "text-[#E5555E]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Sign In
            {activeTab === "signin" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5555E]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("signup")}
            className={`relative px-4 pb-3 text-sm font-medium transition-colors ${activeTab === "signup"
                ? "text-[#E5555E]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Sign Up
            {activeTab === "signup" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5555E]" />
            )}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {activeTab === "signup" ? (
          <SignUpForm
            formData={formData}
            onInputChange={handleInputChange}
            isBusinessPartner={isBusinessPartner}
            setIsBusinessPartner={setIsBusinessPartner}
          />
        ) : activeTab === "forgot" ? (
          <ForgotPasswordForm formData={formData} onInputChange={handleInputChange} />
        ) : activeTab === "reset-verify" ? (
          <ResetVerifyForm formData={formData} onInputChange={handleInputChange} />
        ) : (
          <SignInForm formData={formData} onInputChange={handleInputChange} onForgot={() => onTabChange("forgot")} />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#E5555E] hover:bg-[#d44850] text-white"
          size="lg"
          disabled={loading}
        >
          {loading ? "Processing..." : (activeTab === "signup" ? "Create Account" : activeTab === "forgot" ? "Send Reset Code" : activeTab === "reset-verify" ? "Verify & Save" : "Sign In")}
          {!loading && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>

        {(activeTab === "forgot" || activeTab === "reset-verify") && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => onTabChange("signin")}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}

        {(activeTab !== "forgot" && activeTab !== "reset-verify") && (
          <>
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                />
                <path
                  fill="#34A853"
                  d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                />
                <path
                  fill="#4A90E2"
                  d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to HayBooking&apos;s{" "}
              <Link href="#" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Help */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-muted">
                <User className="h-4 w-4" />
              </div>
              <span>Need help?</span>
              <Link href="#" className="text-foreground underline hover:text-primary">
                Contact our concierge
              </Link>
            </div>
          </>
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
}

function SignUpForm({
  formData,
  onInputChange,
  isBusinessPartner,
  setIsBusinessPartner,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <>
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="firstName"
              placeholder="Jane"
              value={formData.firstName}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Surname</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="jane.doe@example.com"
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Phone with Country Code */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="flex gap-2">
          <Select
            value={formData.countryCode}
            onValueChange={(value) => onInputChange("countryCode", value)}
          >
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countryCodes.map((cc) => (
                <SelectItem key={cc.code} value={cc.code}>
                  {cc.flag} {cc.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="555 000 0000"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => onInputChange("confirmPassword", e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>

      {/* Business Partner Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="business"
          checked={isBusinessPartner}
          onCheckedChange={(checked) => setIsBusinessPartner(checked as boolean)}
          className="data-[state=checked]:bg-[#E5555E] data-[state=checked]:border-[#E5555E] data-[state=checked]:text-white"
        />
        <Label htmlFor="business" className="cursor-pointer text-sm font-normal">
          Register as a Business Partner
        </Label>
      </div>

      {/* Business Details Section — no branch address */}
      {isBusinessPartner && (
        <div className="rounded-lg border border-dashed border-[#E5555E]/30 bg-[#E5555E]/5 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E5555E] tracking-wider uppercase">
            <Building2 className="h-4 w-4" />
            BUSINESS DETAILS
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="HayBooking Solutions Ltd."
              value={formData.businessName}
              onChange={(e) => onInputChange("businessName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => onInputChange("businessType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </>
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
}

function SignInForm({ formData, onInputChange, onForgot }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      {/* Phone Number with Country Code */}
      <div className="space-y-2">
        <Label htmlFor="signin-phone">Phone Number</Label>
        <div className="flex gap-2">
          <Select
            value={formData.countryCode}
            onValueChange={(value) => onInputChange("countryCode", value)}
          >
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countryCodes.map((cc) => (
                <SelectItem key={cc.code} value={cc.code}>
                  {cc.flag} {cc.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signin-phone"
              type="tel"
              placeholder="555 000 0000"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Password with eye toggle */}
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-[#E5555E] font-medium hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </>
  )
}

function ForgotPasswordForm({ formData, onInputChange }: { formData: any, onInputChange: any }) {
  return (
    <div className="space-y-4 pt-2">
      {/* Phone Number with Country Code */}
      <div className="space-y-2">
        <Label htmlFor="forgot-phone">Phone Number</Label>
        <div className="flex gap-2">
          <Select
            value={formData.countryCode}
            onValueChange={(value) => onInputChange("countryCode", value)}
          >
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countryCodes.map((cc) => (
                <SelectItem key={cc.code} value={cc.code}>
                  {cc.flag} {cc.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-phone"
              type="tel"
              placeholder="555 000 0000"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ResetVerifyForm({ formData, onInputChange }: { formData: any, onInputChange: any }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-4 pt-2">
      {/* Verification Code */}
      <div className="space-y-2">
        <Label htmlFor="reset-code">6-Digit Code</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reset-code"
            type="text"
            placeholder="123456"
            value={formData.code}
            onChange={(e) => onInputChange("code", e.target.value)}
            className="pl-10 tracking-widest font-mono text-center"
            maxLength={6}
            required
          />
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirm-new-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => onInputChange("confirmPassword", e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
