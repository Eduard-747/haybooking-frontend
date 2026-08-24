"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { Star, ShieldCheck, Clock, Sparkles, CheckCircle2, Scissors, Dumbbell, HeartPulse, Utensils, Briefcase } from "lucide-react"

const BACKGROUND_SLIDES = [
  {
    id: "barbershop",
    badgeKey: "auth.badgeBarbershop",
    badgeDefault: "BARBERSHOP & GROOMING",
    headlineKey: "auth.headlineBarbershop",
    headlineDefault: "Book master barbers & beard stylists in seconds.",
    subcopyKey: "auth.subcopyBarbershop",
    subcopyDefault: "Discover top-rated barbershops, precision haircuts, and hot towel beard shaves near you.",
    serviceKey: "auth.serviceBarbershop",
    serviceDefault: "Gentleman Haircut & Beard Trim",
    clientNameKey: "auth.clientAlex",
    clientNameDefault: "Alexandre M.",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime2m",
    relTimeDefault: "2m ago",
    locationKey: "auth.locationBarbershop",
    locationDefault: "Luxury Barbershop Lounge • Yerevan",
    image: "/gen-barbershop.png",
    icon: Scissors,
  },
  {
    id: "beauty",
    badgeKey: "auth.badgeBeauty",
    badgeDefault: "BEAUTY & SALON SERVICES",
    headlineKey: "auth.headlineBeauty",
    headlineDefault: "Book top hair stylists & makeup artists in seconds.",
    subcopyKey: "auth.subcopyBeauty",
    subcopyDefault: "Reserve luxury balayage, facial glam, bridal styling, and manicure appointments instantly.",
    serviceKey: "auth.serviceBeauty",
    serviceDefault: "Full Beauty & Makeup Styling",
    clientNameKey: "auth.clientElena",
    clientNameDefault: "Elena S.",
    clientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTimeJustNow",
    relTimeDefault: "Just now",
    locationKey: "auth.locationBeauty",
    locationDefault: "Central Beauty Salon • Yerevan",
    image: "/gen-beauty.png",
    icon: Sparkles,
  },
  {
    id: "spa",
    badgeKey: "auth.badgeSpa",
    badgeDefault: "SPA & HEALTH CLINICS",
    headlineKey: "auth.headlineSpa",
    headlineDefault: "Book luxury spa treatments & massage therapists in seconds.",
    subcopyKey: "auth.subcopySpa",
    subcopyDefault: "Relax with therapeutic deep-tissue massages, organic facials, and wellness rituals.",
    serviceKey: "auth.serviceSpa",
    serviceDefault: "Therapeutic Facial & Massage",
    clientNameKey: "auth.clientSofia",
    clientNameDefault: "Sofia K.",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime5m",
    relTimeDefault: "5m ago",
    locationKey: "auth.locationSpa",
    locationDefault: "Luxury Spa Sanctuary • Yerevan",
    image: "/gen-spa.png",
    icon: HeartPulse,
  },
  {
    id: "fitness",
    badgeKey: "auth.badgeFitness",
    badgeDefault: "FITNESS & WELLNESS STUDIO",
    headlineKey: "auth.headlineFitness",
    headlineDefault: "Book personal trainers & yoga sessions in seconds.",
    subcopyKey: "auth.subcopyFitness",
    subcopyDefault: "Join group sunset pilates, 1-on-1 fitness coaching, and holistic wellness classes.",
    serviceKey: "auth.serviceFitness",
    serviceDefault: "Group Yoga & Sunset Meditation",
    clientNameKey: "auth.clientDavid",
    clientNameDefault: "David H.",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime1m",
    relTimeDefault: "1m ago",
    locationKey: "auth.locationFitness",
    locationDefault: "Wellness Sanctuary • Yerevan",
    image: "/gen-fitness.png",
    icon: Dumbbell,
  },
  {
    id: "consulting",
    badgeKey: "auth.badgeConsulting",
    badgeDefault: "SPECIALISTS & CONSULTING",
    headlineKey: "auth.headlineConsulting",
    headlineDefault: "Book executive consultants & legal pros in seconds.",
    subcopyKey: "auth.subcopyConsulting",
    subcopyDefault: "Schedule strategic business consultations, tax advisory, and professional executive meetings.",
    serviceKey: "auth.serviceConsulting",
    serviceDefault: "Business & Legal Consultation",
    clientNameKey: "auth.clientArmen",
    clientNameDefault: "Armen B.",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime3m",
    relTimeDefault: "3m ago",
    locationKey: "auth.locationConsulting",
    locationDefault: "Executive Sky Suite • Yerevan",
    image: "/gen-consulting.png",
    icon: Briefcase,
  },
  {
    id: "dining",
    badgeKey: "auth.badgeDining",
    badgeDefault: "RESTAURANTS & CAFES",
    headlineKey: "auth.headlineDining",
    headlineDefault: "Reserve VIP restaurant tables & fine dining in seconds.",
    subcopyKey: "auth.subcopyDining",
    subcopyDefault: "Discover gourmet dining lounges, chef tasting menus, and romantic dinner reservations.",
    serviceKey: "auth.serviceDining",
    serviceDefault: "VIP Table Reservation & Dining",
    clientNameKey: "auth.clientAni",
    clientNameDefault: "Ani G.",
    clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTimeJustNow",
    relTimeDefault: "Just now",
    locationKey: "auth.locationDining",
    locationDefault: "Gourmet Lounge • Yerevan",
    image: "/gen-dining.png",
    icon: Utensils,
  },
]

