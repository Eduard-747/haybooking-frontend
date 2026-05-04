import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BranchesTip() {
  return (
    <div className="mt-8 bg-muted/50 border border-border rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Manage your schedule efficiently
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Need to set special holiday hours or temporary closures? Edit individual branch 
              settings to update your public profile instantly.
            </p>
          </div>
        </div>
        
        <Button variant="outline" className="shrink-0">
          View Tutorials
        </Button>
      </div>
    </div>
  )
}
