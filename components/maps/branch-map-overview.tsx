"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Generate a random key on module load to prevent Leaflet "Map container is being reused" error during Next.js Hot Module Replacement
const HMR_KEY = Math.random().toString(36).substring(7);

interface MarkerData {
  id?: string
  branchId?: string
  lat: number
  lng: number
  label: string
}

interface BranchMapOverviewProps {
  markers: MarkerData[]
  onMarkerClick?: (id: string, branchId?: string) => void
}

export default function BranchMapOverview({ markers, onMarkerClick }: BranchMapOverviewProps) {
  if (markers.length === 0) return null

  // Center on first marker or calculate center
  const centerLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length
  const centerLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length

  return (
    <MapContainer
      key={`${HMR_KEY}-${centerLat}-${centerLng}`}
      center={[centerLat, centerLng]}
      zoom={markers.length === 1 ? 14 : 10}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) => (
        <Marker
          key={m.branchId ? `${m.id}-${m.branchId}` : (m.id || i)}
          position={[m.lat, m.lng]}
          icon={customIcon}
          eventHandlers={{
            click: () => m.id && onMarkerClick && onMarkerClick(m.id, m.branchId)
          }}
        >
          <Popup>
            <div className="text-sm font-medium">{m.label}</div>
            {m.id && onMarkerClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkerClick(m.id!, m.branchId); }}
                className="mt-2 w-full px-2 py-1 bg-[#E5555E] text-white text-xs rounded-md"
              >
                Select Branch
              </button>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
