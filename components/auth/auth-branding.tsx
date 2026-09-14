"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { Star, ShieldCheck, Clock, Sparkles, CheckCircle2, Scissors, Dumbbell, HeartPulse, Utensils, Briefcase, Car, Smile, GraduationCap, PawPrint, Camera, Zap } from "lucide-react"

const BACKGROUND_SLIDES = [
  {
    id: "fitness-1",
    badgeKey: "auth.badgeFitness",
    badgeDefault: "FITNESS & WELLNESS",
    headlineKey: "auth.headlineFitness",
    headlineDefault: "Book personal trainers & yoga sessions.",
    subcopyKey: "auth.subcopyFitness",
    subcopyDefault: "Join yoga, pilates, and personal fitness training sessions.",
    serviceKey: "auth.serviceFitness",
    serviceDefault: "Yoga & Meditation",
    clientNameKey: "auth.clientDavit",
    clientNameDefault: "Davit H.",
    initials: "DH",
    clientAvatar: null,
    relTimeKey: "auth.relTime1m",
    relTimeDefault: "1m ago",
    locationKey: "auth.locationFitness",
    locationDefault: "Yerevan • Fitness Studio",
    image: "/gen-fitness.png",
    icon: Dumbbell,
  },
  {
    id: "beauty-1",
    badgeKey: "auth.badgeBeauty",
    badgeDefault: "BEAUTY & SALON",
    headlineKey: "auth.headlineBeauty",
    headlineDefault: "Book top hair stylists & makeup specialists.",
    subcopyKey: "auth.subcopyBeauty",
    subcopyDefault: "Find top salons, manicure, and hair care services.",
    serviceKey: "auth.serviceBeauty",
    serviceDefault: "Hair Coloring & Balayage",
    clientNameKey: "auth.clientElena",
    clientNameDefault: "Elena Smith",
    initials: "ES",
    clientAvatar: null,
    relTimeKey: "auth.relTimeJustNow",
    relTimeDefault: "Just now",
    locationKey: "auth.locationBeauty",
    locationDefault: "Yerevan • Beauty Salon",
    image: "/gen-beauty.png",
    icon: Sparkles,
  },
  {
    id: "barbershop-1",
    badgeKey: "auth.badgeBarbershop",
    badgeDefault: "BARBERSHOP & GROOMING",
    headlineKey: "auth.headlineBarbershop",
    headlineDefault: "Book master barbers in seconds.",
    subcopyKey: "auth.subcopyBarbershop",
    subcopyDefault: "Modern haircuts, beard styling, and grooming.",
    serviceKey: "auth.serviceBarbershop",
    serviceDefault: "Gentleman Haircut",
    clientNameKey: "auth.clientArmen",
    clientNameDefault: "Armen G.",
    initials: "AG",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime3m",
    relTimeDefault: "3m ago",
    locationKey: "auth.locationBarbershop",
    locationDefault: "Yerevan • Barbershop",
    image: "/gen-barbershop.png",
    icon: Scissors,
  },
  {
    id: "spa-1",
    badgeKey: "auth.badgeSpa",
    badgeDefault: "SPA & MASSAGE",
    headlineKey: "auth.headlineSpa",
    headlineDefault: "Book massage and spa therapy sessions.",
    subcopyKey: "auth.subcopySpa",
    subcopyDefault: "Enjoy relaxing massages, facial care, and spa rituals.",
    serviceKey: "auth.serviceSpa",
    serviceDefault: "Therapeutic Massage",
    clientNameKey: "auth.clientSophia",
    clientNameDefault: "Sophia Taylor",
    initials: "ST",
    clientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime4m",
    relTimeDefault: "4m ago",
    locationKey: "auth.locationSpa",
    locationDefault: "Yerevan • Spa Center",
    image: "/gen-spa.png",
    icon: HeartPulse,
  },
  {
    id: "dental-1",
    badgeKey: "auth.badgeDental",
    badgeDefault: "DENTISTRY",
    headlineKey: "auth.headlineDental",
    headlineDefault: "Book dental care appointments.",
    subcopyKey: "auth.subcopyDental",
    subcopyDefault: "Professional dental care, whitening, and cleaning.",
    serviceKey: "auth.serviceDental",
    serviceDefault: "Teeth Cleaning & Whitening",
    clientNameKey: "auth.clientNarek",
    clientNameDefault: "Narek S.",
    initials: "NS",
    clientAvatar: null,
    relTimeKey: "auth.relTime7m",
    relTimeDefault: "7m ago",
    locationKey: "auth.locationDental",
    locationDefault: "Yerevan • Dental Clinic",
    image: "/gen-spa.png",
    icon: Smile,
  },
  {
    id: "nails-1",
    badgeKey: "auth.badgeNails",
    badgeDefault: "MANICURE & NAILS",
    headlineKey: "auth.headlineNails",
    headlineDefault: "Book nail technicians & artists.",
    subcopyKey: "auth.subcopyNails",
    subcopyDefault: "Gel polish, pedicure, and nail care treatments.",
    serviceKey: "auth.serviceNails",
    serviceDefault: "Gel Polish Manicure",
    clientNameKey: "auth.clientLilit",
    clientNameDefault: "Lilit Hovhannisyan",
    initials: "LH",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime2m",
    relTimeDefault: "2m ago",
    locationKey: "auth.locationNails",
    locationDefault: "Yerevan • Nail Salon",
    image: "/gen-beauty.png",
    icon: Sparkles,
  },
  {
    id: "auto-1",
    badgeKey: "auth.badgeAuto",
    badgeDefault: "AUTO SPA & WASH",
    headlineKey: "auth.headlineAuto",
    headlineDefault: "Book car wash & auto detailing services.",
    subcopyKey: "auth.subcopyAuto",
    subcopyDefault: "Custom auto spa, interior deep cleaning, and polishing.",
    serviceKey: "auth.serviceAuto",
    serviceDefault: "Car Detailing Wash",
    clientNameKey: "auth.clientHayk",
    clientNameDefault: "Hayk Davtyan",
    initials: "HD",
    clientAvatar: null,
    relTimeKey: "auth.relTime5m",
    relTimeDefault: "5m ago",
    locationKey: "auth.locationAuto",
    locationDefault: "Yerevan • Auto Spa",
    image: "/gen-barbershop.png",
    icon: Car,
  },
  {
    id: "aesthetic-1",
    badgeKey: "auth.badgeAesthetic",
    badgeDefault: "AESTHETIC MEDICINE",
    headlineKey: "auth.headlineAesthetic",
    headlineDefault: "Book facial care & aesthetic specialists.",
    subcopyKey: "auth.subcopyAesthetic",
    subcopyDefault: "Modern aesthetic medicine and skin rejuvenation.",
    serviceKey: "auth.serviceAesthetic",
    serviceDefault: "Facial Care & Aesthetics",
    clientNameKey: "auth.clientAnahit",
    clientNameDefault: "Anahit T.",
    initials: "AT",
    clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime6m",
    relTimeDefault: "6m ago",
    locationKey: "auth.locationAesthetic",
    locationDefault: "Yerevan • Aesthetic Center",
    image: "/gen-beauty.png",
    icon: HeartPulse,
  },
  {
    id: "gym-1",
    badgeKey: "auth.badgeGym",
    badgeDefault: "PERSONAL TRAINING",
    headlineKey: "auth.headlineGym",
    headlineDefault: "Book personal fitness trainers.",
    subcopyKey: "auth.subcopyGym",
    subcopyDefault: "Strength training, cardio, and personalized programs.",
    serviceKey: "auth.serviceGym",
    serviceDefault: "Personal Fitness Session",
    clientNameKey: "auth.clientAlexandre",
    clientNameDefault: "Alexandre M.",
    initials: "AM",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime8m",
    relTimeDefault: "8m ago",
    locationKey: "auth.locationGym",
    locationDefault: "Yerevan • Gym",
    image: "/gen-fitness.png",
    icon: Dumbbell,
  },
  {
    id: "dining-1",
    badgeKey: "auth.badgeDining",
    badgeDefault: "RESTAURANTS & CAFES",
    headlineKey: "auth.headlineDining",
    headlineDefault: "Book VIP tables at top restaurants.",
    subcopyKey: "auth.subcopyDining",
    subcopyDefault: "Fine dining, cozy atmosphere, and instant table booking.",
    serviceKey: "auth.serviceDining",
    serviceDefault: "VIP Table Booking",
    clientNameKey: "auth.clientMariam",
    clientNameDefault: "Mariam K.",
    initials: "MK",
    clientAvatar: null,
    relTimeKey: "auth.relTime10m",
    relTimeDefault: "10m ago",
    locationKey: "auth.locationDining",
    locationDefault: "Yerevan • Restaurant",
    image: "/gen-dining.png",
    icon: Utensils,
  },
  {
    id: "consulting-1",
    badgeKey: "auth.badgeConsulting",
    badgeDefault: "BUSINESS & CONSULTING",
    headlineKey: "auth.headlineConsulting",
    headlineDefault: "Book business & legal consultants.",
    subcopyKey: "auth.subcopyConsulting",
    subcopyDefault: "Strategic consulting, tax, and legal support.",
    serviceKey: "auth.serviceConsulting",
    serviceDefault: "Legal Consultation",
    clientNameKey: "auth.clientAram",
    clientNameDefault: "Aram Rustamyan",
    initials: "AR",
    clientAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime12m",
    relTimeDefault: "12m ago",
    locationKey: "auth.locationConsulting",
    locationDefault: "Yerevan • Business Center",
    image: "/gen-consulting.png",
    icon: Briefcase,
  },
  {
    id: "pet-1",
    badgeKey: "auth.badgePet",
    badgeDefault: "PET CARE",
    headlineKey: "auth.headlinePet",
    headlineDefault: "Book pet grooming & washing specialists.",
    subcopyKey: "auth.subcopyPet",
    subcopyDefault: "Dog and cat grooming, haircuts, and hygiene.",
    serviceKey: "auth.servicePet",
    serviceDefault: "Pet Care & Spa",
    clientNameKey: "auth.clientSona",
    clientNameDefault: "Sona V.",
    initials: "SV",
    clientAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime15m",
    relTimeDefault: "15m ago",
    locationKey: "auth.locationPet",
    locationDefault: "Yerevan • Pet Salon",
    image: "/gen-beauty.png",
    icon: PawPrint,
  },
  {
    id: "laser-1",
    badgeKey: "auth.badgeLaser",
    badgeDefault: "LASER HAIR REMOVAL",
    headlineKey: "auth.headlineLaser",
    headlineDefault: "Book laser hair removal sessions.",
    subcopyKey: "auth.subcopyLaser",
    subcopyDefault: "Safe and effective hair removal with modern equipment.",
    serviceKey: "auth.serviceLaser",
    serviceDefault: "Laser Hair Removal",
    clientNameKey: "auth.clientDavidM",
    clientNameDefault: "David Miller",
    initials: "DM",
    clientAvatar: null,
    relTimeKey: "auth.relTime18m",
    relTimeDefault: "18m ago",
    locationKey: "auth.locationLaser",
    locationDefault: "Yerevan • Medical Center",
    image: "/gen-spa.png",
    icon: Zap,
  },
  {
    id: "bridal-1",
    badgeKey: "auth.badgeBridal",
    badgeDefault: "BRIDAL MAKEUP",
    headlineKey: "auth.headlineBridal",
    headlineDefault: "Book bridal makeup & hair styling specialists.",
    subcopyKey: "auth.subcopyBridal",
    subcopyDefault: "Elegant wedding looks and trial makeup sessions.",
    serviceKey: "auth.serviceBridal",
    serviceDefault: "Bridal Makeup",
    clientNameKey: "auth.clientElen",
    clientNameDefault: "Elen K.",
    initials: "EK",
    clientAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime20m",
    relTimeDefault: "20m ago",
    locationKey: "auth.locationBridal",
    locationDefault: "Yerevan • Beauty Studio",
    image: "/gen-beauty.png",
    icon: Sparkles,
  },
]

export function AuthBranding() {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length)
    }, 4500)
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
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        )
      })}

      {/* Light Glassmorphic Overlay & Left Fade */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/65 via-white/35 to-transparent z-1" />
      <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none z-20" />

      {/* Slide Navigation Indicator Pills */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-1 bg-white/85 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs max-w-[200px] overflow-x-auto scrollbar-hide">
        {BACKGROUND_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 shrink-0 ${
              idx === currentSlide ? "w-4 bg-[#FF385C]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
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
                {active.clientAvatar ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                    src={active.clientAvatar}
                    alt={t(active.clientNameKey, active.clientNameDefault)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF385C] to-[#E0304F] text-white flex items-center justify-center font-extrabold text-xs shadow-xs ring-2 ring-white">
                    {active.initials}
                  </div>
                )}
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

