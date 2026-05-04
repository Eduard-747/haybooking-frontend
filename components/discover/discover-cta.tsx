import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DiscoverCTA() {
  return (
    <section className="mt-16 rounded-2xl bg-muted/50 border border-border p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Text Content */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {"Don't see what you're looking for?"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Our database is updated daily with hundreds of new service providers.
            Search by location or specific treatment to find exactly what fits your
            schedule.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button className="gap-2">
              Explore All Categories
            </Button>
            <Button variant="outline" className="gap-2">
              View Map
            </Button>
          </div>
        </div>

        {/* Map Illustration */}
        <div className="relative w-full lg:w-80 h-40 lg:h-48 bg-gradient-to-br from-amber-100 via-rose-100 to-teal-100 rounded-xl overflow-hidden">
          {/* Stylized map background */}
          <div className="absolute inset-0 opacity-50">
            <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
              <path d="M0 100 Q100 50 200 100 T400 100" stroke="#d4a574" strokeWidth="3" fill="none" opacity="0.4" />
              <path d="M0 120 Q150 80 250 120 T400 90" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M50 150 Q200 100 350 150" stroke="#5eead4" strokeWidth="2" fill="none" opacity="0.4" />
              <circle cx="280" cy="100" r="40" fill="#e2e8f0" opacity="0.3" />
              <circle cx="120" cy="80" r="30" fill="#fde68a" opacity="0.3" />
            </svg>
          </div>
          
          {/* Location pin and label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="mt-3 px-3 py-1.5 bg-white rounded-full shadow-md text-sm font-medium text-foreground">
              Over 500+ locations near you
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
