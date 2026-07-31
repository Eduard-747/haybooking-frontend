import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload, X, Loader2, Sparkles, Image as ImageIcon, 
  CheckCircle2, DollarSign, Zap, CreditCard, Lock, ShieldCheck, ArrowLeft, Check 
} from "lucide-react"
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
  
  // Steps: 'upload' | 'payment' | 'processing'
  const [step, setStep] = useState<'upload' | 'payment' | 'processing'>('upload')
  const [isGenerating, setIsGenerating] = useState(false)
  const [floorName, setFloorName] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Payment Form State
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [paymentStatusText, setPaymentStatusText] = useState("")

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

  const handleAutoFillTestCard = () => {
    setCardNumber("4242 •••• •••• 4242")
    setExpiry("12/28")
    setCvc("888")
    setCardName("Test Restaurant Owner")
  }

  const handleProceedToPayment = () => {
    if (!selectedImage) {
      toast.error("Please upload a floor plan image first")
      return
    }
    // Pre-fill test card info for easy testing
    if (!cardNumber) handleAutoFillTestCard()
    setStep('payment')
  }

  const handleExecutePaymentAndGenerate = async () => {
    if (!selectedImage) return

    setStep('processing')
    setIsGenerating(true)
    setPaymentStatusText("Authorizing Payment ($0.99)...")

    try {
      // Simulate payment processing delay (1.2 seconds)
      await new Promise((res) => setTimeout(res, 1200))
      
      setPaymentStatusText("Payment Approved ✓ Billed $0.99. Analyzing Floor Plan...")
      await new Promise((res) => setTimeout(res, 800))

      setPaymentStatusText("AI Vision processing layout & tables...")

      // Call Backend API
      const response = await api.post('/restaurant/ai-floor-plan/generate', {
        image: selectedImage,
        branchId,
        partnerId,
        floorName: floorName.trim() || 'AI Generated Plan'
      })

      if (response.data.success) {
        toast.success(
          response.data.isMock
            ? 'Payment ($0.99) successful! Floor plan layout generated.'
            : 'Payment ($0.99) successful! AI Vision generated live floor plan.'
        )
        onSuccess(response.data.floor)
        handleClose()
      }
    } catch (error: any) {
      console.error('Error generating floor plan:', error)
      toast.error(error.response?.data?.message || 'Payment or generation failed')
      setStep('payment')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      setSelectedImage(null)
      setFloorName("")
      setStep('upload')
      setCardNumber("")
      setExpiry("")
      setCvc("")
      setCardName("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {step === 'upload' && "AI Floor Plan Generator"}
              {step === 'payment' && "Complete $0.99 Payment"}
              {step === 'processing' && "Processing AI Request..."}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            {step === 'upload' && "Upload a photo or drawing of your layout. AI Vision will convert it into interactive 2D tables."}
            {step === 'payment' && "Secure single request checkout. Pay $0.99 to generate your AI interactive floor plan."}
            {step === 'processing' && "Please wait while we verify payment and construct your digital layout."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: UPLOAD & BANNER */}
        {step === 'upload' && (
          <>
            {/* Feature & Pricing Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl p-4 space-y-3 my-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-sm shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      What can this action do?
                      <span className="text-[10px] uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        AI Vision
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Processes floor images & hand sketches to construct tables, walls, and seating.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    <DollarSign className="w-3.5 h-3.5" />
                    $0.99 / request
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Sketch Recognition</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Reads photos, blueprints & architectural drawings</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Smart Mapping</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Auto-detects tables, seats, walls & room labels</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Instant Canvas</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Generates ready-to-edit interactive floor plan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="floor-name" className="text-xs font-semibold">Floor Name</Label>
                <Input
                  id="floor-name"
                  placeholder="e.g. Ground Floor, Main Dining..."
                  value={floorName}
                  onChange={(e) => setFloorName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Floor Plan Image</Label>
                {!selectedImage ? (
                  <div
                    className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
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
                    <div className="flex flex-col items-center justify-center pt-4 pb-5 text-slate-500 dark:text-slate-400">
                      <Upload className="w-9 h-9 mb-2 text-slate-400" />
                      <p className="mb-1 text-xs">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[11px] text-slate-500">PNG, JPG, JPEG (Max 5MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group">
                    <img
                      src={selectedImage}
                      alt="Floor Plan Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleRemoveImage}
                        className="gap-2 shadow-lg text-xs"
                      >
                        <X className="w-4 h-4" /> Remove Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="sm:justify-between items-center border-t pt-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Powered by Gemini Vision • <span className="font-semibold text-slate-700 dark:text-slate-300">$0.99 / request</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="text-xs">
                  Cancel
                </Button>
                <Button 
                  onClick={handleProceedToPayment} 
                  disabled={!selectedImage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[170px] text-xs font-semibold"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continue to Pay ($0.99)
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* STEP 2: PAYMENT FORM */}
        {step === 'payment' && (
          <div className="space-y-4 py-2">
            {/* Order Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Floor Plan Generation</h4>
                  <p className="text-xs text-slate-500">1x Vision Layout Analysis Request</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">$0.99</p>
                <p className="text-[10px] text-slate-400">One-time charge</p>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="space-y-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Credit or Debit Card
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAutoFillTestCard}
                  className="text-[11px] h-7 text-indigo-600 hover:text-indigo-700"
                >
                  ⚡ Auto-fill Test Card
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Cardholder Name</Label>
                <Input 
                  placeholder="e.g. John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Card Number</Label>
                <div className="relative">
                  <Input 
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="text-xs h-9 pr-10 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Expiration Date</Label>
                  <Input 
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CVC / CWW</Label>
                  <Input 
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit SSL Encrypted & Secure Checkout</span>
            </div>

            <DialogFooter className="sm:justify-between items-center border-t pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('upload')} 
                className="text-xs gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
              <Button 
                onClick={handleExecutePaymentAndGenerate} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Pay $0.99 & Generate Plan
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 3: PROCESSING & GENERATING */}
        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center border-2 border-indigo-500/30">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1 max-w-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {paymentStatusText}
              </h4>
              <p className="text-xs text-slate-500">
                Please do not close this window. Your payment of $0.99 is authorized and AI is building your floor layout.
              </p>
            </div>

            <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-full animate-pulse w-3/4 rounded-full"></div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
