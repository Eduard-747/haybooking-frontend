import { ShieldCheck, Clock, CalendarCheck } from "lucide-react"

export function TrustBar() {
  return (
    <section className="w-full bg-[#FAFAFA] border-y border-border/40 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Item 1 */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#FF4444]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Verified Services</h3>
              <p className="text-sm text-muted-foreground mt-1">Every business is manually vetted.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#FF4444]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Instant Booking</h3>
              <p className="text-sm text-muted-foreground mt-1">Real-time availability updates.</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#FF4444]">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Easy Management</h3>
              <p className="text-sm text-muted-foreground mt-1">Cancel or reschedule in one click.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
