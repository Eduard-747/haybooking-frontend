"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default marker icon
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

interface LocationPickerProps {
  initialLat: number
  initialLng: number
  onLocationSelect: (lat: number, lng: number) => void
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])

  // Sync external changes (e.g. forward geocoding)
  useEffect(() => {
    setPosition([initialLat, initialLng])
  }, [initialLat, initialLng])

  const handleClick = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  return (
    <MapContainer
      key={HMR_KEY}
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterUpdater center={position} />
      <ClickHandler onLocationSelect={handleClick} />
      {position[0] !== 0 && (
        <Marker position={position} icon={customIcon} />
      )}
    </MapContainer>
  )
}
