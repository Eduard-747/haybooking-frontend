"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Plus, Pencil, Trash2, MapPin, Phone, Clock, X, Loader2, Search } from "lucide-react"
import api from "@/lib/api"
import { usePartner } from "@/hooks/usePartner"
import { TimePicker } from "@/components/ui/time-picker"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { useTranslation } from "react-i18next"

// Dynamically import map components to avoid SSR issues
const BranchMapOverview = dynamic(() => import("@/components/maps/branch-map-overview"), { ssr: false })
const LocationPicker = dynamic(() => import("@/components/maps/location-picker"), { ssr: false })

interface Branch {
  _id: string
  address: { line1: string; city: string; country: string; zipCode: string }
  phoneNumbers?: string[]
  phoneNumber?: string
  workingHours: { weekday: number; openTime: string; closeTime: string }[]
  breaks?: { weekday: number; startTime: string; endTime: string }[]
  location?: { latitude: number; longitude: number }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina",
  "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
  "Guatemala", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait",
  "Kyrgyzstan", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Malaysia", "Malta",
  "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Myanmar", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Nigeria", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Turkmenistan", "UAE",
  "Uganda", "Ukraine", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
]

const emptyForm = {
  line1: "", city: "", country: "", zipCode: "", phoneNumbers: [""],
  openTime: "09:00", closeTime: "18:00",
  workdays: [1, 2, 3, 4, 5],
  latitude: 0, longitude: 0,
  breaks: [] as { weekday: number; startTime: string; endTime: string }[],
}

