"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Plus, Pencil, Trash2, User, X, Loader2, Camera } from "lucide-react"
import api from "@/lib/api"
import { usePartner } from "@/hooks/usePartner"
import { useBranchContext } from "@/components/dashboard/branch-context"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface Specialist {
  _id: string
  name: string
  image?: string
  assignedBranches: { _id: string; address?: { city: string; line1?: string } }[]
  assignedServices: { _id: string; name: string }[]
}

interface Branch { _id: string; address: { city: string; line1?: string } }
interface Service { _id: string; name: string }

export default function SpecialistsPage() {
  const { t } = useTranslation()
  const { partnerId, loading: partnerLoading } = usePartner()
  const { selectedBranchId } = useBranchContext()
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", image: "", selectedBranches: [] as string[], selectedServices: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const fetchAll = async () => {
    if (!partnerId) return
    try {
      setIsLoading(true)
      const [sRes, bRes, svRes] = await Promise.all([
        api.get(`/specialists?partnerId=${partnerId}`),
        api.get(`/branches?partnerId=${partnerId}`),
        api.get(`/services?partnerId=${partnerId}`),
      ])
      setSpecialists(sRes.data)
      setBranches(bRes.data)
      setServices(svRes.data)
    } catch { console.error("Failed to load specialists") }
    finally { setIsLoading(false) }
  }

  useEffect(() => {
    if (partnerId) fetchAll()
    else if (!partnerLoading) setIsLoading(false)
  }, [partnerId, partnerLoading])

  const openAdd = () => {
    setForm({ name: "", image: "", selectedBranches: [], selectedServices: [] })
    setEditId(null); setShowModal(true)
  }

  const openEdit = (s: Specialist) => {
    setForm({
      name: s.name,
      image: s.image || "",
      selectedBranches: s.assignedBranches.map(b => b._id),
      selectedServices: s.assignedServices.map(sv => sv._id),
    })
    setEditId(s._id); setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("specialistsPage.deleteConfirm", "Delete this specialist?"))) return
    try {
      await api.delete(`/specialists/${id}`)
      toast.success(t("common.deleted", "Deleted"))
      fetchAll()
    } catch { toast.error("Failed to delete") }
  }

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId) return
    setSaving(true)
    try {
      const payload = {
        partnerId,
        name: form.name,
        image: form.image,
        assignedBranches: form.selectedBranches,
        assignedServices: form.selectedServices,
      }
      if (editId) {
        await api.put(`/specialists/${editId}`, payload)
        toast.success(t("common.updated", "Updated"))
      } else {
        await api.post('/specialists', payload)
        toast.success(t("common.created", "Created"))
      }
      setShowModal(false)
      fetchAll()
    } catch { toast.error("Failed to save specialist") }
    finally { setSaving(false) }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, image: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const filtered = specialists
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => !selectedBranchId || s.assignedBranches.some(b => b._id === selectedBranchId || (b as unknown as string) === selectedBranchId))

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
      <DashboardSidebar activePath="/dashboard/specialists" />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("specialistsPage.specialists", "Specialists")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{specialists.length} {t("specialistsPage.teamMembers", "team members")}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t("specialistsPage.searchSpecialists", "Search specialists...")}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-border/60 rounded-xl text-sm focus:outline-none focus:border-[#FF4444]"
                />
                <button onClick={openAdd} className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-[#FF4444] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap">
                  <Plus className="h-4 w-4 shrink-0" /> {t("specialistsPage.addSpecialist", "Add Specialist")}
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: t("specialistsPage.totalSpecialists", "Total Specialists"), value: specialists.length },
                { label: t("specialistsPage.totalBranches", "Total Branches"), value: branches.length },
                { label: t("specialistsPage.totalServices", "Total Services"), value: services.length },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-border/60 shadow-sm p-5 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {(isLoading || partnerLoading) ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF4444]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-border/40 text-center">
                <User className="h-12 w-12 text-[#FF4444]/40 mb-3" />
                <h2 className="font-bold text-foreground mb-1">{t("specialistsPage.noSpecialistsYet", "No specialists yet")}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t("specialistsPage.addFirstTeamMember", "Add your first team member to assign them to services.")}</p>
                <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4444] text-white text-sm font-bold rounded-xl">
                  <Plus className="h-4 w-4" /> {t("specialistsPage.addSpecialist", "Add Specialist")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(s => (
                  <div key={s._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="h-12 w-12 rounded-full object-cover border border-border/60" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                            <User className="h-6 w-6 text-[#FF4444]" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-foreground">{s.name}</h3>
                          <p className="text-xs text-muted-foreground">{t("specialistsPage.specialist", "Specialist")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-[#FAFAFA] rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {s.assignedServices.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("common.services", "Services")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.assignedServices.map(sv => (
                            <span key={sv._id} className="px-2 py-0.5 bg-[#FAFAFA] border border-border/50 rounded text-xs text-muted-foreground">{sv.name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {s.assignedBranches.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("branchesPage.branches", "Branches")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.assignedBranches.map(b => (
                            <span key={b._id} className="px-2 py-0.5 bg-[#FEF2F2] border border-[#FF4444]/20 rounded text-xs text-[#FF4444] font-medium">{b.address?.line1 ? `${b.address.line1}, ${b.address.city}` : b.address?.city || t("branchesPage.branches", "Branch")}</span>
                          ))}
                        </div>
                      </div>
                    )}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <h2 className="text-lg font-bold">{editId ? t("specialistsPage.editSpecialist", "Edit Specialist") : t("specialistsPage.addSpecialist", "Add Specialist")}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{t("specialistsPage.fullName", "Full Name")}</label>
                <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  placeholder="Jane Smith" className="w-full px-4 py-2 bg-[#FAFAFA] border border-border/60 rounded-lg text-sm focus:outline-none focus:border-[#FF4444]" />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t("specialistsPage.specialistPhoto", "Specialist Photo")}</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="h-16 w-16 rounded-full bg-[#FEF2F2] border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                      {form.image ? (
                        <img src={form.image} alt="Specialist" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-[#FF4444]" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="h-4 w-4 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t("specialistsPage.specialistPhotoDesc", "Upload a profile picture for this specialist. Recommended size: 256x256px.")}</p>
                  </div>
                </div>
              </div>

              {services.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t("specialistsPage.assignedServices", "Assigned Services")}</label>
                  <div className="flex flex-wrap gap-2">
                    {services.map(sv => (
                      <button type="button" key={sv._id}
                        onClick={() => setForm(p => ({...p, selectedServices: toggle(p.selectedServices, sv._id)}))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.selectedServices.includes(sv._id) ? "bg-[#FF4444] text-white border-[#FF4444]" : "bg-[#FAFAFA] text-muted-foreground border-border/60"}`}>
                        {sv.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {branches.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t("specialistsPage.assignedBranches", "Assigned Branches")}</label>
                  <div className="flex flex-wrap gap-2">
                    {branches.map(b => (
                      <button type="button" key={b._id}
                        onClick={() => setForm(p => ({...p, selectedBranches: toggle(p.selectedBranches, b._id)}))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.selectedBranches.includes(b._id) ? "bg-[#FF4444] text-white border-[#FF4444]" : "bg-[#FAFAFA] text-muted-foreground border-border/60"}`}>
                        {b.address?.line1 ? `${b.address.line1}, ${b.address.city}` : b.address?.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border/60 text-sm font-semibold rounded-xl hover:bg-[#FAFAFA] transition-colors">{t("common.cancel", "Cancel")}</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#FF4444] hover:bg-[#BCAAA4] text-white text-sm font-bold rounded-xl shadow-sm disabled:opacity-50 transition-colors">
                  {saving ? t("common.saving", "Saving...") : editId ? t("common.update", "Update") : t("common.add", "Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
