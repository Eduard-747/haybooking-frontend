"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { MapPin, Info, Calendar, Phone, Clock, CheckSquare, Map, Coffee } from "lucide-react"
import { format } from "date-fns"

import { BookingHeader } from "@/components/booking/booking-header"
import { BookingFooter } from "@/components/booking/booking-footer"
import { BusinessHero } from "@/components/booking/business-hero"
import { ServiceSelection } from "@/components/booking/service-selection"
import { getPhonePlaceholder } from "@/lib/countries"
import { SpecialistSelection } from "@/components/booking/specialist-selection"
import { DateTimePicker } from "@/components/booking/date-time-picker"
import { formatPrice } from "@/lib/currency"
import { useCountryCode } from "@/lib/hooks/use-country-code"
import { RestaurantCustomerApp } from "@/components/restaurant/customer/restaurant-customer-app"
import { BranchSelector } from "@/components/booking/branch-selector"

// Dynamic import for map to avoid SSR
import dynamic from "next/dynamic"
const BranchMapOverview = dynamic(
  () => import("@/components/maps/branch-map-overview"),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-muted animate-pulse rounded-2xl" /> }
)

interface PartnerData {
  _id: string
  businessName: string
  businessType: string
  category?: string
  image?: string
  publicDescription?: string
  verified?: boolean
  slug?: string
  currency?: string
}

interface BranchData {
  _id: string
  address: { line1: string; city: string; country: string }
  phoneNumbers?: string[]
  phoneNumber?: string
  location?: { latitude: number; longitude: number }
  workingHours: { weekday: number; openTime: string; closeTime: string }[]
  breaks?: { weekday: number; startTime: string; endTime: string }[]
  gallery?: string[]
}

interface ServiceData {
  _id: string
  name: string
  description?: string
  duration: number
  price: number
  category?: string
  image?: string
  assignedBranches?: string[]
}

interface SpecialistData {
  _id: string
  name: string
  assignedBranches: string[]
  assignedServices: string[]
  role?: string
  image?: string
}

