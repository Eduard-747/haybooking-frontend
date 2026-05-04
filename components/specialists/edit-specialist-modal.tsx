"use client"

import { useState } from "react"
import { X, Camera, Plus, ChevronDown } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditSpecialistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialist?: {
    id: string
    name: string
    branches: string[]
    services: string[]
    specialization?: string
  }
}

const availableBranches = [
  "Downtown Branch",
  "North Plaza",
  "West End",
  "Eastside",
  "Harbor",
  "North Side",
]

const availableServices = [
  "Consultation",
  "Standard Checkup",
  "Emergency Care",
  "Therapy",
  "Sports Massage",
  "Acupuncture",
  "Yoga",
  "Meditation",
  "Facial",
  "Manicure",
]

export function EditSpecialistModal({ open, onOpenChange, specialist }: EditSpecialistModalProps) {
  const [formData, setFormData] = useState({
    name: specialist?.name || "",
    specialization: specialist?.specialization || "",
    selectedBranches: specialist?.branches || ["Downtown Branch", "North Plaza"],
    selectedServices: specialist?.services || ["Consultation", "Standard Checkup", "Emergency Care"],
  })

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false)
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleBranch = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBranches: prev.selectedBranches.includes(branch)
        ? prev.selectedBranches.filter(b => b !== branch)
        : [...prev.selectedBranches, branch]
    }))
  }

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }))
  }

  const removeBranch = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBranches: prev.selectedBranches.filter(b => b !== branch)
    }))
  }

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(s => s !== service)
    }))
  }

  const handleSave = () => {
    console.log("Saving specialist:", formData)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[480px] p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-foreground">
                Add New Specialist
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Enter details to create a new profile
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2 -mt-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground font-medium">UPLOAD PHOTO</span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Recommended: Square JPG or PNG, at least 400x400px.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Dr. Jane Cooper"
              />
            </div>

            {/* Assign to Branches - Multi-select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Assign to Branches <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-background text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {formData.selectedBranches.length > 0 ? (
                      formData.selectedBranches.map((branch) => (
                        <span
                          key={branch}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-sm"
                        >
                          {branch}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeBranch(branch)
                            }}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Add branch...</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {branchDropdownOpen && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                    {availableBranches.map((branch) => (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => toggleBranch(branch)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between ${
                          formData.selectedBranches.includes(branch) ? 'bg-primary/5 text-primary' : 'text-foreground'
                        }`}
                      >
                        {branch}
                        {formData.selectedBranches.includes(branch) && (
                          <span className="text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assign to Services - Multi-select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Assign to Services
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-background text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {formData.selectedServices.length > 0 ? (
                      formData.selectedServices.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-sm"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeService(service)
                            }}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Add services...</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {serviceDropdownOpen && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                    {availableServices.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between ${
                          formData.selectedServices.includes(service) ? 'bg-primary/5 text-primary' : 'text-foreground'
                        }`}
                      >
                        {service}
                        {formData.selectedServices.includes(service) && (
                          <span className="text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium text-foreground">
                Specialization (Optional)
              </Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange("specialization", e.target.value)}
                className="h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Senior Orthodontist"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer - Pinned to Bottom */}
        <div className="border-t border-border px-6 py-4 bg-background mt-auto">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Specialist
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
