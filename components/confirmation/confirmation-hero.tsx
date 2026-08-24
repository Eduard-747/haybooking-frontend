import { Check } from "lucide-react"

export function ConfirmationHero() {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm border border-border/40">
        <Check className="h-10 w-10 text-[#FF4444]" strokeWidth={2.5} />
      </div>
      <div className="space-y-3 max-w-md mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Booking Confirmed!
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          Your appointment has been successfully scheduled. A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  )
}
