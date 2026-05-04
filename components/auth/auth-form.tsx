"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  MapPin,
  ChevronRight,
  CalendarCheck,
} from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  activeTab: "signin" | "signup"
  onTabChange: (tab: "signin" | "signup") => void
}

const businessTypes = [
  { value: "salon", label: "Salon & Spa" },
  { value: "medical", label: "Medical Practice" },
  { value: "fitness", label: "Fitness Studio" },
  { value: "consulting", label: "Consulting Services" },
  { value: "restaurant", label: "Restaurant & Dining" },
  { value: "other", label: "Other" },
]

export function AuthForm({ activeTab, onTabChange }: AuthFormProps) {
  const [isBusinessPartner, setIsBusinessPartner] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    otp: "",
    password: "",
    businessName: "",
    businessType: "",
    branchAddress: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <CalendarCheck className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xl font-semibold text-primary">HayBooking</span>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {activeTab === "signup" ? "Create an account" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeTab === "signup"
            ? "Start your journey with us today"
            : "Sign in to continue to your account"}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => onTabChange("signin")}
          className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
            activeTab === "signin"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
          {activeTab === "signin" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onTabChange("signup")}
          className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
            activeTab === "signup"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign Up
          {activeTab === "signup" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {activeTab === "signup" ? (
          <SignUpForm
            formData={formData}
            onInputChange={handleInputChange}
            isBusinessPartner={isBusinessPartner}
            setIsBusinessPartner={setIsBusinessPartner}
          />
        ) : (
          <SignInForm formData={formData} onInputChange={handleInputChange} />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {activeTab === "signup" ? "Create Account" : "Sign In"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>

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
        <Button type="button" variant="outline" className="w-full" size="lg">
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
              d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7## L1.23746264,17.3349879 L5.27698177,14.2678769 Z"
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
    otp: string
    password: string
    businessName: string
    businessType: string
    branchAddress: string
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

      {/* Phone & OTP */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="otp">SMS OTP Code</Label>
          <Input
            id="otp"
            placeholder="6-digit code"
            value={formData.otp}
            onChange={(e) => onInputChange("otp", e.target.value)}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Business Partner Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="business"
          checked={isBusinessPartner}
          onCheckedChange={(checked) => setIsBusinessPartner(checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label htmlFor="business" className="cursor-pointer text-sm font-normal">
          Register as a Business Partner
        </Label>
      </div>

      {/* Business Details Section */}
      {isBusinessPartner && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
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

          <div className="space-y-2">
            <Label htmlFor="branchAddress">Branch Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="branchAddress"
                placeholder="123 Nordic Street, Suite 400"
                value={formData.branchAddress}
                onChange={(e) => onInputChange("branchAddress", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface SignInFormProps {
  formData: {
    email: string
    password: string
  }
  onInputChange: (field: string, value: string) => void
}

function SignInForm({ formData, onInputChange }: SignInFormProps) {
  return (
    <>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-email"
            type="email"
            placeholder="jane.doe@example.com"
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <Link href="#" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </>
  )
}
