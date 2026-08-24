import React from "react"
import { CheckCircle2, Circle, MapPin, Scissors, Users, ArrowRight, PlayCircle } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

interface OnboardingGuideProps {
  hasBranch: boolean
  hasService: boolean
  hasSpecialist: boolean
}

export function OnboardingGuide({ hasBranch, hasService, hasSpecialist }: OnboardingGuideProps) {
  const { t } = useTranslation()

  const steps = [
    {
      id: "branch",
      isComplete: hasBranch,
      title: t("onboarding.branchTitle", "Add Your First Branch"),
      description: t("onboarding.branchDesc", "Set up your business location, address, and working hours so customers know where and when to find you."),
      icon: MapPin,
      href: "/dashboard/branches",
      cta: t("onboarding.addBranch", "Add Branch")
    },
    {
      id: "service",
      isComplete: hasService,
      title: t("onboarding.serviceTitle", "Create Services"),
      description: t("onboarding.serviceDesc", "Define the services you offer, including duration and pricing, so customers can start booking."),
      icon: Scissors,
      href: "/dashboard/services",
      cta: t("onboarding.addService", "Add Service")
    },
    {
      id: "specialist",
      isComplete: hasSpecialist,
      title: t("onboarding.specialistTitle", "Add Specialists"),
      description: t("onboarding.specialistDesc", "Add your team members and assign them to specific branches and services."),
      icon: Users,
      href: "/dashboard/specialists",
      cta: t("onboarding.addSpecialist", "Add Specialist")
    }
  ]

  const progress = steps.filter(s => s.isComplete).length
  const progressPercentage = Math.round((progress / steps.length) * 100)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-foreground mb-4">
          {t("onboarding.welcome", "Welcome to Haybooking!")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t("onboarding.subtitle", "You're just a few steps away from accepting online bookings. Complete this quick setup guide to get your business online.")}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-border/40 bg-[#FAFAFA]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="h-16 w-16 rounded-full bg-[#FF4444]/10 flex items-center justify-center shrink-0">
                <PlayCircle className="h-8 w-8 text-[#FF4444]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {t("onboarding.gettingStarted", "Getting Started Guide")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {progress} {t("common.of", "of")} {steps.length} {t("onboarding.stepsCompleted", "steps completed")}
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
                <span>{t("onboarding.progress", "Progress")}</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF4444] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div 
                key={step.id} 
                className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center transition-colors ${step.isComplete ? 'bg-[#FAFAFA]/50' : 'bg-white hover:bg-[#FAFAFA]/30'}`}
              >
                <div className="flex items-center gap-4 md:w-[40%] xl:w-[35%] shrink-0 pr-2">
                  {step.isComplete ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-8 w-8 text-muted-foreground/30 shrink-0" />
                  )}
                  
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${step.isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-[#FEF2F2] text-[#FF4444]'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {t("onboarding.step", "Step")} {index + 1}
                    </p>
                    <h3 className={`font-bold text-lg leading-tight ${step.isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${step.isComplete ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0 flex md:justify-end">
                  {step.isComplete ? (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl border border-emerald-100 flex items-center gap-2 w-fit">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("common.completed", "Completed")}
                    </div>
                  ) : (
                    <Link href={step.href} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FF4444] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto">
                      {step.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {progress === 0 && (
        <div className="text-center bg-[#FEF2F2] border border-[#FF4444]/20 rounded-xl p-6">
          <p className="text-[#FF4444] font-medium">
            {t("onboarding.tip", "💡 Tip: Start by adding your branch location. You won't be able to add services or specialists without a branch!")}
          </p>
        </div>
      )}
    </div>
  )
}
