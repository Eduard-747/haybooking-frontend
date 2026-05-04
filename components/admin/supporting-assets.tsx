import Image from "next/image"
import { Image as ImageIcon, CheckCircle } from "lucide-react"

const assets = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
    title: "Main Entrance & Pool",
    type: "PROPERTY PHOTO",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop",
    title: "Business License 2024",
    type: "LEGAL DOCUMENT",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
    title: "Spa Facility Preview",
    type: "PROPERTY PHOTO",
  },
]

export function SupportingAssets() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Supporting Assets</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Verification documents & photos
        </p>
      </div>

      {/* Asset Cards */}
      <div className="space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="overflow-hidden rounded-xl border border-border bg-background"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={asset.src}
                alt={asset.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="font-medium text-foreground">{asset.title}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {asset.type}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Status */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Automated Check Passed</p>
            <p className="text-sm text-muted-foreground mt-1">
              Identity verified. No previous red flags detected in the Global Booking registry.
              Recommended for standard approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
