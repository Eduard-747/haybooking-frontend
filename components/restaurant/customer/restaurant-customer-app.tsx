"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { BusinessHero } from "@/components/booking/business-hero"
import { OverviewTab } from "./tabs/overview-tab"
import { BookingTab } from "./tabs/booking-tab"
import { MenuTab } from "./tabs/menu-tab"
import { Info, Calendar, UtensilsCrossed, Star, MapPin } from "lucide-react"

export function RestaurantCustomerApp({
  partner,
  branches,
  selectedBranch,
  onBranchSelect,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  partySize,
  setPartySize,
  floors,
  tables,
  reservations,
  bookedSlots,
  onBookTable
}: any) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"overview" | "book" | "menu" | "reviews">("book")

  return (
    <div className="w-full">
      <BusinessHero
        name={partner.businessName}
        image={partner.image}
        rating={4.9}
        reviewCount={124}
        address={branches.find((b: any) => b._id === selectedBranch)?.address?.city || branches[0]?.address?.city || "Restaurant"}
        status="Open Now"
        estimatedWait="Immediate Seating"
        viewMode={"list"}
        onViewChange={() => {}}
      />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* Branch Selector (if multiple) */}
        {branches.length > 1 && (
          <div className="mb-6 flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
             {branches.map((b: any) => (
                <button
                  key={b._id}
                  onClick={() => onBranchSelect(b._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                    selectedBranch === b._id 
                      ? 'border-[#E5555E] bg-[#FDF6F6] text-[#E5555E]' 
                      : 'border-border/60 bg-white text-muted-foreground hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  {b.address.line1}
                </button>
             ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-1 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-border/60 w-fit shadow-sm overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("book")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "book"
                ? "bg-[#E5555E] text-white shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Reserve Table
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "menu"
                ? "bg-gray-900 text-white shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Our Menu
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "overview"
                ? "bg-gray-900 text-white shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
            }`}
          >
            <Info className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "reviews"
                ? "bg-gray-900 text-white shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
            }`}
          >
            <Star className="h-4 w-4" />
            Reviews (124)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pb-32">
          {activeTab === "overview" && (
            <OverviewTab partner={partner} branches={branches} />
          )}

          {activeTab === "book" && (
            <BookingTab 
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchSelect={onBranchSelect}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              partySize={partySize}
              setPartySize={setPartySize}
              floors={floors}
              tables={tables}
              reservations={reservations}
              bookedSlots={bookedSlots}
              onBookTable={onBookTable}
            />
          )}

          {activeTab === "menu" && (
            <MenuTab partnerId={partner._id} branchId={selectedBranch} />
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-border/60">
                <Star className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-foreground">Reviews Coming Soon</h3>
                <p className="text-sm">We are working on integrating verified customer reviews.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
