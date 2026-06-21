import { Suspense } from "react"
import { DealAnalyzer } from "@/components/app/deal-analyzer/deal-analyzer"

function AnalyzerFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function AnalyzerPage() {
  return (
    <Suspense fallback={<AnalyzerFallback />}>
      <DealAnalyzer />
    </Suspense>
  )
}
