import { LegalLayout } from "@/components/legal/legal-layout"

export const metadata = {
  title: "Terms of Service - HayBooking",
  description: "Read the official Terms of Service for using HayBooking service reservation platform.",
}

export default function TermsPage() {
  return <LegalLayout activeTab="terms" />
}