export function AuthBranding() {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const active = BACKGROUND_SLIDES[currentSlide]
  const ActiveIcon = active.icon

  return (
    <aside className="hidden lg:w-[54%] xl:w-[56%] lg:flex relative overflow-hidden h-full bg-slate-50/60 justify-center items-center p-8 select-none">
      {/* Dynamic Ultra-Soft Crossfade Background Slideshow */}
      {BACKGROUND_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
            }`}
          >
            <Image
              src={slide.image}
              alt={t(slide.badgeKey, slide.badgeDefault)}
              fill
              className={`object-cover object-center saturate-[1.08] contrast-[1.02] brightness-[1.03] transition-transform duration-7000 ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
              priority={index === 0}
            />
          </div>
        )
      })}

      {/* Light Glassmorphic Overlay & Left Fade */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/65 via-white/35 to-transparent z-1" />
      <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none z-20" />

      {/* Slide Navigation Indicator Pills */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
        {BACKGROUND_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-6 bg-[#FF385C]" : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Floating Glassmorphic Container Structure */}
      <div className="relative z-10 w-full max-w-lg flex flex-col justify-center h-full py-8 space-y-6">
        
        {/* Center: Single Unified Glass Showcase Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 transform hover:scale-[1.01] transition-all duration-300">
          <div>
            {/* Dynamic Active Category Badge */}
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-3 shadow-2xs transition-all duration-300">
              <ActiveIcon className="w-3.5 h-3.5 text-[#FF385C]" />
              {t(active.badgeKey, active.badgeDefault)}
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight transition-all duration-500">
              {t(active.headlineKey, active.headlineDefault)}
            </h3>
            <p className="text-slate-600 text-sm font-medium mt-2 leading-relaxed transition-all duration-500">
              {t(active.subcopyKey, active.subcopyDefault)}
            </p>
          </div>

          {/* Real-Time Live Activity Booking Card */}
          <div className="bg-slate-50/90 border border-slate-200/90 text-slate-900 rounded-2xl p-4 shadow-2xs space-y-2.5 transition-all duration-300">
            {/* Header: Pulsing Live Indicator + Activity Badge */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#FF385C]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF385C] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF385C]"></span>
                </span>
                {t("auth.liveActivity", "LIVE ACTIVITY")}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t("auth.justBooked", "Just Booked")}
              </span>
            </div>

            {/* Real-Time Client Action Ticker Item */}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="relative shrink-0">
                <img
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                  src={active.clientAvatar}
                  alt={t(active.clientNameKey, active.clientNameDefault)}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#FFF0F3] text-[#FF385C] flex items-center justify-center border border-white shadow-2xs">
                  <ActiveIcon className="w-2.5 h-2.5" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {t(active.clientNameKey, active.clientNameDefault)} <span className="font-normal text-slate-600">{t("auth.bookedVerb", "booked")}</span> {t(active.serviceKey, active.serviceDefault)}
                </p>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="text-[#FF385C] font-semibold">{t(active.relTimeKey, active.relTimeDefault)}</span>
                  <span>•</span>
                  <span>{t(active.locationKey, active.locationDefault)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Chips */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-2.5 rounded-2xl text-center shadow-xs hover:border-[#FF385C]/30 hover:shadow-md transition-all flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FF385C] shrink-0" />
            <span className="text-xs font-bold text-slate-800">{t("auth.verifiedPros", "Verified Pros")}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-2.5 rounded-2xl text-center shadow-xs hover:border-[#FF385C]/30 hover:shadow-md transition-all flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-[#FF385C] shrink-0" />
            <span className="text-xs font-bold text-slate-800">{t("auth.instantBook", "Instant Book")}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-2.5 rounded-2xl text-center shadow-xs hover:border-[#FF385C]/30 hover:shadow-md transition-all flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF385C] shrink-0" />
            <span className="text-xs font-bold text-slate-800">{t("auth.zeroFees", "Zero Fees")}</span>
          </div>
        </div>

      </div>
    </aside>
  )
}

