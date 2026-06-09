"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail, Phone, MapPin } from "lucide-react"

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
      <ul className="space-y-3">
        <li>
          <button onClick={() => setActiveModal("about")} className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors">
            {t("landing.aboutUs", "About Us")}
          </button>
        </li>
        <li>
          <button onClick={() => setActiveModal("contact")} className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors">
            {t("landing.contact", "Contact")}
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-6xl p-6 md:p-10 border-none bg-[#FDFBF7]/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">
            {activeModal === "about" ? t("landing.aboutUs", "About Us") : t("landing.contact", "Contact")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {activeModal === "about" ? "Learn more about our company." : "Get in touch with us."}
          </DialogDescription>

          {activeModal === "about" && (
            <div className="w-full">
              <div className="text-center max-w-4xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-serif text-[#A68F81] mb-6">{t("landing.companyMod.aboutTitle", "Connecting You With")} <span className="text-[#8165B0]">{t("landing.companyMod.aboutHighlight", "Local Excellence")}</span></h2>
                <p className="text-lg md:text-xl text-[#8D8D8D] leading-relaxed">
                  {t("landing.companyMod.aboutDesc", "We're on a mission to make local services accessible, transparent, and easy to book for everyone.")}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                <div>
                  <h3 className="text-3xl font-bold text-[#3D2B2B] mb-6">{t("landing.companyMod.ourStory", "Our Story")}</h3>
                  <div className="space-y-4 text-[#555] leading-relaxed">
                    <p>
                      {t("landing.companyMod.story1", "Founded in 2026, Haybooking started with a simple idea: booking a local service should be as easy as buying a product online. We noticed that while e-commerce had revolutionized retail, local services were still stuck in the past with phone calls, missed connections, and unclear pricing.")}
                    </p>
                    <p>
                      {t("landing.companyMod.story2", "We built a platform that bridges the gap between skilled professionals and people looking for their services. Today, we're proud to support thousands of local businesses while helping millions of customers find exactly what they need.")}
                    </p>
                  </div>
                </div>
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-lg border border-border/40">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" 
                    alt="Team collaboration" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#3D2B2B] mb-10 text-center">{t("landing.companyMod.ourValues", "Our Values")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-border/40 shadow-sm text-center">
                    <div className="w-16 h-16 bg-[#FDF9ED] text-[#E1C27A] rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl">1</div>
                    <h4 className="text-xl font-bold text-[#3D2B2B] mb-3">{t("landing.companyMod.val1Title", "Simplicity First")}</h4>
                    <p className="text-[#8D8D8D]">{t("landing.companyMod.val1Desc", "We believe software should be intuitive. If it requires a manual, we've designed it wrong.")}</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-border/40 shadow-sm text-center">
                    <div className="w-16 h-16 bg-[#F5F2F9] text-[#8165B0] rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl">2</div>
                    <h4 className="text-xl font-bold text-[#3D2B2B] mb-3">{t("landing.companyMod.val2Title", "Empower Local")}</h4>
                    <p className="text-[#8D8D8D]">{t("landing.companyMod.val2Desc", "Our success is measured by the success of the small businesses that run on our platform.")}</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-border/40 shadow-sm text-center">
                    <div className="w-16 h-16 bg-[#E8F8F0] text-[#52C47A] rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl">3</div>
                    <h4 className="text-xl font-bold text-[#3D2B2B] mb-3">{t("landing.companyMod.val3Title", "Transparency")}</h4>
                    <p className="text-[#8D8D8D]">{t("landing.companyMod.val3Desc", "No hidden fees, no fake reviews, no surprises. What you see is exactly what you get.")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModal === "contact" && (
            <div className="w-full">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-serif text-[#A68F81] mb-6">{t("landing.companyMod.contactTitle", "Contact Us")}</h2>
                <p className="text-lg text-[#8D8D8D]">
                  {t("landing.companyMod.contactDesc", "We're here to help and answer any question you might have. We look forward to hearing from you.")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div>
                  <h3 className="text-2xl font-bold text-[#3D2B2B] mb-6">{t("landing.companyMod.getInTouch", "Get in Touch")}</h3>
                  <p className="text-[#8D8D8D] mb-8">
                    {t("landing.companyMod.getInTouchDesc", "Fill out the form and our team will get back to you within 24 hours.")}
                  </p>
                  
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-[#3D2B2B] mb-2">{t("landing.companyMod.name", "Name")}</label>
                      <input required type="text" className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#8165B0]/20 focus:border-[#8165B0] transition-colors" placeholder={t("landing.companyMod.namePlaceholder", "Your name")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3D2B2B] mb-2">{t("landing.companyMod.email", "Email")}</label>
                      <input required type="email" className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#8165B0]/20 focus:border-[#8165B0] transition-colors" placeholder={t("landing.companyMod.emailPlaceholder", "your@email.com")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3D2B2B] mb-2">{t("landing.companyMod.message", "Message")}</label>
                      <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#8165B0]/20 focus:border-[#8165B0] transition-colors" placeholder={t("landing.companyMod.messagePlaceholder", "How can we help?")}></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 px-6 text-white bg-[#8165B0] hover:bg-[#6f5596] rounded-xl font-bold transition-colors">
                      {t("landing.companyMod.sendMessage", "Send Message")}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-border/40 shadow-sm h-fit">
                  <h3 className="text-xl font-bold text-[#3D2B2B] mb-8">{t("landing.companyMod.contactInfo", "Contact Information")}</h3>
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-[#F5F2F9] text-[#8165B0] rounded-2xl">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[#3D2B2B] mb-1">{t("landing.companyMod.emailLabel", "Email")}</p>
                        <p className="text-[#8D8D8D]">{t("landing.companyMod.emailValue", "support@haybooking.com")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-[#F5F2F9] text-[#8165B0] rounded-2xl">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[#3D2B2B] mb-1">{t("landing.companyMod.phoneLabel", "Phone")}</p>
                        <p className="text-[#8D8D8D]">{t("landing.companyMod.phoneValue", "+1 (555) 123-4567")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-[#F5F2F9] text-[#8165B0] rounded-2xl">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[#3D2B2B] mb-1">{t("landing.companyMod.officeLabel", "Office")}</p>
                        <p className="text-[#8D8D8D] whitespace-pre-line">{t("landing.companyMod.officeValueReal", "15 Tumanyan St\nYerevan 0001, Armenia")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/40 text-right">
            <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors">
              {t("landing.companyMod.close", "Close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
