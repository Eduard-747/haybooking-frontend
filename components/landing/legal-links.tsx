"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChevronRight } from "lucide-react"

export function LegalLinks() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null)

  return (
    <>
      <ul className="space-y-2.5">
        <li>
          <button 
            onClick={() => setActiveModal("privacy")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.privacyPolicy", "Privacy Policy")}</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveModal("terms")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.termsOfService", "Terms of Service")}</span>
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl p-6 md:p-10 border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">
            {activeModal === "privacy" ? t("landing.legalMod.privacyTitle", "Privacy Policy") : t("landing.legalMod.termsTitle", "Terms of Service")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {activeModal === "privacy" ? t("landing.legalMod.privacyTitle", "Privacy Policy") : t("landing.legalMod.termsTitle", "Terms of Service")}
          </DialogDescription>

          {activeModal === "privacy" && (
            <div className="w-full prose prose-slate max-w-none">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                Legal
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{t("landing.legalMod.privacyTitle", "Privacy Policy")}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-8">{t("landing.legalMod.lastUpdated", "Last updated: June 5, 2026")}</p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec1", "1. Introduction")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.privacyIntro", "At Haybooking, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec2", "2. Information We Collect")}</h3>
              <p className="text-slate-600 leading-relaxed mb-2">{t("landing.legalMod.privacySec2Desc", "We collect information that you provide directly to us when you:")}</p>
              <ul className="list-disc pl-5 text-slate-600 mb-4 space-y-1">
                <li>{t("landing.legalMod.privacySec2List1", "Create an account or register for our service")}</li>
                <li>{t("landing.legalMod.privacySec2List2", "Book an appointment with a service provider")}</li>
                <li>{t("landing.legalMod.privacySec2List3", "Contact our customer support")}</li>
                <li>{t("landing.legalMod.privacySec2List4", "Subscribe to our newsletters")}</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec3", "3. How We Use Your Information")}</h3>
              <p className="text-slate-600 leading-relaxed mb-2">{t("landing.legalMod.privacySec3Desc", "We use the information we collect to:")}</p>
              <ul className="list-disc pl-5 text-slate-600 mb-4 space-y-1">
                <li>{t("landing.legalMod.privacySec3List1", "Facilitate your bookings with service providers")}</li>
                <li>{t("landing.legalMod.privacySec3List2", "Send you booking confirmations and reminders")}</li>
                <li>{t("landing.legalMod.privacySec3List3", "Improve and personalize our services")}</li>
                <li>{t("landing.legalMod.privacySec3List4", "Respond to your comments, questions, and requests")}</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec4", "4. Data Security")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.privacySec4Desc", "We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec5", "5. Cookies and Tracking Technologies")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.privacySec5Desc", "We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec6", "6. Data Retention")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.privacySec6Desc", "We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec7", "7. Third-Party Sharing")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.privacySec7Desc", "We do not sell your personal information. We may share your information with service providers, business partners, or to comply with legal obligations.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.privacySec8", "8. Your Data Protection Rights")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.privacySec8Desc", "Depending on your location, you may have certain data protection rights, such as the right to access, update, or delete your personal information.")}
              </p>
            </div>
          )}

          {activeModal === "terms" && (
            <div className="w-full prose prose-slate max-w-none">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                Terms
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{t("landing.legalMod.termsTitle", "Terms of Service")}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-8">{t("landing.legalMod.lastUpdated", "Last updated: June 5, 2026")}</p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec1", "1. Agreement to Terms")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec1Desc", "By accessing or using Haybooking's website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec2", "2. Use License")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec2Desc", "Permission is granted to temporarily download one copy of the materials (information or software) on Haybooking's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec3", "3. Service Bookings")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec3Desc", "When you book a service through our platform, you are entering into a direct contract with the service provider. Haybooking acts solely as an intermediary platform to facilitate this booking. We are not responsible for the quality, safety, or legality of the services provided.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec4", "4. User Accounts")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec4Desc", "When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec5", "5. Payment and Refunds")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec5Desc", "All payments are processed securely. Refund policies for services booked are determined by the individual service providers. Subscription fees for businesses are non-refundable unless stated otherwise.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec6", "6. Intellectual Property")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec6Desc", "The service and its original content, features, and functionality are and will remain the exclusive property of Haybooking and its licensors.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec7", "7. Limitation of Liability")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec7Desc", "In no event shall Haybooking, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.")}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3">{t("landing.legalMod.termsSec8", "8. Dispute Resolution")}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {t("landing.legalMod.termsSec8Desc", "Any disputes arising out of or relating to these Terms will be resolved through binding arbitration, rather than in court.")}
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-right">
            <button onClick={() => setActiveModal(null)} className="px-6 py-2.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-full font-bold shadow-xs transition-all text-sm active:scale-95">
              {t("landing.legalMod.close", "Close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
