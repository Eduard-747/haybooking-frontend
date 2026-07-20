import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import api from "@/lib/api"
import { toast } from "sonner"

interface AiFloorPlanModalProps {
  isOpen: boolean
  onClose: () => void
  branchId: string
  partnerId: string
  onSuccess: (newFloor: any) => void
}

export function AiFloorPlanModal({ isOpen, onClose, branchId, partnerId, onSuccess }: AiFloorPlanModalProps) {
  const { t } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [floorName, setFloorName] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage) return

    setIsGenerating(true)
    try {
      const response = await api.post('/restaurant/ai-floor-plan/generate', {
        image: selectedImage,
        branchId,
        partnerId,
        floorName: floorName.trim() || 'AI Generated Plan'
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Floor plan generated successfully!')
        onSuccess(response.data.floor)
        handleClose()
      }
    } catch (error: any) {
      console.error('Error generating floor plan:', error)
      toast.error(error.response?.data?.message || 'Failed to generate floor plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      setSelectedImage(null)
      setFloorName("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Floor Plan Generator
          </DialogTitle>
          <DialogDescription>
            Upload a photo or architectural drawing of your floor plan, and AI will automatically generate the interactive layout.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="floor-name">Floor Name</Label>
            <Input
              id="floor-name"
              placeholder="e.g. Ground Floor, Main Dining..."
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label>Floor Plan Image</Label>
            {!selectedImage ? (
              <div
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" 
                    : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-slate-400">
                  <Upload className="w-10 h-10 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-64 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group">
                <img
                  src={selectedImage}
                  alt="Floor Plan Preview"
                  className="w-full h-full object-contain"
                />
                {!isGenerating && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleRemoveImage}
                      className="gap-2 shadow-lg"
                    >
                      <X className="w-4 h-4" /> Remove Image
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center border-t pt-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Powered by Google Gemini Vision AI
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!selectedImage || isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Layout
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
