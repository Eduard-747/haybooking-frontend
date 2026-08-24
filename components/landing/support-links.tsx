"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Book, MessageCircle, HelpCircle, ChevronRight } from "lucide-react"

export function SupportLinks() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<"help" | null>(null)

  const categories = [
    { icon: Book, title: t("landing.supportMod.cat1Title", "Getting Started"), desc: t("landing.supportMod.cat1Desc", "Learn the basics of using Haybooking") },
    { icon: Search, title: t("landing.supportMod.cat2Title", "Booking Appointments"), desc: t("landing.supportMod.cat2Desc", "How to find and book the best services") },
    { icon: MessageCircle, title: t("landing.supportMod.cat3Title", "Managing Account"), desc: t("landing.supportMod.cat3Desc", "Update your profile and preferences") },
    { icon: HelpCircle, title: t("landing.supportMod.cat4Title", "For Businesses"), desc: t("landing.supportMod.cat4Desc", "Guides for our partner businesses") }
  ]

  return (
    <>
      <ul className="space-y-2.5">
        <li>
          <button 
            onClick={() => setActiveModal("help")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.helpCenter", "Help Center")}</span>
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-7xl p-6 md:p-10 border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">{t("landing.helpCenter", "Help Center")}</DialogTitle>
          <DialogDescription className="sr-only">Browse help articles and guides.</DialogDescription>

          {activeModal === "help" && (
            <div className="w-full">
              <div className="bg-[#FFF0F3]/60 rounded-3xl p-8 md:p-12 mb-12 text-center max-w-3xl mx-auto border border-[#FF385C]/15">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-white px-3.5 py-1 rounded-full mb-3 inline-block shadow-2xs">
                  Support Center
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">{t("landing.supportMod.title", "How can we help?")}</h2>
                <div className="relative max-w-xl mx-auto">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400" 
                    placeholder={t("landing.supportMod.searchPlaceholder", "Search for articles, guides...")} 
                  />
                </div>
              </div>

              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center tracking-tight">{t("landing.supportMod.browseByTopic", "Browse by Topic")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat, i) => (
                    <div key={i} className="bg-slate-50/80 hover:bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#FF385C]/30 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-[#FFF0F3] rounded-2xl flex items-center justify-center text-[#FF385C] mb-6 group-hover:scale-110 transition-transform">
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{cat.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{cat.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 max-w-3xl mx-auto">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center tracking-tight">{t("landing.supportMod.faqTitle", "Frequently Asked Questions")}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-[#FF385C] hover:no-underline text-base">
                        {t("landing.supportMod.faq1Q", "How do I cancel or reschedule an appointment?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 pb-6 text-sm leading-relaxed">
                        {t("landing.supportMod.faq1A", "You can manage your appointments from your Dashboard. Simply click on the booking you wish to change and select 'Cancel' or 'Reschedule'.")}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-[#FF385C] hover:no-underline text-base">
                        {t("landing.supportMod.faq2Q", "Is my payment information secure?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 pb-6 text-sm leading-relaxed">
                        {t("landing.supportMod.faq2A", "Yes, all payments are processed through our secure, PCI-compliant payment partners. We do not store your credit card information.")}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-[#FF385C] hover:no-underline text-base">
                        {t("landing.supportMod.faq3Q", "How do I list my business on Haybooking?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 pb-6 text-sm leading-relaxed">
                        {t("landing.supportMod.faq3A", "Click on 'For Businesses' in the footer or 'Register as a Business Partner' during sign up to create your partner account.")}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-[#FF385C] hover:no-underline text-base">
                        {t("landing.supportMod.faq4Q", "What happens if a specialist doesn't show up?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 pb-6 text-sm leading-relaxed">
                        {t("landing.supportMod.faq4A", "If a service provider fails to fulfill an appointment, please contact our support team immediately. We will investigate and ensure you receive a full refund.")}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="mt-16 bg-slate-50/80 rounded-3xl p-10 border border-slate-200/80 text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{t("landing.supportMod.stillNeedHelp", "Still need help?")}</h2>
                  <p className="text-slate-500 font-medium mb-8 text-sm sm:text-base">{t("landing.supportMod.supportTeamDesc", "Our support team is always ready to help you with any questions you might have.")}</p>
                  <button onClick={() => setActiveModal(null)} className="px-8 py-3.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-full font-bold shadow-md shadow-[#FF385C]/25 transition-all active:scale-95 text-sm">
                    {t("landing.supportMod.close", "Close")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