export default function BranchesPage() {
  const { t } = useTranslation()
  const { partnerId, loading: partnerLoading } = usePartner()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const countryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES
    return COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
  }, [countrySearch])

  const fetchBranches = async () => {
    if (!partnerId) return
    try {
      setIsLoading(true)
      const res = await api.get(`/branches?partnerId=${partnerId}`)
      setBranches(res.data)
    } catch { console.error("Failed to load branches") }
    finally { setIsLoading(false) }
  }

  useEffect(() => {
    if (partnerId) fetchBranches()
    else if (!partnerLoading) setIsLoading(false)
  }, [partnerId, partnerLoading])

  const openAdd = () => { setForm(emptyForm); setEditId(null); setCountrySearch(""); setShowModal(true) }

  const openEdit = (b: Branch) => {
    const wh = b.workingHours[0] || {}
    setForm({
      line1: b.address.line1, city: b.address.city, country: b.address.country, zipCode: b.address.zipCode,
      phoneNumbers: b.phoneNumbers && b.phoneNumbers.length > 0 ? b.phoneNumbers : (b.phoneNumber ? [b.phoneNumber] : [""]),
      openTime: (wh as any).openTime || "09:00",
      closeTime: (wh as any).closeTime || "18:00",
      workdays: b.workingHours.map(h => h.weekday),
      latitude: b.location?.latitude || 0,
      longitude: b.location?.longitude || 0,
      breaks: b.breaks || [],
    })
    setCountrySearch(b.address.country)
    setEditId(b._id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("branchesPage.deleteConfirm", "Delete this branch?"))) return
    try {
      await api.delete(`/branches/${id}`)
      toast.success("Branch deleted")
      fetchBranches()
    } catch { toast.error("Failed to delete branch") }
  }

  const toggleWorkday = (d: number) => {
    setForm(prev => ({
      ...prev,
      workdays: prev.workdays.includes(d) ? prev.workdays.filter(x => x !== d) : [...prev.workdays, d]
    }))
  }

  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data && data.address) {
        const newCity = data.address.city || data.address.town || data.address.village || "";
        const newCountry = data.address.country || "";
        setForm(prev => ({
          ...prev,
          line1: data.address.road ? `${data.address.road} ${data.address.house_number || ''}`.trim() : prev.line1,
          city: newCity || prev.city,
          country: newCountry || prev.country,
          zipCode: data.address.postcode || prev.zipCode,
        }))
        if (newCountry) setCountrySearch(newCountry);
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e)
    }
  }, [])

  // Auto-geocode effect
  useEffect(() => {
    if (!showModal) return;
    // Require at least line1 and city to be 3+ characters before auto-geocoding
    if (!form.line1 || form.line1.length < 3 || !form.city || form.city.length < 3) {
      setMapError(null);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      setMapError(null);
      try {
        const query = `${form.line1}, ${form.city}, ${form.country}`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setForm(prev => ({
            ...prev,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          }));
        } else {
          setMapError("Address could not be located on the map. Please refine it.");
        }
      } catch (e) {
        setMapError("Map search failed. Please check your connection.");
      } finally {
        setIsGeocoding(false);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [form.line1, form.city, form.country, showModal]);

  const handleForwardGeocode = async () => {
    if (!form.line1 && !form.city) {
      toast.error("Please enter an address first");
      return;
    }
    setIsGeocoding(true);
    setMapError(null);
    try {
      toast.loading("Searching location...");
      const query = `${form.line1}, ${form.city}, ${form.country}`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      toast.dismiss();
      if (data && data.length > 0) {
        setForm(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
        toast.success("Location updated on map");
      } else {
        toast.error("Could not find exact location on map.");
        setMapError("Address could not be located on the map. Please refine it.");
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Map search failed");
      setMapError("Map search failed. Please check your connection.");
    } finally {
      setIsGeocoding(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId) return
    setSaving(true)
    try {
      const finalBreaks: { weekday: number, startTime: string, endTime: string }[] = [];
      form.breaks.forEach(b => {
        if (b.weekday === -1) {
          form.workdays.forEach(wd => {
            finalBreaks.push({ weekday: wd, startTime: b.startTime, endTime: b.endTime });
          });
        } else {
          finalBreaks.push(b);
        }
      });

      const payload: any = {
        partnerId,
        address: { line1: form.line1, city: form.city, country: form.country, zipCode: form.zipCode },
        phoneNumbers: form.phoneNumbers.filter(p => p.trim() !== ""),
        workingHours: form.workdays.map(wd => ({ weekday: wd, openTime: form.openTime, closeTime: form.closeTime })),
        breaks: finalBreaks,
      }
      if (form.latitude && form.longitude) {
        payload.location = { latitude: form.latitude, longitude: form.longitude }
      }
      if (editId) {
        await api.put(`/branches/${editId}`, payload)
        toast.success("Branch updated")
      } else {
        await api.post('/branches', payload)
        toast.success("Branch created")
      }
      setShowModal(false)
      fetchBranches()
    } catch { toast.error("Failed to save branch") }
    finally { setSaving(false) }
  }

  // Prepare map markers
  const mapMarkers = branches
    .filter(b => b.location?.latitude && b.location?.longitude)
    .map(b => ({
      lat: b.location!.latitude,
      lng: b.location!.longitude,
      label: `${b.address.city} - ${b.address.line1}`,
    }))

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/branches" />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("branchesPage.branches", "Branches")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{branches.length} {t("branchesPage.locations", "locations")}</p>
              </div>
              <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#C69C9B] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                <Plus className="h-4 w-4" /> {t("branchesPage.addBranch", "Add Branch")}
              </button>
            </div>

            {/* Map Overview */}
            {mapMarkers.length > 0 && (
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-border/40">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#C69C9B]" /> {t("branchesPage.allLocations", "All Locations")}
                  </h3>
                </div>
                <div className="h-[300px] relative z-0">
                  <BranchMapOverview markers={mapMarkers} />
                </div>
              </div>
            )}

            {(isLoading || partnerLoading) ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#C69C9B]" />
              </div>
            ) : branches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-border/40 text-center">
                <MapPin className="h-12 w-12 text-[#C69C9B]/40 mb-3" />
                <h2 className="font-bold text-foreground mb-1">{t("branchesPage.noBranchesYet", "No branches yet")}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t("branchesPage.addFirstBranchDesc", "Add your first branch to start accepting bookings.")}</p>
                <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#C69C9B] text-white text-sm font-bold rounded-xl">
                  <Plus className="h-4 w-4" /> {t("branchesPage.addFirstBranch", "Add First Branch")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {branches.map(b => (
                  <div key={b._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#FDF6F6] flex items-center justify-center shrink-0">
                          <MapPin className="h-5 w-5 text-[#C69C9B]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{b.address.city}</h3>
                          <p className="text-xs text-muted-foreground">{b.address.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-[#FAFAFA] rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(b._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {b.address.line1}, {b.address.zipCode}
                      </div>
                      {(b.phoneNumbers || (b.phoneNumber ? [b.phoneNumber] : [])).map((phone, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                        </div>
                      ))}
                      {b.workingHours.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {t(`calendar.${WEEKDAYS[b.workingHours[0].weekday].toLowerCase()}`, WEEKDAYS[b.workingHours[0].weekday])} – {t(`calendar.${WEEKDAYS[b.workingHours[b.workingHours.length - 1].weekday].toLowerCase()}`, WEEKDAYS[b.workingHours[b.workingHours.length - 1].weekday])} · {b.workingHours[0].openTime} – {b.workingHours[0].closeTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <h2 className="text-lg font-bold">{editId ? t("branchesPage.editBranch", "Edit Branch") : t("branchesPage.addBranch", "Add Branch")}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative" ref={countryRef}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("branchesPage.country", "Country")}</label>
                  <input
                    value={countrySearch}
                    onChange={e => { setCountrySearch(e.target.value); setShowCountryDropdown(true); setForm(p => ({...p, country: e.target.value})) }}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder={t("branchesPage.selectCountry", "Select country...")}
                    className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]"
                  />
                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCountries.slice(0, 15).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setForm(p => ({...p, country: c})); setCountrySearch(c); setShowCountryDropdown(false) }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#FDF6F6] transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("branchesPage.city", "City")}</label>
                  <input required value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))}
                    placeholder="Yerevan" className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("branchesPage.streetAddress", "Street Address")}</label>
                <input required value={form.line1} onChange={e => setForm(p => ({...p, line1: e.target.value}))}
                  disabled={!form.country || !form.city}
                  title={(!form.country || !form.city) ? "Please select Country and City first" : ""}
                  placeholder="123 Main Street" className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B] disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
              <div className="w-1/2 pr-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("branchesPage.zipCode", "Zip Code")}</label>
                <input value={form.zipCode} onChange={e => setForm(p => ({...p, zipCode: e.target.value}))}
                  placeholder="0001" className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center justify-between">
                  {t("branchesPage.phone", "Phone Numbers")}
                  {form.phoneNumbers.length < 4 && (
                    <button type="button" onClick={() => setForm(p => ({...p, phoneNumbers: [...p.phoneNumbers, ""]}))} className="text-xs font-semibold text-[#E5555E] flex items-center gap-1 hover:underline normal-case">
                      <Plus className="h-3 w-3" /> {t("common.add", "Add")}
                    </button>
                  )}
                </label>
                <div className="space-y-2">
                  {form.phoneNumbers.map((phone, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input required value={phone} onChange={e => {
                        const newPhones = [...form.phoneNumbers];
                        newPhones[idx] = e.target.value;
                        setForm(p => ({...p, phoneNumbers: newPhones}));
                      }} placeholder="+374 11 000000" className="flex-1 px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#C69C9B]" />
                      {form.phoneNumbers.length > 1 && (
                        <button type="button" onClick={() => {
                          const newPhones = form.phoneNumbers.filter((_, i) => i !== idx);
                          setForm(p => ({...p, phoneNumbers: newPhones}));
                        }} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg bg-[#FAFAFA] border border-border/60 transition-colors"><X className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Location Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    {t("branchesPage.pinLocation", "📍 Pin Location on Map")}
                    {isGeocoding && <span className="ml-2 text-xs text-[#E5555E] font-medium normal-case inline-flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Locating...</span>}
                  </label>
                  <button type="button" onClick={handleForwardGeocode} disabled={isGeocoding} className="text-xs font-semibold text-[#E5555E] flex items-center gap-1 hover:underline disabled:opacity-50">
                    <Search className="h-3 w-3" /> {t("branchesPage.findOnMap", "Find on Map")}
                  </button>
                </div>
                {mapError && (
                  <p className="text-xs text-red-500 mb-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">{mapError}</p>
                )}
                <div className="h-[200px] rounded-xl overflow-hidden border border-border/60 relative z-0">
                  <LocationPicker
                    initialLat={form.latitude || 40.1872}
                    initialLng={form.longitude || 44.5152}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
                {form.latitude !== 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📌 {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t("branchesPage.workingDays", "Working Days")}</label>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAYS.map((d, i) => (
                    <button type="button" key={i} onClick={() => toggleWorkday(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.workdays.includes(i) ? "bg-[#C69C9B] text-white border-[#C69C9B]" : "bg-[#FAFAFA] text-muted-foreground border-border/60"}`}>
                      {t(`calendar.${d.toLowerCase()}`, d)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("branchesPage.operatingHours", "Operating Hours")}</label>
                <div className="flex gap-2">
                  <TimePicker value={form.openTime} onChange={(val) => setForm(p => ({...p, openTime: val}))} />
                  <span className="text-muted-foreground self-center">-</span>
                  <TimePicker value={form.closeTime} onChange={(val) => setForm(p => ({...p, closeTime: val}))} />
                </div>
              </div>

              {/* Break Periods */}
              <div className="pt-4 border-t border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">{t("branchesPage.breakPeriods", "Break Periods")}</label>
                  <button type="button" onClick={() => setForm(p => ({ ...p, breaks: [...p.breaks, { weekday: -1, startTime: "13:00", endTime: "14:00" }] }))} className="text-xs font-semibold text-[#E5555E] flex items-center gap-1 hover:underline">
                    <Plus className="h-3 w-3" /> {t("branchesPage.addBreak", "Add Break")}
                  </button>
                </div>
                {form.breaks.map((b, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <select value={b.weekday} onChange={e => {
                      const newBreaks = [...form.breaks];
                      newBreaks[idx].weekday = parseInt(e.target.value);
                      setForm(p => ({ ...p, breaks: newBreaks }));
                    }} className="flex-1 px-2 py-1.5 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm outline-none focus:border-[#C69C9B]">
                      <option value="-1">{t("branchesPage.allWorkingDays", "All Working Days")}</option>
                      {WEEKDAYS.map((d, i) => <option key={i} value={i}>{t(`calendar.${d.toLowerCase()}`, d)}</option>)}
                    </select>
                    <TimePicker 
                      value={b.startTime} 
                      onChange={val => {
                        const newBreaks = [...form.breaks];
                        newBreaks[idx].startTime = val;
                        setForm(p => ({ ...p, breaks: newBreaks }));
                      }} 
                    />
                    <span className="text-muted-foreground">-</span>
                    <TimePicker 
                      value={b.endTime} 
                      onChange={val => {
                        const newBreaks = [...form.breaks];
                        newBreaks[idx].endTime = val;
                        setForm(p => ({ ...p, breaks: newBreaks }));
                      }} 
                    />
                    <button type="button" onClick={() => {
                      const newBreaks = form.breaks.filter((_, i) => i !== idx);
                      setForm(p => ({ ...p, breaks: newBreaks }));
                    }} className="p-1.5 text-muted-foreground hover:text-red-500 rounded transition-colors"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                {form.breaks.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">{t("branchesPage.noBreaksDefined", "No break periods defined.")}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border/60 text-sm font-semibold rounded-xl hover:bg-[#FAFAFA] transition-colors">{t("common.cancel", "Cancel")}</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#C69C9B] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl shadow-sm disabled:opacity-50 transition-colors">
                  {saving ? t("common.saving", "Saving...") : editId ? t("common.update", "Update") : t("common.create", "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
