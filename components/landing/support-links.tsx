"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Book, MessageCircle, HelpCircle } from "lucide-react"

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
      <ul className="space-y-3">
        <li>
          <button onClick={() => setActiveModal("help")} className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors">
            {t("landing.helpCenter", "Help Center")}
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-7xl p-6 md:p-10 border-none bg-[#FDFBF7]/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">{t("landing.helpCenter", "Help Center")}</DialogTitle>
          <DialogDescription className="sr-only">Browse help articles and guides.</DialogDescription>

          {activeModal === "help" && (
            <div className="w-full">
              <div className="bg-rose-50/50 rounded-3xl p-8 md:p-12 mb-12 text-center max-w-3xl mx-auto border border-rose-100">
                <h2 className="text-4xl md:text-5xl font-serif text-[#A68F81] mb-6">{t("landing.supportMod.title", "How can we help?")}</h2>
                <div className="relative max-w-xl mx-auto">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border/60 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-lg transition-all" 
                    placeholder={t("landing.supportMod.searchPlaceholder", "Search for articles, guides...")} 
                  />
                </div>
              </div>

              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-[#3D2B2B] mb-8 text-center">{t("landing.supportMod.browseByTopic", "Browse by Topic")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-[#3D2B2B] mb-2">{cat.title}</h3>
                      <p className="text-[#8D8D8D] text-sm">{cat.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold text-[#3D2B2B] mb-8 text-center">{t("landing.supportMod.faqTitle", "Frequently Asked Questions")}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="bg-white rounded-2xl border border-border/40 shadow-sm mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-[#3D2B2B] hover:text-rose-500 hover:no-underline">
                        {t("landing.supportMod.faq1Q", "How do I cancel or reschedule an appointment?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#8D8D8D] pb-6">
                        {t("landing.supportMod.faq1A", "You can manage your appointments from your Dashboard. Simply click on the booking you wish to change and select 'Cancel' or 'Reschedule'.")}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-white rounded-2xl border border-border/40 shadow-sm mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-[#3D2B2B] hover:text-rose-500 hover:no-underline">
                        {t("landing.supportMod.faq2Q", "Is my payment information secure?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#8D8D8D] pb-6">
                        {t("landing.supportMod.faq2A", "Yes, all payments are processed through our secure, PCI-compliant payment partners. We do not store your credit card information.")}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="bg-white rounded-2xl border border-border/40 shadow-sm mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-[#3D2B2B] hover:text-rose-500 hover:no-underline">
                        {t("landing.supportMod.faq3Q", "How do I list my business on Haybooking?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#8D8D8D] pb-6">
                        {t("landing.supportMod.faq3A", "Click on 'For Businesses' in the footer or 'Register as a Business Partner' during sign up to create your partner account.")}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="bg-white rounded-2xl border border-border/40 shadow-sm mb-4 px-6">
                      <AccordionTrigger className="text-left font-bold text-[#3D2B2B] hover:text-rose-500 hover:no-underline">
                        {t("landing.supportMod.faq4Q", "What happens if a specialist doesn't show up?")}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#8D8D8D] pb-6">
                        {t("landing.supportMod.faq4A", "If a service provider fails to fulfill an appointment, please contact our support team immediately. We will investigate and ensure you receive a full refund.")}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="mt-16 bg-white rounded-3xl p-10 border border-border/40 shadow-sm text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-[#3D2B2B] mb-4">{t("landing.supportMod.stillNeedHelp", "Still need help?")}</h2>
                  <p className="text-[#8D8D8D] mb-8">{t("landing.supportMod.supportTeamDesc", "Our support team is always ready to help you with any questions you might have.")}</p>
                  <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-[#8165B0] text-white rounded-xl font-medium hover:bg-[#6f5596] transition-colors">
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
