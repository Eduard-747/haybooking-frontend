"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { usePartner } from "@/hooks/usePartner"
import { useAuth } from "@/components/auth/auth-provider"
import { MapPin, Clock, ChevronRight, CheckCircle, User } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { formatPrice } from "@/lib/currency"

interface BranchData {
  _id: string
  address: { line1: string; city: string; country: string }
  phoneNumber: string
}

interface ServiceData {
  _id: string
  name: string
  duration: number
  price: number
  assignedBranches?: string[]
}

interface SpecialistData {
  _id: string
  name: string
  assignedServices: any[]
  assignedBranches?: any[]
}

const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`)

export default function DashboardBookPage() {
  const { partnerId, partner } = usePartner()
  const { user } = useAuth()

  const [branches, setBranches] = useState<BranchData[]>([])
  const [services, setServices] = useState<ServiceData[]>([])
  const [specialists, setSpecialists] = useState<SpecialistData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientPhone, setClientPhone] = useState("")
  const [clientName, setClientName] = useState("")

  useEffect(() => {
    if (!partnerId) return
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [bRes, sRes, spRes] = await Promise.all([
          api.get(`/branches?partnerId=${partnerId}`),
          api.get(`/services?partnerId=${partnerId}`),
          api.get(`/specialists?partnerId=${partnerId}`),
        ])
        setBranches(bRes.data || [])
        setServices(sRes.data || [])
        setSpecialists(spRes.data || [])
      } catch { console.error("Failed to load data") }
      finally { setIsLoading(false) }
    }
    fetchData()
  }, [partnerId])

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedSpecialist || !selectedDate) {
        setBookedSlots([])
        return
      }
      try {
        const dateStr = selectedDate.toISOString()
        const res = await api.get(`/bookings/availability?specialistId=${selectedSpecialist}&date=${dateStr}`)
        setBookedSlots(res.data.bookedSlots || [])
        if (selectedTime && res.data.bookedSlots?.includes(selectedTime)) {
          setSelectedTime(null)
          toast.error("Your selected time is no longer available.")
        }
      } catch (err) {
        console.error("Failed to fetch availability", err)
      }
    }
    fetchBookedSlots()
  }, [selectedSpecialist, selectedDate])

  const branchServices = services.filter(s => {
    if (!selectedBranch) return true
    if (!s.assignedBranches || s.assignedBranches.length === 0) return true
    return s.assignedBranches.includes(selectedBranch)
  })

  const availableSpecialists = specialists.filter(sp => {
    if (selectedBranch && sp.assignedBranches && sp.assignedBranches.length > 0) {
      const hasBranch = sp.assignedBranches.some(b => (b._id || b) === selectedBranch)
      if (!hasBranch) return false
    }
    if (selectedServices.length > 0) {
      const supportsAllServices = selectedServices.every(serviceId => 
        sp.assignedServices && sp.assignedServices.some(s => (s._id || s) === serviceId)
      )
      if (!supportsAllServices) return false
    }
    return true
  })

  const totalPrice = services
    .filter(s => selectedServices.includes(s._id))
    .reduce((sum, s) => sum + s.price, 0)
  const totalDuration = services
    .filter(s => selectedServices.includes(s._id))
    .reduce((sum, s) => sum + s.duration, 0)

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d
  })

  const handleSubmit = async () => {
    if (!selectedTime || selectedServices.length === 0 || !selectedBranch) {
      toast.error("Please select a branch, at least one service, and a time")
      return
    }
    
    if (!clientName.trim() || !clientPhone.trim()) {
      toast.error("Please provide client name and phone number")
      return
    }

    setIsSubmitting(true)
    try {
      const [hh, mm] = selectedTime.split(':')
      const startTime = new Date(
        selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
        parseInt(hh, 10), parseInt(mm, 10), 0
      )
      const endTime = new Date(startTime.getTime() + totalDuration * 60000)

      const payload: any = {
        partnerId,
        branchId: selectedBranch,
        serviceIds: selectedServices,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        guestName: clientName,
        guestPhone: clientPhone,
      }
      if (selectedSpecialist) payload.specialistId = selectedSpecialist

      await api.post('/bookings', payload)
      toast.success("Booking created! 🎉")
      
      // Reset form
      setSelectedBranch(null)
      setSelectedServices([])
      setSelectedSpecialist(null)
      setSelectedTime(null)
      setClientPhone("")
      setClientName("")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create bookings")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/book" />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Booking</h1>
              <p className="text-muted-foreground mt-1">Create a walk-in or phone booking for a client.</p>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Client Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text" placeholder="Client Name" value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                />
                <input
                  type="tel" placeholder="Phone Number" value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#E5555E]/20 focus:border-[#E5555E]"
                />
              </div>
            </div>

            {/* Branch Selection */}
            {branches.length > 0 && (
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-3">
                <h3 className="font-semibold text-foreground">Branch</h3>
                <div className="flex flex-wrap gap-2">
                  {branches.map(b => (
                    <button
                      key={b._id}
                      onClick={() => setSelectedBranch(b._id === selectedBranch ? null : b._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        selectedBranch === b._id
                          ? 'border-[#E5555E] bg-[#FDF6F6] text-[#E5555E]'
                          : 'border-border/60 hover:border-[#C69C9B]'
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {b.address.line1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service Selection */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-3">
              <h3 className="font-semibold text-foreground">Services</h3>
              <div className="space-y-2">
                {branchServices.map(s => (
                  <label
                    key={s._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedServices.includes(s._id)
                        ? 'border-[#E5555E] bg-[#FDF6F6]' : 'border-border/60 hover:border-[#C69C9B]'
                    }`}
                  >
                    <input type="checkbox" checked={selectedServices.includes(s._id)}
                      onChange={() => setSelectedServices(prev =>
                        prev.includes(s._id) ? prev.filter(id => id !== s._id) : [...prev, s._id]
                      )}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selectedServices.includes(s._id) ? 'border-[#E5555E] bg-[#E5555E]' : 'border-border'
                    }`}>
                      {selectedServices.includes(s._id) && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="flex-1 text-sm font-medium">{s.name}</span>
                    <span className="text-sm text-muted-foreground">{s.duration}min</span>
                    <span className="text-sm font-bold">{formatPrice(s.price, partner?.currency)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Specialist */}
            {availableSpecialists.length > 0 && selectedBranch && selectedServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-3">
                <h3 className="font-semibold text-foreground">Specialist</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSpecialist(null)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedSpecialist === null
                        ? 'border-[#E5555E] bg-[#FDF6F6] text-[#E5555E]' : 'border-border/60 hover:border-[#C69C9B]'
                    }`}
                  >
                    Any Available
                  </button>
                  {availableSpecialists.map(sp => (
                    <button
                      key={sp._id}
                      onClick={() => setSelectedSpecialist(sp._id)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        selectedSpecialist === sp._id
                          ? 'border-[#E5555E] bg-[#FDF6F6] text-[#E5555E]' : 'border-border/60 hover:border-[#C69C9B]'
                      }`}
                    >
                      {sp.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Date & Time</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((d, i) => {
                  const isSelected = selectedDate.toDateString() === d.toDateString()
                  return (
                    <button key={i} onClick={() => setSelectedDate(d)}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg border shrink-0 text-xs transition-all ${
                        isSelected ? 'border-[#E5555E] bg-[#FDF6F6] text-[#E5555E]' : 'border-border/60 hover:border-[#C69C9B]'
                      }`}
                    >
                      <span className="font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="text-lg font-bold">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {HOURS.map(time => {
                  const isBooked = bookedSlots.includes(time)
                  return (
                  <button key={time} onClick={() => setSelectedTime(time)}
                    disabled={isBooked}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedTime === time ? 'border-[#E5555E] bg-[#E5555E] text-white' : 
                      isBooked ? 'bg-muted/50 text-muted-foreground/50 border-border/40 cursor-not-allowed line-through' :
                      'border-border/60 hover:border-[#C69C9B]'
                    }`}
                  >
                    {time}
                  </button>
                  )
                })}
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">{selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{totalDuration} min</span>
                </div>
                <span className="text-xl font-bold text-[#E5555E]">{formatPrice(totalPrice, partner?.currency)}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedServices.length === 0 || !selectedTime || !selectedBranch || !clientName.trim() || !clientPhone.trim()}
                className="w-full py-3 bg-[#E5555E] text-white rounded-lg text-sm font-semibold hover:bg-[#d44850] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