export default function PublicBookingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const initialBranchId = searchParams.get("branch")

  // Data
  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [branches, setBranches] = useState<BranchData[]>([])
  const [allServices, setAllServices] = useState<ServiceData[]>([])
  const [allSpecialists, setAllSpecialists] = useState<SpecialistData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")

  const { t } = useTranslation()
  const initialTab = searchParams.get("tab") === "about" ? "about" : "book"
  const [activeTab, setActiveTab] = useState<"book" | "about" | "menu" | "gallery">(initialTab)

  // Selections
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null)

  // Restaurant Menu
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null)
  const [reservationNotes, setReservationNotes] = useState<string>("")
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Guest Checkout State
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guestStep, setGuestStep] = useState<"details" | "verify">("details")
  const { countryCode: detectedCountryCode, countryCodesList } = useCountryCode("+374")
  const [guestDetails, setGuestDetails] = useState({ firstName: "", lastName: "", email: "", phone: "", countryCode: "+374" })
  const [smsCode, setSmsCode] = useState("")

  useEffect(() => {
    setGuestDetails(prev => ({ ...prev, countryCode: detectedCountryCode }))
  }, [detectedCountryCode])

  // Restaurant State
  const [restaurantFloors, setRestaurantFloors] = useState<any[]>([])
  const [restaurantTables, setRestaurantTables] = useState<any[]>([])
  const [restaurantReservations, setRestaurantReservations] = useState<any[]>([])
  const [partySize, setPartySize] = useState<number>(2)
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const isRestaurant = partner?.businessType === "restaurant"

  // Fetch business data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        let partnerRes
        try {
          partnerRes = await api.get(`/partners/slug/${slug}`)
        } catch {
          // Ignore network errors
        }

        // Fallback to ID lookup
        if (!partnerRes?.data) {
          try {
            partnerRes = await api.get(`/partners/${slug}`)
          } catch {}
        }
        
        if (!partnerRes?.data) { setNotFound(true); return }
        setPartner(partnerRes.data)

        const partnerId = partnerRes.data._id
        const [bRes, sRes, spRes, mRes] = await Promise.all([
          api.get(`/branches?partnerId=${partnerId}`),
          api.get(`/services?partnerId=${partnerId}`),
          api.get(`/specialists?partnerId=${partnerId}`),
          partnerRes.data.category === "Restaurant" ? api.get(`/restaurant/menu?partnerId=${partnerId}`) : Promise.resolve({ data: [] })
        ])
        
        setBranches(bRes.data || [])
        // Map _id to id for legacy components (ServiceSelection, SpecialistSelection)
        setAllServices((sRes.data || []).map((s: any) => ({ ...s, id: s._id })))
        setAllSpecialists((spRes.data || []).map((s: any) => ({ 
          ...s, 
          id: s._id,
          role: "Specialist",
          image: s.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=FF4444&color=fff&size=200`
        })))
        setMenuItems(mRes.data || [])
        
        // Auto-select branch
        if (initialBranchId && bRes.data?.some((b: any) => b._id === initialBranchId)) {
          setSelectedBranch(initialBranchId)
        } else if (bRes.data?.length === 1) {
          setSelectedBranch(bRes.data[0]._id)
        }
      } catch {
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }
    if (slug) fetchData()
  }, [slug])

  // Restore pending booking from localStorage (after auth redirect)
  useEffect(() => {
    if (isLoading || !partner) return
    try {
      const raw = localStorage.getItem('pendingBooking')
      if (!raw) return
      const pending = JSON.parse(raw)
      if (pending.slug !== slug && pending.partnerId !== partner._id) return

      if (pending.branchId) setSelectedBranch(pending.branchId)
      if (pending.serviceIds?.length) setSelectedServices(pending.serviceIds)
      if (pending.specialistId) setSelectedSpecialist(pending.specialistId)
      if (pending.date) setSelectedDate(new Date(pending.date))
      if (pending.time) setSelectedTime(pending.time)

      localStorage.removeItem('pendingBooking')
    } catch { /* ignore parse errors */ }
  }, [isLoading, partner, slug])

  // Fetch booked slots when specialist or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !selectedBranch) {
        setBookedSlots([])
        return
      }
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        
        if (partner?.businessType === "restaurant" || partner?.category === "Restaurant") {
          const [fRes, tRes, rRes] = await Promise.all([
            api.get(`/restaurant/floors?branchId=${selectedBranch}`),
            api.get(`/restaurant/tables?branchId=${selectedBranch}`),
            api.get(`/restaurant/reservations?branchId=${selectedBranch}&date=${dateStr}`)
          ])
          setRestaurantFloors(fRes.data)
          setRestaurantTables(tRes.data)
          setRestaurantReservations(rRes.data)
          if (fRes.data.length > 0 && !activeFloorId) {
            setActiveFloorId(fRes.data[0]._id)
          }
          return
        }

        const specialistQuery = selectedSpecialist ? `specialistId=${selectedSpecialist}&` : ''
        const res = await api.get(`/bookings/availability?${specialistQuery}branchId=${selectedBranch}&date=${dateStr}`)
        setBookedSlots(res.data.bookedSlots || [])
        // If the currently selected time is now booked, deselect it
        if (selectedTime && res.data.bookedSlots?.includes(selectedTime)) {
          setSelectedTime(null)
          toast.error("Your selected time is no longer available.")
        }
      } catch (err) {
        console.error("Failed to fetch availability", err)
      }
    }
    fetchBookedSlots()
  }, [selectedSpecialist, selectedDate, selectedBranch, selectedTime, partner])

  // Filters
  const branchServices = allServices.filter(s => {
    if (!selectedBranch) return true
    if (!s.assignedBranches || s.assignedBranches.length === 0) return true
    return s.assignedBranches.includes(selectedBranch)
  })

  const filteredSpecialists = allSpecialists.filter(sp => {
    // Check branch assignment
    if (selectedBranch && sp.assignedBranches?.length > 0) {
      const isAssignedToBranch = sp.assignedBranches.some((b: any) => b._id === selectedBranch || b === selectedBranch)
      if (!isAssignedToBranch) return false
    }

    // Check services assignment
    if (selectedServices.length > 0) {
      const canDoAllServices = selectedServices.every(sId => 
        sp.assignedServices?.some((s: any) => s._id === sId || s === sId)
      )
      if (!canDoAllServices) return false
    }

    return true
  })

  // Totals
  const totalPrice = allServices
    .filter(s => selectedServices.includes(s._id))
    .reduce((sum, s) => sum + s.price, 0)
  const totalDuration = allServices
    .filter(s => selectedServices.includes(s._id))
    .reduce((sum, s) => sum + s.duration, 0)

  // Map markers
  const mapMarkers = branches
    .filter(b => b.location?.latitude && b.location?.longitude)
    .map(b => ({
      id: b._id,
      lat: b.location!.latitude,
      lng: b.location!.longitude,
      label: `${b.address.line1}, ${b.address.city}`
    }))

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId)
    // Reset downstream selections when branch changes
    setSelectedServices([])
    setSelectedSpecialist(null)
    setSelectedTime(null)
    setSelectedTableId(null)
  }

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleConfirm = async (tableId?: string) => {
    const finalTableId = tableId || selectedTableId;
    
    if (branches.length > 0 && !selectedBranch) {
      toast.error("Please select a branch location")
      return
    }
    if (!isRestaurant && selectedServices.length === 0) {
      toast.error("Please select at least one service")
      return
    }
    if (!selectedTime) {
      toast.error("Please select a time slot")
      return
    }
    if (isRestaurant && !finalTableId) {
      toast.error("Please select a table")
      return
    }

    // Guest Checkout Modal Trigger
    if (!user) {
      setShowGuestModal(true)
      setGuestStep("details")
      return
    }

    submitBooking(undefined, finalTableId)
  }

  const submitBooking = async (guestData?: { name: string; email: string; phone: string }, passedTableId?: string | null) => {
    setIsSubmitting(true)
    try {
      const [hh, mm] = selectedTime!.split(':')
      const startTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        parseInt(hh, 10),
        parseInt(mm, 10),
        0
      )
      
      let endTime: Date;
      if (isRestaurant && selectedEndTime) {
        const [ehh, emm] = selectedEndTime.split(':')
        endTime = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          parseInt(ehh, 10),
          parseInt(emm, 10),
          0
        )
      } else {
        endTime = new Date(startTime.getTime() + (isRestaurant ? 120 : totalDuration) * 60000)
      }

      let userId = "000000000000000000000000"
      let userProfile: any = user
      try {
        if (!userProfile) {
          const profileRes = await api.get('/auth/profile')
          userProfile = profileRes?.data
        }
      } catch { /* fallback */ }

      if (userProfile && (userProfile._id || userProfile.userId)) {
        userId = userProfile._id || userProfile.userId
      }

      let payload: any = {
        userId,
        partnerId: partner?._id,
        branchId: selectedBranch || branches[0]?._id || partner?._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      }

      if (isRestaurant) {
        const finalTable = passedTableId || selectedTableId;
        payload = {
          ...payload,
          startTime: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
          endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
          tableId: finalTable,
          floorId: restaurantTables.find(t => t._id === finalTable)?.floorId,
          partySize,
          notes: reservationNotes,
          date: format(selectedDate, 'yyyy-MM-dd'),
          source: 'online'
        }
      } else {
        payload = {
          ...payload,
          serviceId: selectedServices[0], // Primary service
          serviceIds: selectedServices,   // All selected services
        }
        if (selectedSpecialist) payload.specialistId = selectedSpecialist
      }

      if (userProfile) {
        const uFirst = userProfile.firstName || userProfile.name || ""
        const uLast = userProfile.lastName || userProfile.surname || ""
        const fullName = `${uFirst} ${uLast}`.trim() || userProfile.email || ""
        const phone = userProfile.phoneNumber || userProfile.phone || ""
        if (fullName) payload.guestName = fullName
        if (phone) payload.guestPhone = phone
        if (userProfile.email) payload.guestEmail = userProfile.email
      }

      if (guestData) {
        payload.guestName = guestData.name
        payload.guestEmail = guestData.email
        payload.guestPhone = guestData.phone
      }

      const endpoint = isRestaurant ? '/restaurant/reservations' : '/bookings'
      await api.post(endpoint, payload)
      toast.success("Booking submitted! 🎉")
      setShowGuestModal(false)
      setIsSuccess(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuestDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.phone) {
      toast.error("Please fill in all details")
      return
    }
    
    setIsSubmitting(true)
    try {
      await api.post('/auth/send-sms', { phoneNumber: `${guestDetails.countryCode}${guestDetails.phone}` })
      setGuestStep("verify")
      toast.success("Verification code sent!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send code")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuestVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (smsCode.length < 4) {
      toast.error("Please enter a valid code")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/auth/verify-sms', { 
        phoneNumber: `${guestDetails.countryCode}${guestDetails.phone}`,
        code: smsCode 
      })
      
      // Submit booking now that phone is verified
      await submitBooking({
        name: `${guestDetails.firstName} ${guestDetails.lastName}`,
        email: guestDetails.email,
        phone: `${guestDetails.countryCode}${guestDetails.phone}`
      })
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid verification code")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#FF4444] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (notFound || !partner) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Business not found</h1>
        <p className="text-muted-foreground">The business you&apos;re looking for doesn&apos;t exist.</p>
        <button onClick={() => router.push('/')} className="text-[#FF4444] font-medium hover:underline">Go Home</button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        <BookingHeader />
        <main className="flex-1 w-full flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
           <div className="bg-emerald-50 rounded-full p-4 mb-6">
             <CheckSquare className="h-12 w-12 text-emerald-500" />
           </div>
           <h1 className="text-3xl font-bold text-foreground mb-3 text-center">{t("restaurant.reservation_submitted", "Reservation Submitted!")}</h1>
           <p className="text-muted-foreground text-center max-w-md mb-8">
             {t("restaurant.reservation_submitted_desc", "Your request has been sent successfully. You will receive a confirmation once the business approves your booking.")}
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="px-6 py-3 bg-[#FF4444] text-white rounded-xl font-bold hover:bg-[#D4444D] transition-colors shadow-sm"
           >
             {t("restaurant.make_another_booking", "Make Another Booking")}
           </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <BookingHeader />
      
      <main className="flex-1 w-full flex flex-col items-center">
        {isRestaurant ? (
          (branches.length > 1 && !selectedBranch) ? (
            <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
              <BusinessHero
                name={partner.businessName}
                image={partner.image}
                rating={4.9}
                reviewCount={124}
                address={t("book.multipleLocations", "Multiple Locations")}
                status={t("book.openNow", "Open Now")}
                estimatedWait={t("book.waitDesc", "5 - 10 Minutes")}
              />
              <BranchSelector branches={branches} onSelect={setSelectedBranch} />
            </div>
          ) : (
            <RestaurantCustomerApp
              partner={partner}
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchSelect={handleBranchSelect}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              selectedEndTime={selectedEndTime}
              setSelectedEndTime={setSelectedEndTime}
              reservationNotes={reservationNotes}
              setReservationNotes={setReservationNotes}
              partySize={partySize}
              setPartySize={setPartySize}
              floors={restaurantFloors}
              tables={restaurantTables}
              reservations={restaurantReservations}
              bookedSlots={bookedSlots}
              onBookTable={(id: string) => {
                setSelectedTableId(id)
                handleConfirm(id)
              }}
            />
          )
        ) : (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
            <BusinessHero
              name={partner.businessName}
              image={partner.image}
              rating={4.9}
              reviewCount={124}
              address={selectedBranch ? (branches.find(b => b._id === selectedBranch)?.address?.city || t("book.onlineBooking", "Online Booking")) : t("book.multipleLocations", "Multiple Locations")}
              status={t("book.openNow", "Open Now")}
              estimatedWait={t("book.waitDesc", "5 - 10 Minutes")}
              viewMode={viewMode}
              onViewChange={setViewMode}
            />

            {(branches.length > 1 && !selectedBranch) ? (
              <div className="mt-12">
                <BranchSelector branches={branches} onSelect={setSelectedBranch} />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mt-8 mb-6">
                  {/* Tab Navigation */}
                  <div className="flex gap-1 p-1 bg-white rounded-xl border border-border/60 w-fit">
                    <button
                      onClick={() => setActiveTab("book")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "book"
                          ? "bg-[#FF4444] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      {isRestaurant ? t("restaurant.reserve_table", "Book Table") : t("role.customerDesc", "Book Appointment")}
                    </button>
                    <button
                      onClick={() => setActiveTab("about")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "about"
                          ? "bg-[#FF4444] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                      }`}
                    >
                      <Info className="h-4 w-4" />
                      {t("book.businessInfo", "Business Information")}
                    </button>
                    
                    {isRestaurant && (
                      <>
                        <button
                          onClick={() => setActiveTab("menu")}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === "menu"
                              ? "bg-[#FF4444] text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          }`}
                        >
                          <Info className="h-4 w-4" />
                          {t("restaurant.our_menu", "Menu")}
                        </button>
                        <button
                          onClick={() => setActiveTab("gallery")}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === "gallery"
                              ? "bg-[#FF4444] text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          }`}
                        >
                          <Info className="h-4 w-4" />
                          {t("nav.gallery", "Gallery")}
                        </button>
                      </>
                    )}
                  </div>
                  
                  {branches.length > 1 && (
                    <button 
                      onClick={() => {
                        setSelectedBranch(null);
                        setActiveTab("book");
                      }} 
                      className="text-sm font-medium text-[#FF4444] hover:underline"
                    >
                      {t("book.changeLocation", "Change Location")}
                    </button>
                  )}
                </div>

                {activeTab === "book" && (
                  <div className="space-y-10">

            {/* Services Section (Hidden for Restaurants) */}
            {!isRestaurant && (!branches.length || selectedBranch) && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#FEF2F2] text-[#FF4444] text-xs font-bold">
                    {branches.length > 0 ? "2" : "1"}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{t("book.selectServices")}</h2>
                </div>
                <ServiceSelection
                  services={branchServices as any}
                  selectedServices={selectedServices}
                  onToggle={toggleService}
                  currency={partner?.currency}
                />
              </div>
            )}

            {/* Specialist Section (Hidden for Restaurants) */}
            {!isRestaurant && selectedServices.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#FEF2F2] text-[#FF4444] text-xs font-bold">
                    {branches.length > 0 ? "3" : "2"}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{t("book.selectSpecialist")}</h2>
                </div>
                <SpecialistSelection
                  specialists={filteredSpecialists as any}
                  selectedSpecialist={selectedSpecialist}
                  onSelect={setSelectedSpecialist}
                />
              </div>
            )}

            {/* Date & Time Section */}
            {(isRestaurant || selectedSpecialist) && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#FEF2F2] text-[#FF4444] text-xs font-bold shrink-0 mt-0.5">
                    {branches.length > 0 ? (isRestaurant ? "2" : "4") : (isRestaurant ? "1" : "3")}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("book.dateAndTime", "Date & Time")}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t("book.slotsRealtime", "Available slots are updated in real-time based on your specialist choice.")}
                    </p>
                  </div>
                </div>
                <DateTimePicker
                  selectedDate={selectedDate}
                  onDateChange={(d) => d && setSelectedDate(d)}
                  selectedTime={selectedTime}
                  onTimeChange={setSelectedTime}
                  bookedSlots={bookedSlots}
                  workingHours={branches.find(b => b._id === selectedBranch)?.workingHours || []}
                  breaks={branches.find(b => b._id === selectedBranch)?.breaks || []}
                  totalDuration={totalDuration}
                />
              </div>
            )}
          </div>
        )}

        {/* About Us Tab */}
        {activeTab === "about" && viewMode === "list" && (
          <div className="mt-8 space-y-10 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">{t("book.businessInfo", "Business Information")}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {partner.publicDescription || t("book.aboutUsDefault", "Welcome to our business! We are dedicated to providing excellent services and ensuring you have the best experience possible.")}
              </p>
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
                      {(b.phoneNumbers || (b.phoneNumber ? [b.phoneNumber] : [])).map((phone, idx) => (
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

                      {b.breaks && b.breaks.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Coffee className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs">{t("book.breakTimes", "Break Times")}:</span>
                            {Array.from(new Set(b.breaks.map((br: any) => `${br.startTime} - ${br.endTime}`))).map((timeStr: any, i: number) => (
                              <span key={i} className="text-xs">{timeStr}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                        {(() => {
                          const branchServices = allServices.filter(s => !s.assignedBranches?.length || s.assignedBranches.includes(b._id))
                          const branchSpecialists = allSpecialists.filter(sp => sp.assignedBranches?.some((ab: any) => ab._id === b._id || ab === b._id))
                          return (
                            <>
                              {branchServices.length > 0 && (
                                <div>
                                  <span className="text-xs font-bold text-foreground block mb-1">{t("book.availableServices", "Available Services:")}</span>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{branchServices.map(s => s.name).join(', ')}</p>
                                </div>
                              )}
                              {branchSpecialists.length > 0 && (
                                <div>
                                  <span className="text-xs font-bold text-foreground block mb-1">{t("specialistsPage.specialists", "Specialists")}:</span>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{branchSpecialists.map(sp => sp.name).join(', ')}</p>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>

                      {b.location?.latitude && b.location?.longitude && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${b.location.latitude},${b.location.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                          >
                            <Map className="h-3.5 w-3.5" />
                            {t("book.googleMaps", "Google Maps")}
                          </a>
                          <a 
                            href={`https://yandex.com/maps/?rtext=~${b.location.latitude},${b.location.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                          >
                            <Map className="h-3.5 w-3.5" />
                            {t("book.yandexMaps", "Yandex Maps")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {branches.length === 0 && <p className="text-muted-foreground">{t("book.noLocations", "No locations available.")}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">{t("book.ourServices", "Our Services")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {allServices.map(s => (
                  <div key={s._id} className="p-4 rounded-xl border border-border/60 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex gap-4">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="h-16 w-16 rounded-lg object-cover border border-border/60 shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-[#FEF2F2] flex items-center justify-center border border-border/60 shrink-0">
                          <CheckSquare className="h-6 w-6 text-[#FF4444]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{s.name}</h3>
                        {s.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 flex-1">
                      {(() => {
                        const serviceBranches = branches.filter(b => !s.assignedBranches?.length || s.assignedBranches.includes(b._id))
                        const serviceSpecialists = allSpecialists.filter(sp => sp.assignedServices?.some((as: any) => as._id === s._id || as === s._id))
                        return (
                          <>
                            {serviceBranches.length > 0 && (
                              <div>
                                <span className="text-xs font-bold text-foreground block mb-0.5">{t("book.availableAt", "Available at:")}</span>
                                <p className="text-xs text-muted-foreground line-clamp-1">{serviceBranches.map(b => b.address.line1 || b.address.city).join(', ')}</p>
                              </div>
                            )}
                            {serviceSpecialists.length > 0 && (
                              <div>
                                <span className="text-xs font-bold text-foreground block mb-0.5">{t("book.performedBy", "Performed by:")}</span>
                                <p className="text-xs text-muted-foreground line-clamp-2">{serviceSpecialists.map(sp => sp.name).join(', ')}</p>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                      <span className="text-sm font-medium text-foreground">{formatPrice(s.price, partner?.currency)}</span>
                      <span className="text-sm text-muted-foreground">{s.duration} min</span>
                    </div>
                  </div>
                ))}
                {allServices.length === 0 && <p className="text-muted-foreground">{t("book.noServices", "No services listed.")}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">{t("book.ourSpecialists", "Our Specialists")}</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {allSpecialists.map(sp => (
                  <div key={sp._id} className="p-4 rounded-xl border border-border/60 bg-white shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <img src={sp.image} alt={sp.name} className="h-12 w-12 rounded-full object-cover border border-border" />
                      <div>
                        <h3 className="font-semibold text-foreground">{sp.name}</h3>
                        <p className="text-xs text-muted-foreground">{sp.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-border/40">
                      {(() => {
                        const spBranches = branches.filter(b => sp.assignedBranches?.some((ab: any) => ab._id === b._id || ab === b._id))
                        const spServices = allServices.filter(s => sp.assignedServices?.some((as: any) => as._id === s._id || as === s._id))
                        return (
                          <>
                            {spBranches.length > 0 && (
                              <div>
                                <span className="text-xs font-bold text-foreground block mb-0.5">{t("book.worksAt", "Works at:")}</span>
                                <p className="text-xs text-muted-foreground line-clamp-1">{spBranches.map(b => b.address.line1 || b.address.city).join(', ')}</p>
                              </div>
                            )}
                            {spServices.length > 0 && (
                              <div>
                                <span className="text-xs font-bold text-foreground block mb-0.5">{t("common.services", "Services:")}</span>
                                <p className="text-xs text-muted-foreground line-clamp-2">{spServices.map(s => s.name).join(', ')}</p>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                ))}
                {allSpecialists.length === 0 && <p className="text-muted-foreground">{t("book.noSpecialists", "No specialists listed.")}</p>}
              </div>
            </div>
          </div>
        )}

        {isRestaurant && activeTab === "menu" && viewMode === "list" && (
          <div className="mt-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-foreground">Our Menu</h2>
            {branches.length > 0 && !selectedBranch ? (
              <p className="text-muted-foreground">Please select a branch first to view the menu.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {(() => {
                  const branchMenu = menuItems.filter(m => !m.branchId || m.branchId === selectedBranch || m.branchId?._id === selectedBranch)
                  
                  if (branchMenu.length === 0) {
                    return <p className="text-muted-foreground col-span-full">No menu items available for this branch.</p>
                  }

                  return branchMenu.map((item: any) => (
                    <div key={item._id} className="p-4 rounded-xl border border-border/60 bg-white shadow-sm flex flex-col gap-3">
                      <div className="flex gap-4">
                        {item.image ? (
                          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#FAFAFA] border border-border/60">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 shrink-0 rounded-lg bg-[#FAFAFA] border border-border/60 flex items-center justify-center">
                            <Info className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{item.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4444]">{item.category}</span>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{formatPrice(item.price, partner?.currency)}</span>
                        {!item.isAvailable && (
                          <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">Sold Out</span>
                        )}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        )}

        {isRestaurant && activeTab === "gallery" && viewMode === "list" && (
          <div className="mt-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-foreground">Gallery</h2>
            {(() => {
              const branchToDisplay = selectedBranch 
                ? branches.find(b => b._id === selectedBranch) 
                : branches[0]
              
              const gallery = branchToDisplay?.gallery || []
              
              if (gallery.length === 0) {
                return <p className="text-muted-foreground">No photos available for this location.</p>
              }

              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((img: any, idx: number) => (
                    <div key={idx} className="group relative aspect-square bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <img src={img.url} alt={`Gallery image ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider capitalize w-fit">
                          {img.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}
              </>
            )}
          </div>
        )}
      </main>

      {!isRestaurant && activeTab === "book" && (
        <BookingFooter
          totalPrice={totalPrice}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
          currency={partner?.currency}
        />
      )}
      {/* Guest Checkout Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-border/60 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("book.guestCheckout", "Guest Checkout")}</h2>
              <button 
                onClick={() => setShowGuestModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {guestStep === "details" ? (
                <form onSubmit={handleGuestDetailsSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">{t("common.firstName", "First Name")}</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 bg-[#FAFAFA] border border-border rounded-lg text-sm"
                        value={guestDetails.firstName}
                        onChange={e => setGuestDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">{t("common.lastName", "Last Name")}</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 bg-[#FAFAFA] border border-border rounded-lg text-sm"
                        value={guestDetails.lastName}
                        onChange={e => setGuestDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">{t("common.phone", "Phone Number")}</label>
                    <div className="flex gap-2">
                      <select 
                        className="w-24 px-3 py-2 bg-[#FAFAFA] border border-border rounded-lg text-sm font-medium"
                        value={guestDetails.countryCode}
                        onChange={e => setGuestDetails(prev => ({ ...prev, countryCode: e.target.value }))}
                      >
                        {countryCodesList.map((cc) => (
                          <option key={cc.code} value={cc.code}>
                            {cc.flag} {cc.code}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="tel" 
                        required
                        className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-border rounded-lg text-sm"
                        placeholder={getPhonePlaceholder(guestDetails.countryCode, countryCodesList)}
                        value={guestDetails.phone}
                        onChange={e => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 py-2.5 bg-[#FF4444] text-white rounded-lg font-bold text-sm hover:bg-[#d64c54] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : null}
                    {t("book.nextVerify", "Continue")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleGuestVerifySubmit} className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground mb-6">
                    {t("book.enterVerificationCode", "Enter the verification code sent to")} <br />
                    <span className="font-bold text-foreground">{guestDetails.countryCode} {guestDetails.phone}</span>
                  </p>
                  
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-widest text-2xl px-3 py-3 bg-[#FAFAFA] border border-border rounded-lg"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value)}
                  />
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || smsCode.length < 4}
                    className="w-full mt-6 py-2.5 bg-[#FF4444] text-white rounded-lg font-bold text-sm hover:bg-[#d64c54] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : null}
                    {t("book.confirmBooking", "Confirm Booking")}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setGuestStep("details")}
                    className="w-full mt-2 py-2 text-muted-foreground font-semibold text-xs hover:text-foreground"
                  >
                    {t("common.back", "Back to edit details")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
