"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail, Phone, MapPin, ChevronRight } from "lucide-react"

export function CompanyLinks() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<"about" | "contact" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual API submission
    alert("Thank you! Your message has been sent successfully.");
    setActiveModal(null);
  };

  return (
    <>
      <ul className="space-y-2.5">
        <li>
          <button 
            onClick={() => setActiveModal("about")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.aboutUs", "About Us")}</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveModal("contact")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.contact", "Contact")}</span>
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-6xl p-6 md:p-10 border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">
            {activeModal === "about" ? t("landing.aboutUs", "About Us") : t("landing.contact", "Contact")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {activeModal === "about" ? "Learn more about our company." : "Get in touch with us."}
          </DialogDescription>

          {activeModal === "about" && (
            <div className="w-full">
              <div className="text-center max-w-4xl mx-auto mb-14">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                  About Us
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{t("landing.companyMod.aboutTitle", "Connecting You With")} <span className="text-[#FF385C]">{t("landing.companyMod.aboutHighlight", "Local Excellence")}</span></h2>
                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                  {t("landing.companyMod.aboutDesc", "We're on a mission to make local services accessible, transparent, and easy to book for everyone.")}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">{t("landing.companyMod.ourStory", "Our Story")}</h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                    <p>
                      {t("landing.companyMod.story1", "Founded in 2026, Haybooking started with a simple idea: booking a local service should be as easy as buying a product online. We noticed that while e-commerce had revolutionized retail, local services were still stuck in the past with phone calls, missed connections, and unclear pricing.")}
                    </p>
                    <p>
                      {t("landing.companyMod.story2", "We built a platform that bridges the gap between skilled professionals and people looking for their services. Today, we're proud to support thousands of local businesses while helping millions of customers find exactly what they need.")}
                    </p>
                  </div>
                </div>
                <div className="relative h-[360px] sm:h-[400px] rounded-3xl overflow-hidden shadow-md border border-slate-200/80">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" 
                    alt="Team collaboration" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-10 text-center tracking-tight">{t("landing.companyMod.ourValues", "Our Values")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50/80 p-8 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                    <div className="w-14 h-14 bg-[#FFF0F3] text-[#FF385C] rounded-2xl flex items-center justify-center mx-auto mb-5 font-extrabold text-xl">1</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{t("landing.companyMod.val1Title", "Simplicity First")}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{t("landing.companyMod.val1Desc", "We believe software should be intuitive. If it requires a manual, we've designed it wrong.")}</p>
                  </div>
                  <div className="bg-slate-50/80 p-8 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                    <div className="w-14 h-14 bg-[#FFF0F3] text-[#FF385C] rounded-2xl flex items-center justify-center mx-auto mb-5 font-extrabold text-xl">2</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{t("landing.companyMod.val2Title", "Empower Local")}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{t("landing.companyMod.val2Desc", "Our success is measured by the success of the small businesses that run on our platform.")}</p>
                  </div>
                  <div className="bg-slate-50/80 p-8 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                    <div className="w-14 h-14 bg-[#FFF0F3] text-[#FF385C] rounded-2xl flex items-center justify-center mx-auto mb-5 font-extrabold text-xl">3</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{t("landing.companyMod.val3Title", "Transparency")}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{t("landing.companyMod.val3Desc", "No hidden fees, no fake reviews, no surprises. What you see is exactly what you get.")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModal === "contact" && (
            <div className="w-full">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                  Contact Us
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{t("landing.companyMod.contactTitle", "Contact Us")}</h2>
                <p className="text-base text-slate-500 font-medium max-w-xl mx-auto">
                  {t("landing.companyMod.contactDesc", "We're here to help and answer any question you might have. We look forward to hearing from you.")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">{t("landing.companyMod.getInTouch", "Get in Touch")}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8">
                    {t("landing.companyMod.getInTouchDesc", "Fill out the form and our team will get back to you within 24 hours.")}
                  </p>
                  
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">{t("landing.companyMod.name", "Name")}</label>
                      <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm text-slate-900 transition-colors" placeholder={t("landing.companyMod.namePlaceholder", "Your name")} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">{t("landing.companyMod.email", "Email")}</label>
                      <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm text-slate-900 transition-colors" placeholder={t("landing.companyMod.emailPlaceholder", "your@email.com")} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">{t("landing.companyMod.message", "Message")}</label>
                      <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] text-sm text-slate-900 transition-colors" placeholder={t("landing.companyMod.messagePlaceholder", "How can we help?")}></textarea>
                    </div>
                    <button type="submit" className="w-full py-3.5 px-6 text-white bg-[#FF385C] hover:bg-[#E0304F] rounded-full font-bold shadow-md shadow-[#FF385C]/25 transition-all text-sm active:scale-95">
                      {t("landing.companyMod.sendMessage", "Send Message")}
                    </button>
                  </form>
                </div>

                <div className="bg-slate-50/80 rounded-3xl p-8 border border-slate-200/80 shadow-2xs h-fit">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-8">{t("landing.companyMod.contactInfo", "Contact Information")}</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3.5 bg-[#FFF0F3] text-[#FF385C] rounded-2xl shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm mb-0.5">{t("landing.companyMod.emailLabel", "Email")}</p>
                        <p className="text-slate-500 text-sm font-medium">{t("landing.companyMod.emailValue", "support@haybooking.com")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3.5 bg-[#FFF0F3] text-[#FF385C] rounded-2xl shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm mb-0.5">{t("landing.companyMod.phoneLabel", "Phone")}</p>
                        <p className="text-slate-500 text-sm font-medium">{t("landing.companyMod.phoneValue", "+1 (555) 123-4567")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3.5 bg-[#FFF0F3] text-[#FF385C] rounded-2xl shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm mb-0.5">{t("landing.companyMod.officeLabel", "Office")}</p>
                        <p className="text-slate-500 text-sm font-medium whitespace-pre-line">{t("landing.companyMod.officeValueReal", "15 Tumanyan St\nYerevan 0001, Armenia")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-right">
            <button onClick={() => setActiveModal(null)} className="px-6 py-2.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-full font-bold shadow-xs transition-all text-sm active:scale-95">
              {t("landing.companyMod.close", "Close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
