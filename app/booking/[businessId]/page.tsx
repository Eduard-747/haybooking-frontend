"use client"

import { useState } from "react"
import { BookingHeader } from "@/components/booking/booking-header"
import { BusinessHero } from "@/components/booking/business-hero"
import { ServiceSelection } from "@/components/booking/service-selection"
import { SpecialistSelection } from "@/components/booking/specialist-selection"
import { DateTimePicker } from "@/components/booking/date-time-picker"
import { BookingFooter } from "@/components/booking/booking-footer"
import { SiteFooter } from "@/components/booking/site-footer"

export default function ServiceBookingPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>(["swedish-massage"])
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>("elena")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 9, 24))
  const [selectedTime, setSelectedTime] = useState<string | null>("14:30")

  const services = [
    {
      id: "swedish-massage",
      name: "Swedish Massage",
      description: "A classic full-body massage using long, gliding strokes to reduce stress and improve circulation.",
      duration: 60,
      price: 85,
    },
    {
      id: "deep-tissue",
      name: "Deep Tissue Therapy",
      description: "Targets deeper layers of muscle and connective tissue to relieve chronic tension and aches.",
      duration: 75,
      price: 110,
    },
    {
      id: "hydrating-facial",
      name: "Hydrating Facial",
      description: "Deep cleansing treatment focused on restoring moisture balance and skin radiance.",
      duration: 45,
      price: 75,
    },
    {
      id: "hot-stone",
      name: "Hot Stone Bliss",
      description: "Smooth, heated stones placed on specific points of your body to melt away tension.",
      duration: 90,
      price: 140,
    },
  ]

  const specialists = [
    { id: "elena", name: "Elena Rodriguez", role: "Lead Therapist", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face" },
    { id: "marcus", name: "Marcus Chen", role: "Massage Specialist", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" },
    { id: "sarah", name: "Sarah Jenkins", role: "Esthetician", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face" },
    { id: "david", name: "David Wilson", role: "Wellness Coach", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
    { id: "anya", name: "Anya Sokolov", role: "Yoga Master", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
  ]

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BookingHeader />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        <BusinessHero
          name="Serenity Wellness Spa"
          rating={4.9}
          reviewCount={124}
          address="123 Nordic Way, Stockholm"
          status="Open until 9:00 PM"
          estimatedWait="5 - 10 Minutes"
        />

        <div className="mt-8 space-y-10">
          <ServiceSelection
            services={services}
            selectedServices={selectedServices}
            onToggle={toggleService}
          />

          <SpecialistSelection
            specialists={specialists}
            selectedSpecialist={selectedSpecialist}
            onSelect={setSelectedSpecialist}
          />

          <DateTimePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
          />
        </div>
      </main>

      <BookingFooter
        totalPrice={totalPrice}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      <SiteFooter />
    </div>
  )
}
