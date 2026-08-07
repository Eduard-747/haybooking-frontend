"use client"

import { useTranslation } from "react-i18next"
import { MapPin, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"

const BranchMapOverview = dynamic(
  () => import("@/components/maps/branch-map-overview"),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-2xl" /> }
)

interface BranchSelectorProps {
  branches: any[]
  onSelect: (id: string) => void
}

export function BranchSelector({ branches, onSelect }: BranchSelectorProps) {
  const { t } = useTranslation()

  if (!branches || branches.length === 0) return null

  const mapMarkers = branches.map(b => ({
    id: b._id,
    lat: b.location?.latitude || 0,
    lng: b.location?.longitude || 0,
    label: b.address?.line1 || "Branch Location"
  })).filter(m => m.lat !== 0 && m.lng !== 0)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("book.selectLocation", "Select a Location")}</h2>
        <p className="text-muted-foreground">{t("book.selectBranchDesc", "Please select a branch to view availability and make a reservation.")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List View */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {branches.map(branch => (
            <button
              key={branch._id}
              onClick={() => onSelect(branch._id)}
              className="w-full flex items-center justify-between p-5 bg-white border border-border/60 hover:border-[#E5555E]/50 rounded-2xl shadow-sm hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-[#FDEAEA] rounded-full text-[#E5555E]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg group-hover:text-[#E5555E] transition-colors">{branch.address?.city || t("book.mainBranch", "Branch")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{branch.address?.line1}</p>
                  {branch.phoneNumbers && branch.phoneNumbers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">{branch.phoneNumbers[0]}</p>
                  )}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-[#E5555E] group-hover:-translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {/* Map View */}
        <div className="h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden border border-border/60 shadow-sm relative z-0">
          {mapMarkers.length > 0 ? (
            <BranchMapOverview 
              markers={mapMarkers} 
              onMarkerClick={(id) => onSelect(id)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAFAFA] text-muted-foreground">
              <MapPin className="h-8 w-8 mb-3 opacity-20" />
              <p>{t("book.noLocationData", "No map coordinates available")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
