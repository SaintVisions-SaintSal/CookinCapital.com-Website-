import { Calculator, Sparkles } from "lucide-react"

export function AnalyzerHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Calculator className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Deal Analyzer</h1>
          <p className="text-sm text-muted-foreground">Comprehensive underwriting with SaintSal signals</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-primary">
        <Sparkles className="h-4 w-4" />
        <span>SaintSal Verified Analysis</span>
      </div>
    </div>
  )
}
