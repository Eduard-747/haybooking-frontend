"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { Star, ShieldCheck, Clock, Sparkles, CheckCircle2, Scissors, Dumbbell, HeartPulse, Utensils, Briefcase, Car, Smile, GraduationCap, PawPrint, Camera, Zap } from "lucide-react"

const BACKGROUND_SLIDES = [
  {
    id: "fitness-1",
    badgeKey: "auth.badgeFitness",
    badgeDefault: "ՖԻԹՆԵՍ ԵՎ ԱՌՈՂՋՈՒԹՅՈՒՆ",
    headlineKey: "auth.headlineFitness",
    headlineDefault: "Ամրագրեք անհատական մարզիչներին և յոգայի դասընթացները:",
    subcopyKey: "auth.subcopyFitness",
    subcopyDefault: "Միացեք յոգայի, պիլատեսի և անհատական ֆիթնես մարզումներին:",
    serviceKey: "auth.serviceFitness",
    serviceDefault: "Յոգա և Մեդիտացիա",
    clientNameKey: "auth.clientDavit",
    clientNameDefault: "Դավիթ Հ.",
    initials: "ԴՀ",
    clientAvatar: null, // No image - displays initials avatar
    relTimeKey: "auth.relTime1m",
    relTimeDefault: "1ր առաջ",
    locationKey: "auth.locationFitness",
    locationDefault: "Երևան • Ֆիթնես Ստուդիա",
    image: "/gen-fitness.png",
    icon: Dumbbell,
  },
  {
    id: "beauty-1",
    badgeKey: "auth.badgeBeauty",
    badgeDefault: "ԳԵՂԵՑԿՈՒԹՅՈՒՆ ԵՎ ՍԱԼՈՆ",
    headlineKey: "auth.headlineBeauty",
    headlineDefault: "Ամրագրեք վարսահարդարման և դիմահարդարման մասնագետներին:",
    subcopyKey: "auth.subcopyBeauty",
    subcopyDefault: "Գտնեք լավագույն սրահները, մատնահարդարման և խնամքի ծառայությունները:",
    serviceKey: "auth.serviceBeauty",
    serviceDefault: "Մազերի Ներկում և Բալայաժ",
    clientNameKey: "auth.clientElena",
    clientNameDefault: "Elena Smith",
    initials: "ES",
    clientAvatar: null, // No image - displays initials avatar
    relTimeKey: "auth.relTimeJustNow",
    relTimeDefault: "Հենց նոր",
    locationKey: "auth.locationBeauty",
    locationDefault: "Երևան • Գեղեցկության Սրահ",
    image: "/gen-beauty.png",
    icon: Sparkles,
  },
  {
    id: "barbershop-1",
    badgeKey: "auth.badgeBarbershop",
    badgeDefault: "ՎԱՐՍԱՎԻՐԱՆՈՑ ԵՎ ԽՆԱՄՔ",
    headlineKey: "auth.headlineBarbershop",
    headlineDefault: "Ամրագրեք տղամարդկանց վարսավիրներին վայրկյաններում:",
    subcopyKey: "auth.subcopyBarbershop",
    subcopyDefault: "Ժամանակակից կտրվածքներ, մորուքի ձևավորում և խնամք:",
    serviceKey: "auth.serviceBarbershop",
    serviceDefault: "Տղամարդու Վարսահարդարում",
    clientNameKey: "auth.clientArmen",
    clientNameDefault: "Արմեն Գ.",
    initials: "ԱԳ",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime3m",
    relTimeDefault: "3ր առաջ",
    locationKey: "auth.locationBarbershop",
    locationDefault: "Երևան • Վարսավիրանոց",
    image: "/gen-barbershop.png",
    icon: Scissors,
  },
  {
    id: "spa-1",
    badgeKey: "auth.badgeSpa",
    badgeDefault: "ՍՊԱ ԵՎ ՄԵՐՍՈՒՄ",
    headlineKey: "auth.headlineSpa",
    headlineDefault: "Ամրագրեք մերսման և սպա թերապիայի սեանսներ:",
    subcopyKey: "auth.subcopySpa",
    subcopyDefault: "Վայելեք լիցքաթափող մերսումներ, դեմքի խնամք և սպա արարողություններ:",
    serviceKey: "auth.serviceSpa",
    serviceDefault: "Թերապևտիկ Մերսում",
    clientNameKey: "auth.clientSophia",
    clientNameDefault: "Sophia Taylor",
    initials: "ST",
    clientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime4m",
    relTimeDefault: "4ր առաջ",
    locationKey: "auth.locationSpa",
    locationDefault: "Երևան • Սպա Կենտրոն",
    image: "/gen-spa.png",
    icon: HeartPulse,
  },
  {
    id: "dental-1",
    badgeKey: "auth.badgeDental",
    badgeDefault: "ԱՏԱՄՆԱԲՈՒԺՈՒԹՅՈՒՆ",
    headlineKey: "auth.headlineDental",
    headlineDefault: "Ամրագրեք ատամնաբույժի այցելություններ:",
    subcopyKey: "auth.subcopyDental",
    subcopyDefault: "Պրոֆեսիոնալ ատամնաբուժական խնամք, սպիտակեցում և մաքրում:",
    serviceKey: "auth.serviceDental",
    serviceDefault: "Ատամների Մաքրում և Սպիտակեցում",
    clientNameKey: "auth.clientNarek",
    clientNameDefault: "Նարեկ Ս.",
    initials: "ՆՍ",
    clientAvatar: null, // No image - displays initials avatar
    relTimeKey: "auth.relTime7m",
    relTimeDefault: "7ր առաջ",
    locationKey: "auth.locationDental",
    locationDefault: "Երևան • Ատամնաբուժարան",
    image: "/gen-spa.png",
    icon: Smile,
  },
  {
    id: "nails-1",
    badgeKey: "auth.badgeNails",
    badgeDefault: "ՄԱՏՆԱՀԱՐԴԱՐՈՒՄ",
    headlineKey: "auth.headlineNails",
    headlineDefault: "Ամրագրեք մատնահարդարման մասնագետներին:",
    subcopyKey: "auth.subcopyNails",
    subcopyDefault: "Գել-լաք, ոտնահարդարում և եղունգների խնամք:",
    serviceKey: "auth.serviceNails",
    serviceDefault: "Մատնահարդարում Գել-լաքով",
    clientNameKey: "auth.clientLilit",
    clientNameDefault: "Lilit Hovhannisyan",
    initials: "LH",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime2m",
    relTimeDefault: "2ր առաջ",
    locationKey: "auth.locationNails",
    locationDefault: "Երևան • Մատնահարդարման Սրահ",
    image: "/gen-beauty.png",
    icon: Sparkles,
  },
  {
    id: "auto-1",
    badgeKey: "auth.badgeAuto",
    badgeDefault: "ԱՎՏՈՍՊԱ ԵՎ ԼՎԱՑՈՒՄ",
    headlineKey: "auth.headlineAuto",
    headlineDefault: "Ամրագրեք ավտոլվացման և դեթեյլինգի ծառայություններ:",
    subcopyKey: "auth.subcopyAuto",
    subcopyDefault: "Անհատական ավտոսպա, քիմմաքրում և փայլեցում:",
    serviceKey: "auth.serviceAuto",
    serviceDefault: "Ավտոմեքենայի Դեթեյլինգ Լվացում",
    clientNameKey: "auth.clientHayk",
    clientNameDefault: "Hayk Davtyan",
    initials: "HD",
    clientAvatar: null, // No image - displays initials avatar
    relTimeKey: "auth.relTime5m",
    relTimeDefault: "5ր առաջ",
    locationKey: "auth.locationAuto",
    locationDefault: "Երևան • Ավտոսպա",
    image: "/gen-barbershop.png",
    icon: Car,
  },
  {
    id: "aesthetic-1",
    badgeKey: "auth.badgeAesthetic",
    badgeDefault: "ԷՍԹԵՏԻԿ ԲԺՇԿՈՒԹՅՈՒՆ",
    headlineKey: "auth.headlineAesthetic",
    headlineDefault: "Ամրագրեք դեմքի խնամքի և պրոցեդուրաների մասնագետներին:",
    subcopyKey: "auth.subcopyAesthetic",
    subcopyDefault: "Ժամանակակից էսթետիկ բժշկություն և երիտասարդացնող խնամք:",
    serviceKey: "auth.serviceAesthetic",
    serviceDefault: "Դեմքի Խնամք և Էսթետիկա",
    clientNameKey: "auth.clientAnahit",
    clientNameDefault: "Անահիտ Տ.",
    initials: "ԱՏ",
    clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime6m",
    relTimeDefault: "6ր առաջ",
    locationKey: "auth.locationAesthetic",
    locationDefault: "Երևան • Էսթետիկ Կենտրոն",
    image: "/gen-beauty.png",
    icon: HeartPulse,
  },
  {
    id: "gym-1",
    badgeKey: "auth.badgeGym",
    badgeDefault: "ԱՆՀԱՏԱԿԱՆ ՄԱՐԶՈՒՄՆԵՐ",
    headlineKey: "auth.headlineGym",
    headlineDefault: "Ամրագրեք անհատական ֆիթնես մարզիչներին:",
    subcopyKey: "auth.subcopyGym",
    subcopyDefault: "Ուժային մարզումներ, կարդիո և սպորտային ծրագրեր:",
    serviceKey: "auth.serviceGym",
    serviceDefault: "Անհատական Ֆիթնես Մարզում",
    clientNameKey: "auth.clientAlexandre",
    clientNameDefault: "Alexandre M.",
    initials: "AM",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime8m",
    relTimeDefault: "8ր առաջ",
    locationKey: "auth.locationGym",
    locationDefault: "Երևան • Մարզասրահ",
    image: "/gen-fitness.png",
    icon: Dumbbell,
  },
  {
    id: "dining-1",
    badgeKey: "auth.badgeDining",
    badgeDefault: "ՌԵՍՏՈՐԱՆՆԵՐ ԵՎ ՍՐՃԱՐԱՆՆԵՐ",
    headlineKey: "auth.headlineDining",
    headlineDefault: "Ամրագրեք ՎԻՊ սեղաններ լավագույն ռեստորաններում:",
    subcopyKey: "auth.subcopyDining",
    subcopyDefault: "Բարձրակարգ խոհանոց, հարմարավետ միջավայր և սեղանի ամրագրում:",
    serviceKey: "auth.serviceDining",
    serviceDefault: "ՎԻՊ Սեղանի Ամրագրում",
    clientNameKey: "auth.clientMariam",
    clientNameDefault: "Մարիամ Խ.",
    initials: "ՄԽ",
    clientAvatar: null, // No image - displays initials avatar
    relTimeKey: "auth.relTime10m",
    relTimeDefault: "10ր առաջ",
    locationKey: "auth.locationDining",
    locationDefault: "Երևան • Ռեստորան",
    image: "/gen-dining.png",
    icon: Utensils,
  },
  {
    id: "consulting-1",
    badgeKey: "auth.badgeConsulting",
    badgeDefault: "ԽՈՐՀՐԴԱՏՎՈՒԹՅՈՒՆ ԵՎ ԲԻԶՆԵՍ",
    headlineKey: "auth.headlineConsulting",
    headlineDefault: "Ամրագրեք բիզնես և իրավաբանական խորհրդատուներին:",
    subcopyKey: "auth.subcopyConsulting",
    subcopyDefault: "Ռազմավարական խորհրդատվություն, հարկային և իրավական աջակցություն:",
    serviceKey: "auth.serviceConsulting",
    serviceDefault: "Իրավաբանական Խորհրդատվություն",
    clientNameKey: "auth.clientAram",
    clientNameDefault: "Aram Rustamyan",
    initials: "AR",
    clientAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime12m",
    relTimeDefault: "12ր առաջ",
    locationKey: "auth.locationConsulting",
    locationDefault: "Երևան • Բիզնես Կենտրոն",
    image: "/gen-consulting.png",
    icon: Briefcase,
  },
  {
    id: "pet-1",
    badgeKey: "auth.badgePet",
    badgeDefault: "ԿԵՆԴԱՆԻՆԵՐԻ ԽՆԱՄՔ",
    headlineKey: "auth.headlinePet",
    headlineDefault: "Ամրագրեք կենդանիների խնամքի և լվացման մասնագետներին:",
    subcopyKey: "auth.subcopyPet",
    subcopyDefault: "Շների և կատուների խնամք, մազերի կտրում և հիգիենա:",
    serviceKey: "auth.servicePet",
    serviceDefault: "Կենդանիների Խնամք և Սպա",
    clientNameKey: "auth.clientSona",
    clientNameDefault: "Սոնա Վ.",
    initials: "ՍՎ",
    clientAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime15m",
    relTimeDefault: "15ր առաջ",
    locationKey: "auth.locationPet",
    locationDefault: "Երևան • Կենդանիների Սրահ",
    image: "/gen-beauty.png",
    icon: PawPrint,
  },
  {
    id: "laser-1",
    badgeKey: "auth.badgeLaser",
    badgeDefault: "ԼԱԶԵՐԱՅԻՆ ԷՊԻԼՅԱՑԻԱ",
    headlineKey: "auth.headlineLaser",
    headlineDefault: "Ամրագրեք լազերային էպիլյացիայի սեանսներ:",
    subcopyKey: "auth.subcopyLaser",
    subcopyDefault: "Անվտանգ և արդյունավետ մազահեռացում ժամանակակից սարքավորումներով:",
    serviceKey: "auth.serviceLaser",
    serviceDefault: "Լազերային Էպիլյացիա",
    clientNameKey: "auth.clientDavidM",
    clientNameDefault: "David Miller",
    initials: "DM",
    clientAvatar: null, // No image - displays initials avatar
    relTimeKey: "auth.relTime18m",
    relTimeDefault: "18ր առաջ",
    locationKey: "auth.locationLaser",
    locationDefault: "Երևան • Բժշկական Կենտրոն",
    image: "/gen-spa.png",
    icon: Zap,
  },
  {
    id: "bridal-1",
    badgeKey: "auth.badgeBridal",
    badgeDefault: "ՀԱՐՍԱՆԵԿԱՆ ԴԻՄԱՀԱՐԴԱՐՈՒՄ",
    headlineKey: "auth.headlineBridal",
    headlineDefault: "Ամրագրեք հարսանեկան դիմահարդարման և սանրվածքի մասնագետներին:",
    subcopyKey: "auth.subcopyBridal",
    subcopyDefault: "Էլեգանտ հարսանեկան կերպարներ և փորձնական դիմահարդարում:",
    serviceKey: "auth.serviceBridal",
    serviceDefault: "Հարսանեկան Դիմահարդարում",
    clientNameKey: "auth.clientElen",
    clientNameDefault: "Էլեն Կ.",
    initials: "ԷԿ",
    clientAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
    relTimeKey: "auth.relTime20m",
    relTimeDefault: "20ր առաջ",
    locationKey: "auth.locationBridal",
    locationDefault: "Երևան • Գեղեցկության Ստուդիա",
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
                {t("auth.liveActivity", "ՈՒՂԻՂ ԵԹԵՐ")}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t("auth.justBooked", "Նոր ամրագրված")}
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
                  {t(active.clientNameKey, active.clientNameDefault)} <span className="font-normal text-slate-600">{t("auth.bookedVerb", "ամրագրեց")}</span> {t(active.serviceKey, active.serviceDefault)}
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

