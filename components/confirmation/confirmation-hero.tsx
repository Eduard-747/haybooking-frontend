import { Check } from "lucide-react"

export function ConfirmationHero() {
  return (
    <div className="text-center">
      {/* Success Checkmark */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted border-4 border-background shadow-sm mb-6">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Check className="h-8 w-8 text-muted-foreground" strokeWidth={2.5} />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
        Booking Confirmed!
      </h1>

      {/* Subtext */}
      <p className="text-muted-foreground max-w-md mx-auto px-4">
        Your appointment has been successfully scheduled. A confirmation email has been sent to your inbox.
      </p>
    </div>
  )
}
