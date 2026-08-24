"use client"

import { useTranslation } from "react-i18next"
import { MapPin, Phone, Clock, Coffee, Map } from "lucide-react"

export function OverviewTab({ partner, branches }: { partner: any, branches: any[] }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">{t("book.aboutUs", "About Us")}</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {partner.publicDescription || t("restaurant.about_default", "Welcome to our restaurant! We are dedicated to providing excellent culinary experiences and ensuring you have the best time possible.")}
        </p>

        {/* Amenities Section */}
        <div className="mt-6 pt-6 border-t border-border/40">
           <h3 className="text-sm font-bold text-foreground mb-3">{t("restaurant.amenities", "Amenities & Features")}</h3>
           <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{t("restaurant.wifi", "Wi-Fi")}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{t("restaurant.parking", "Parking")}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{t("restaurant.outdoor_seating", "Outdoor Seating")}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{t("restaurant.vip_rooms", "VIP Rooms")}</span>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("book.locations", "Our Locations")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {branches.map(b => (
            <div key={b._id} className="p-4 rounded-xl border border-border/60 bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5 text-[#FF4444]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{b.address.line1}</h3>
                  <p className="text-sm text-muted-foreground">{b.address.city}, {b.address.country}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {(b.phoneNumbers || (b.phoneNumber ? [b.phoneNumber] : [])).map((phone: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                  </div>
                ))}
                {b.workingHours && b.workingHours.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span>{t("book.workingHours", "Open today")}: {b.workingHours[0].openTime} - {b.workingHours[0].closeTime}</span>
                    </div>
                  </div>
                )}
                
                {b.location?.latitude && b.location?.longitude && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${b.location.latitude},${b.location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <Map className="h-3.5 w-3.5" />
                      Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {branches.length === 0 && <p className="text-muted-foreground">{t("book.noLocations", "No locations available.")}</p>}
        </div>
      </div>
    </div>
  )
}
