"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function ProductLinks() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<"customers" | "businesses" | "pricing" | null>(null)

  return (
    <>
      <ul className="space-y-2.5">
        <li>
          <button 
            onClick={() => setActiveModal("customers")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.forCustomers", "For Customers")}</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveModal("businesses")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.forBusinesses", "For Businesses")}</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveModal("pricing")} 
            className="group/link text-sm font-medium text-slate-600 hover:text-[#FF385C] flex items-center gap-1.5 transition-all duration-200 text-left w-full py-1"
          >
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 text-[#FF385C] transition-all duration-200 shrink-0" />
            <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">{t("landing.pricing", "Pricing")}</span>
          </button>
        </li>
      </ul>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] lg:max-w-7xl p-6 md:p-10 border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
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
              <div className="text-center max-w-2xl mb-10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                  Transparent Pricing
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">{t("landing.pricingMod.title")}</h2>
                <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">{t("landing.pricingMod.desc")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {/* Free Plan */}
                <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col pt-8 hover:shadow-md transition-all">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t("landing.pricingMod.free")}</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">$0</div>
                    <p className="text-xs text-slate-500 font-medium">{t("landing.pricingMod.freeDesc")}</p>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc1")} color="text-emerald-500" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc1")} color="text-emerald-500" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc1")} color="text-emerald-500" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc1")} color="text-emerald-500" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc1")} color="text-emerald-500" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc1")} color="text-emerald-500" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-xs transition-all text-center block text-sm active:scale-95">
                    {t("landing.pricingMod.currentPlan")}
                  </Link>
                </div>

                {/* Monthly Plan */}
                <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col pt-8 hover:shadow-md transition-all">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t("landing.pricingMod.monthly")}</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">$20</div>
                    <p className="text-xs text-slate-500 font-medium">{t("landing.pricingMod.monthlyDesc")}</p>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc2")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc2")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc2")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc2")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc2")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc2")} color="text-[#FF385C]" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 rounded-full font-bold shadow-2xs hover:bg-slate-50 transition-all text-center block text-sm active:scale-95">
                    {t("landing.pricingMod.selectPlan")}
                  </Link>
                </div>

                {/* Half-Year Plan (Featured Most Popular) */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-[#FF385C] shadow-xl shadow-[#FF385C]/10 flex flex-col pt-8 scale-[1.02] z-10">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF385C] text-white px-3.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap shadow-xs">
                    {t("landing.pricingMod.mostPopular")}
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t("landing.pricingMod.halfYear")}</h3>
                    <div className="text-4xl font-extrabold text-[#FF385C] mb-1">$100</div>
                    <p className="text-xs text-slate-500 font-medium">{t("landing.pricingMod.every6Months")} <span className="text-[#FF385C] font-bold ml-1 bg-[#FFF0F3] px-1.5 py-0.5 rounded-full">{t("landing.pricingMod.save17")}</span></p>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc3")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc3")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc3")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc3")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc3")} color="text-[#FF385C]" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc3")} color="text-[#FF385C]" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-full font-bold shadow-md shadow-[#FF385C]/25 transition-all text-center block text-sm active:scale-95">
                    {t("landing.pricingMod.selectPlan")}
                  </Link>
                </div>

                {/* Yearly Plan */}
                <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col pt-8 hover:shadow-md transition-all">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
                    {t("landing.pricingMod.bestValue")}
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t("landing.pricingMod.yearly")}</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">$180</div>
                    <p className="text-xs text-slate-500 font-medium">{t("landing.pricingMod.billedAnnually")} <span className="text-slate-900 font-bold ml-1 bg-slate-100 px-1.5 py-0.5 rounded-full">{t("landing.pricingMod.save25")}</span></p>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{t("landing.pricingMod.whatsIncluded")}</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <FeatureItem title={t("landing.pricingMod.feat1Title")} desc={t("landing.pricingMod.feat1Desc4")} color="text-slate-900" />
                    <FeatureItem title={t("landing.pricingMod.feat2Title")} desc={t("landing.pricingMod.feat2Desc4")} color="text-slate-900" />
                    <FeatureItem title={t("landing.pricingMod.feat3Title")} desc={t("landing.pricingMod.feat3Desc4")} color="text-slate-900" />
                    <FeatureItem title={t("landing.pricingMod.feat4Title")} desc={t("landing.pricingMod.feat4Desc4")} color="text-slate-900" />
                    <FeatureItem title={t("landing.pricingMod.feat5Title")} desc={t("landing.pricingMod.feat5Desc4")} color="text-slate-900" />
                    <FeatureItem title={t("landing.pricingMod.feat6Title")} desc={t("landing.pricingMod.feat6Desc4")} color="text-slate-900" />
                  </ul>
                  
                  <Link href="/auth?tab=signup" className="w-full py-3 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 rounded-full font-bold shadow-2xs hover:bg-slate-50 transition-all text-center block text-sm active:scale-95">
                    {t("landing.pricingMod.selectPlan")}
                  </Link>
                </div>

              </div>
            </div>
          )}

          {activeModal === "customers" && (
             <div className="w-full p-6 md:p-10 text-center max-w-4xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                For Customers
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{t("landing.customersMod.title")}</h2>
              <p className="text-base text-slate-500 font-medium mb-10 max-w-xl mx-auto">{t("landing.customersMod.desc")}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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

              <div className="mt-10 text-center">
                <Link href="/auth?tab=signup" className="inline-block px-8 py-3.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-full font-bold shadow-md shadow-[#FF385C]/25 transition-all text-sm active:scale-95">
                  {t("landing.getStartedNow", "Get Started Now")}
                </Link>
              </div>
            </div>
          )}

          {activeModal === "businesses" && (
            <div className="w-full p-6 md:p-10 text-center max-w-4xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full mb-3 inline-block">
                For Businesses
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{t("landing.businessesMod.title")}</h2>
              <p className="text-base text-slate-500 font-medium mb-10 max-w-xl mx-auto">{t("landing.businessesMod.desc")}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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

              <div className="mt-10 text-center">
                <Link href="/auth?tab=signup" className="inline-block px-8 py-3.5 bg-[#FF385C] hover:bg-[#E0304F] text-white rounded-full font-bold shadow-md shadow-[#FF385C]/25 transition-all text-sm active:scale-95">
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
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 leading-tight mt-0.5">{desc}</p>
      </div>
    </li>
  )
}

function InfoCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-slate-50/80 hover:bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#FF385C]/30 transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
