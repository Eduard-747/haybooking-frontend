"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, ShieldCheck, FileText, Lock, ShieldAlert, CheckCircle2 } from "lucide-react"
import { SiteHeader } from "@/components/landing/site-header"
import { SiteFooter } from "@/components/landing/site-footer"

interface LegalLayoutProps {
  activeTab: "terms" | "privacy" | "safety"
}

export function LegalLayout({ activeTab }: LegalLayoutProps) {
  const pathname = usePathname()

  const tabs = [
    { id: "terms", label: "Terms of Service", href: "/terms", icon: FileText },
    { id: "privacy", label: "Privacy Policy", href: "/privacy", icon: Lock },
    { id: "safety", label: "Safety & Security", href: "/safety", icon: ShieldAlert },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FF385C]/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            HayBooking Legal & Privacy Center
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Transparent policies designed to protect your privacy, data security, and seamless booking experience.
          </p>

          {/* Interactive Navigation Tabs */}
          <div className="pt-6 flex items-center justify-center gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#FF385C] text-white shadow-lg shadow-[#FF385C]/30 scale-105"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
          
          {/* Header Bar inside card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3 py-1 rounded-full inline-block mb-2">
                Official Policy
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {activeTab === "terms" && "Terms of Service"}
                {activeTab === "privacy" && "Privacy Policy"}
                {activeTab === "safety" && "Safety & Trust Center"}
              </h2>
            </div>
            <p className="text-xs font-medium text-slate-400 sm:text-right">
              Last Updated: August 2026
            </p>
          </div>

          {/* TAB CONTENT: TERMS OF SERVICE */}
          {activeTab === "terms" && (
            <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h3>
                <p>
                  By registering, accessing, or using HayBooking ("Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">2. Platform & Booking Services</h3>
                <p>
                  HayBooking provides a digital marketplace connecting clients with verified local service providers ("Partners"), including salons, spas, fitness studios, medical clinics, barbershops, and restaurants. HayBooking facilitates appointment scheduling, real-time availability tracking, and automated reminders.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">3. User Accounts & Responsibilities</h3>
                <p>
                  To make bookings or offer services, you must create an account providing accurate, complete information. You are responsible for maintaining confidentiality of your password and account security.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">4. Cancellations & Refund Policy</h3>
                <p>
                  Cancellations must be made within the cancellation window specified by the individual Partner. Fees may apply for late cancellations or no-shows according to individual business partner policies.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">5. Partner Guidelines</h3>
                <p>
                  Business partners listing services on HayBooking warrant that they hold all required professional licenses, safety certifications, and insurance policies to conduct business legally.
                </p>
              </section>
            </div>
          )}

          {/* TAB CONTENT: PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">1. Information We Collect</h3>
                <p>
                  We collect information you provide directly when creating an account, booking an appointment, or contacting support. This includes your name, email address, phone number, and appointment preferences.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">2. How We Use Your Data</h3>
                <p>
                  Your information is used strictly to confirm bookings, send SMS/email appointment reminders, enable customer support, and improve the HayBooking platform performance.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">3. Data Protection & Sharing</h3>
                <p>
                  We do NOT sell or rent your personal data to third parties. We share appointment details only with the specific service provider you choose to book with.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">4. Security Measures</h3>
                <p>
                  We implement industry-standard SSL/TLS encryption, secure API endpoints, and routine vulnerability assessments to safeguard your data against unauthorized access.
                </p>
              </section>
            </div>
          )}

          {/* TAB CONTENT: SAFETY & SECURITY */}
          {activeTab === "safety" && (
            <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">1. Verified Business Partners</h3>
                <p>
                  Every business partner on HayBooking undergoes verification checking active licenses, business registration, and service standards.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">2. Authentic Client Reviews</h3>
                <p>
                  Reviews and ratings on HayBooking can only be posted by verified clients who have completed an actual appointment through our system.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">3. Safe & Secure Environment</h3>
                <p>
                  Our dedicated trust & safety team monitors reviews, partner performance, and customer feedback to maintain highest hygiene and quality benchmarks.
                </p>
              </section>
            </div>
          )}

          {/* Bottom Help Banner */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 sm:p-6 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF0F3] text-[#FF385C] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Have questions about our legal terms?</p>
                <p className="text-[11px] text-slate-500">Our compliance team is available to assist you 24/7.</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </Link>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
