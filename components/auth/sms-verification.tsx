"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Mail, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import type { ConfirmationResult } from "firebase/auth"

import { validateOtpCode } from "@/lib/countries"

interface SmsVerificationProps {
  phoneNumber?: string
  email?: string
  confirmationResult?: ConfirmationResult | null
  onVerified: (firebaseUid?: string) => void
  onBack: () => void
  onResend?: () => Promise<void>
}

export function SmsVerification({ phoneNumber = "", email, confirmationResult, onVerified, onBack, onResend }: SmsVerificationProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Take only the last digit
    setCode(newCode)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are filled
    if (newCode.every(d => d !== "") && newCode.join("").length === 6) {
      handleVerify(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newCode = [...code]
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)
    if (pasted.length === 6) {
      handleVerify(pasted)
    }
  }

  const handleVerify = async (codeStr: string) => {
    const { isValid, error, cleanCode } = validateOtpCode(codeStr)
    if (!isValid) {
      toast.error(error || "Please enter a valid 6-digit verification code.")
      return
    }
    setIsVerifying(true)
    try {
      if (confirmationResult) {
        const userCredential = await confirmationResult.confirm(cleanCode)
        const firebaseUid = userCredential.user.uid
        toast.success("Phone verified successfully!")
        onVerified(firebaseUid)
      } else if (email) {
        await api.post("/auth/verify-email-otp", { email, code: cleanCode })
        toast.success("Email verified successfully!")
        onVerified()
      } else {
        await api.post("/auth/verify-sms", { phoneNumber, code: cleanCode })
        toast.success("Phone verified!")
        onVerified()
      }
    } catch (err: any) {
      let errorMessage = "Invalid verification code"
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid verification code. Please check the code and try again."
      } else if (err.code === "auth/code-expired") {
        errorMessage = "Verification code has expired. Please click Resend Code."
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      toast.error(errorMessage)
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendClick = async () => {
    setCanResend(false)
    setResendTimer(60)
    try {
      if (onResend) {
        await onResend()
      } else if (email) {
        await api.post("/auth/send-email-otp", { email })
      }
      toast.success("Verification code resent!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to resend code")
    }
  }

  // Mask phone number for display
  const maskedPhone = phoneNumber && phoneNumber.length > 4
    ? phoneNumber.slice(0, -4).replace(/./g, "•") + phoneNumber.slice(-4)
    : phoneNumber

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to registration
      </button>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
          {email ? <Mail className="h-7 w-7 text-[#FF4444]" /> : <Phone className="h-7 w-7 text-[#FF4444]" />}
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          {email ? "Verify your email" : "Verify your phone"}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email ? email : maskedPhone}</span>
        </p>
      </div>

      {/* 6-digit code input */}
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`
              w-12 h-14 text-center text-xl font-bold rounded-xl border-2 
              outline-none transition-all duration-200
              ${digit
                ? "border-[#FF4444] bg-[#FEF2F2] text-[#FF4444]"
                : "border-border bg-white text-foreground hover:border-[#FF4444]"
              }
              focus:border-[#FF4444] focus:ring-2 focus:ring-[#FF4444]/20
            `}
          />
        ))}
      </div>

      {/* Verify button */}
      <Button
        onClick={() => handleVerify(code.join(""))}
        className="w-full bg-[#FF4444] hover:bg-[#d44850] text-white"
        size="lg"
        disabled={isVerifying || code.some(d => d === "")}
      >
        {isVerifying ? "Verifying..." : "Verify Phone Number"}
      </Button>

      {/* Resend */}
      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResendClick}
            className="flex items-center gap-2 mx-auto text-sm font-medium text-[#FF4444] hover:text-[#d44850] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Resend Code
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-medium text-foreground">{resendTimer}s</span>
          </p>
        )}
      </div>

      {/* Dev mode hint */}
      <p className="text-center text-xs text-muted-foreground/60">
        Dev mode: any 6-digit code will be accepted
      </p>
    </div>
  )
}
