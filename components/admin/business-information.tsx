import { Building2, User, Mail, Phone, Globe, MapPin, FileText, Crown } from "lucide-react"

export function BusinessInformation() {
  return (
    <div className="space-y-8">
      {/* Business Information Section */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Business Information</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Core details provided during registration
        </p>

        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Business Name
              </p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">The Heritage Retreat & Spa</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Business Type
              </p>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">Luxury Resort & Wellness Center</p>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Owner Name
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">Eleanor Fitzgerald</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Contact Email
              </p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">e.fitzgerald@heritageretreat.com</p>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Phone Number
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">+44 20 7946 0123</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Official Website
              </p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href="https://www.heritageretreat.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  www.heritageretreat.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Description */}
      <section>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
          Business Description
        </p>
        <div className="bg-muted/30 border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-foreground leading-relaxed">
              A boutique luxury wellness retreat focused on sustainable tourism and traditional European spa
              treatments. Established in 2018, looking to expand booking reach through HayBooking&apos;s
              premium network.
            </p>
          </div>
        </div>
      </section>

      {/* Location & Branches */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Location & Branches</h2>
        </div>

        <div className="space-y-3">
          {/* Main Branch */}
          <div className="flex items-start gap-4 p-4 bg-background border border-border rounded-xl">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Main Branch - Cotswolds</p>
              <p className="text-sm text-muted-foreground">
                42 Meadow Lane, Upper Slaughter, Cheltenham GL54 2JF, United Kingdom
              </p>
            </div>
          </div>

          {/* Secondary Branch */}
          <div className="flex items-start gap-4 p-4 bg-background border border-border rounded-xl">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Secondary Branch - Bath{" "}
                <span className="text-sm font-normal text-muted-foreground">(Pending)</span>
              </p>
              <p className="text-sm text-muted-foreground">
                The Royal Crescent, Bath BA1 2LS, United Kingdom
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
