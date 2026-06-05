"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function ProductLinks() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<"customers" | "businesses" | "pricing" | null>(null)

  return (
    <>
      <ul className="space-y-3">
        <li>
          <button onClick={() => setActiveModal("customers")} className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors">
            {t("landing.forCustomers")}
          </button>
        </li>
        <li>
          <button onClick={() => setActiveModal("businesses")} className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors">
            {t("landing.forBusinesses")}
          </button>
        </li>
        <li>
          <button onClick={() => setActiveModal("pricing")} className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors">
            {t("landing.pricing", "Pricing")}
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-7xl p-6 md:p-10 border-none bg-[#FDFBF7]/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
          {/* Visually hidden titles for screen readers */}
          <DialogTitle className="sr-only">
            {activeModal === "pricing" && "Pricing Plans"}
            {activeModal === "customers" && "For Customers"}
            {activeModal === "businesses" && "For Businesses"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Information about our {activeModal} offerings.
          </DialogDescription>

          {activeModal === "pricing" && (
            <div className="w-full flex flex-col items-center">
              <div className="text-center max-w-2xl mb-8">
                <h2 className="text-3xl md:text-4xl font-serif text-[#A68F81] mb-2">{t("landing.pricingMod.title")}</h2>
                <p className="text-sm md:text-base text-[#8D8D8D]">{t("landing.pricingMod.desc")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {/* Free Plan */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-[#52C47A] shadow-sm flex flex-col pt-8">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#52C47A] text-white px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase">
                    {t("landing.pricingMod.yourPlan")}
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-serif text-[#3D2B2B] mb-1">{t("landing.pricingMod.free")}</h3>
                    <div className="text-4xl md:text-5xl font-light text-[#52C47A] mb-1">$0</div>
                    <p className="text-[10px] md:text-xs text-[#8D8D8D]">{t("landing.pricingMod.freeDesc")}</p>
                  </div>
                  
                  <div className="text-[9px] md:text-[10px] font-bold text-[#8D8D8D] uppercase tracking-wider mb-3 border-b border-[#F0F0F0] pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc1")} color="text-[#52C47A]" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc1")} color="text-[#52C47A]" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc1")} color="text-[#52C47A]" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc1")} color="text-[#52C47A]" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc1")} color="text-[#52C47A]" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc1")} color="text-[#52C47A]" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-[#52C47A] text-white rounded-lg font-bold shadow-sm hover:bg-[#45a868] transition-colors text-center block">
                    {t("landing.pricingMod.currentPlan")}
                  </Link>
                </div>

                {/* Monthly Plan */}
                <div className="relative bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm flex flex-col pt-8">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-serif text-[#3D2B2B] mb-1">{t("landing.pricingMod.monthly")}</h3>
                    <div className="text-4xl md:text-5xl font-light text-[#E1C27A] mb-1">$20</div>
                    <p className="text-[10px] md:text-xs text-[#8D8D8D]">{t("landing.pricingMod.monthlyDesc")}</p>
                  </div>
                  
                  <div className="text-[9px] md:text-[10px] font-bold text-[#8D8D8D] uppercase tracking-wider mb-3 border-b border-[#F0F0F0] pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc2")} color="text-[#E1C27A]" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc2")} color="text-[#E1C27A]" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc2")} color="text-[#E1C27A]" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc2")} color="text-[#E1C27A]" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc2")} color="text-[#E1C27A]" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc2")} color="text-[#E1C27A]" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-white text-[#E1C27A] border border-[#E1C27A] rounded-lg font-bold shadow-sm hover:bg-[#FDF9ED] transition-colors text-center block">
                    {t("landing.pricingMod.selectPlan")}
                  </Link>
                </div>

                {/* Half-Year Plan */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-[#8165B0] shadow-md flex flex-col pt-8 scale-[1.02] z-10">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#8165B0] text-white px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase whitespace-nowrap shadow-sm">
                    {t("landing.pricingMod.mostPopular")}
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-serif text-[#3D2B2B] mb-1">{t("landing.pricingMod.halfYear")}</h3>
                    <div className="text-4xl md:text-5xl font-light text-[#8165B0] mb-1">$100</div>
                    <p className="text-[10px] md:text-xs text-[#8D8D8D]">{t("landing.pricingMod.every6Months")} <span className="text-[#8165B0] font-bold ml-1 bg-[#F5F2F9] px-1 py-0.5 rounded">{t("landing.pricingMod.save17")}</span></p>
                  </div>
                  
                  <div className="text-[9px] md:text-[10px] font-bold text-[#8D8D8D] uppercase tracking-wider mb-3 border-b border-[#F0F0F0] pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc3")} color="text-[#8165B0]" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc3")} color="text-[#8165B0]" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc3")} color="text-[#8165B0]" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc3")} color="text-[#8165B0]" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc3")} color="text-[#8165B0]" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc3")} color="text-[#8165B0]" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-[#8165B0] text-white rounded-lg font-bold shadow-sm hover:bg-[#6f5596] transition-colors text-center block">
                    {t("landing.pricingMod.selectPlan")}
                  </Link>
                </div>

                {/* Yearly Plan */}
                <div className="relative bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm flex flex-col pt-8">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#EA6B4E] text-white px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase shadow-sm">
                    {t("landing.pricingMod.bestValue")}
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-serif text-[#3D2B2B] mb-1">{t("landing.pricingMod.yearly")}</h3>
                    <div className="text-4xl md:text-5xl font-light text-[#EA6B4E] mb-1">$180</div>
                    <p className="text-[10px] md:text-xs text-[#8D8D8D]">{t("landing.pricingMod.billedAnnually")} <span className="text-[#EA6B4E] font-bold ml-1 bg-[#FDF4F2] px-1 py-0.5 rounded">{t("landing.pricingMod.save25")}</span></p>
                  </div>
                  
                  <div className="text-[9px] md:text-[10px] font-bold text-[#8D8D8D] uppercase tracking-wider mb-3 border-b border-[#F0F0F0] pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc4")} color="text-[#EA6B4E]" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc4")} color="text-[#EA6B4E]" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc4")} color="text-[#EA6B4E]" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc4")} color="text-[#EA6B4E]" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc4")} color="text-[#EA6B4E]" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc4")} color="text-[#EA6B4E]" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-white text-[#EA6B4E] border border-[#EA6B4E] rounded-lg font-bold shadow-sm hover:bg-[#FDF4F2] transition-colors text-center block">
                    {t("landing.pricingMod.selectPlan")}
                  </Link>
                </div>

              </div>
            </div>
          )}

          {activeModal === "customers" && (
             <div className="w-full p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-serif text-[#A68F81] mb-6">{t("landing.customersMod.title")}</h2>
              <p className="text-lg text-[#8D8D8D] mb-12">{t("landing.customersMod.desc")}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <InfoCard 
                  title={t("landing.customersMod.card1Title")} 
                  desc={t("landing.customersMod.card1Desc")} 
                  icon="🔍"
                />
                <InfoCard 
                  title={t("landing.customersMod.card2Title")} 
                  desc={t("landing.customersMod.card2Desc")} 
                  icon="⚡"
                />
                <InfoCard 
                  title={t("landing.customersMod.card3Title")} 
                  desc={t("landing.customersMod.card3Desc")} 
                  icon="📱"
                />
                <InfoCard 
                  title={t("landing.customersMod.card4Title")} 
                  desc={t("landing.customersMod.card4Desc")} 
                  icon="🗓️"
                />
              </div>

              <div className="mt-12 text-center">
                <Link href="/auth?tab=signup" className="inline-block px-8 py-3 bg-[#8165B0] hover:bg-[#6f5596] text-white rounded-xl font-bold transition-colors">
                  {t("landing.getStartedNow", "Get Started Now")}
                </Link>
              </div>
            </div>
          )}

          {activeModal === "businesses" && (
            <div className="w-full p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-serif text-[#A68F81] mb-6">{t("landing.businessesMod.title")}</h2>
              <p className="text-lg text-[#8D8D8D] mb-12">{t("landing.businessesMod.desc")}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <InfoCard 
                  title={t("landing.businessesMod.card1Title")} 
                  desc={t("landing.businessesMod.card1Desc")} 
                  icon="🔄"
                />
                <InfoCard 
                  title={t("landing.businessesMod.card2Title")} 
                  desc={t("landing.businessesMod.card2Desc")} 
                  icon="👥"
                />
                <InfoCard 
                  title={t("landing.businessesMod.card3Title")} 
                  desc={t("landing.businessesMod.card3Desc")} 
                  icon="⭐"
                />
                <InfoCard 
                  title={t("landing.businessesMod.card4Title")} 
                  desc={t("landing.businessesMod.card4Desc")} 
                  icon="📈"
                />
              </div>

              <div className="mt-12 text-center">
                <Link href="/auth?tab=signup" className="inline-block px-8 py-3 bg-[#8165B0] hover:bg-[#6f5596] text-white rounded-xl font-bold transition-colors">
                  {t("landing.getStartedNow", "Get Started Now")}
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function FeatureItem({ title, desc, color }: { title: string, desc: string, color: string }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={cn("h-4 w-4 shrink-0 mt-0.5", color)} />
      <div>
        <h4 className="text-sm font-bold text-[#3D2B2B]">{title}</h4>
        <p className="text-xs text-[#8D8D8D] leading-tight mt-0.5">{desc}</p>
      </div>
    </li>
  )
}

function InfoCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#3D2B2B] mb-2">{title}</h3>
      <p className="text-sm text-[#8D8D8D]">{desc}</p>
    </div>
  )
}
