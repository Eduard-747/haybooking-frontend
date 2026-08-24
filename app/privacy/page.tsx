import { LegalLayout } from "@/components/legal/legal-layout"

export const metadata = {
  title: "Privacy Policy - HayBooking",
  description: "Read the official Privacy Policy and data protection guidelines for HayBooking.",
}

export default function PrivacyPage() {
  return <LegalLayout activeTab="privacy" />
}
