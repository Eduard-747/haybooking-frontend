"use client"

import { useState } from "react"
import { X, MapPin, Phone, Clock, Info } from "lucide-react"
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

interface EditBranchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch?: {
    id: string
    name: string
    address: string
    city: string
    zipCode: string
    phone: string
  }
}

export function EditBranchModal({ open, onOpenChange, branch }: EditBranchModalProps) {
  const [formData, setFormData] = useState({
    address: branch?.address || "124 Baker St, Marylebone",
    city: branch?.city || "London",
    zipCode: branch?.zipCode || "NW1 6XE",
    phone: branch?.phone || "+44 20 7946 0001",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving branch:", formData)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[480px] p-0 flex flex-col gap-0 backdrop-blur-sm"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-foreground">
                Edit Branch
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Branch ID: HB-204-LON
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
          <div className="px-6 py-6 space-y-8">
            {/* Location Details Section */}
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-foreground">
                Location Details
              </h3>

              {/* Address Line 1 */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-foreground">
                  Address Line 1
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="pl-10 h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              {/* City and Zip Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-foreground">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-foreground">
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    className="h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Zip Code"
                  />
                </div>
              </div>

              {/* Map Pin Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary uppercase tracking-wide">
                  Map Pin Location
                </Label>
                <div className="relative rounded-lg overflow-hidden border border-border h-[140px]">
                  {/* Stylized Map Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-rose-50 to-sky-100">
                    {/* Map shapes */}
                    <div className="absolute top-4 left-4 w-24 h-16 bg-amber-200/60 rounded-full blur-sm" />
                    <div className="absolute bottom-6 right-8 w-32 h-20 bg-sky-200/60 rounded-full blur-sm" />
                    <div className="absolute top-8 right-12 w-20 h-24 bg-rose-200/50 rounded-full blur-sm" />
                    {/* Roads */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-300/40 -rotate-12" />
                    <div className="absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-amber-300/30 rotate-6" />
                  </div>
                  
                  {/* Pin Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-xs h-8 text-primary border-primary/30 hover:bg-primary/5"
                  >
                    DROP PIN TO SET COORDINATES
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-foreground">
                Contact Information
              </h3>

              {/* Branch Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Branch Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 h-11 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="+44 20 7946 0001"
                  />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  This number will be shown to customers for booking inquiries.
                </p>
              </div>
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
              Save Branch Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
