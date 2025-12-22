import Link from "next/link"
import { Sparkles, CheckCircle2, AlertTriangle, TrendingUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  "Plain-language summary of every deal",
  "Clear BUY / PASS / RENEGOTIATE signal",
  "Top 5 reasons for the decision",
  "Legal & financial risk flags",
  "Next best moves (max 3 actions)",
  "Full audit trail of sources used",
]

export function SaintSalSection() {
  return (
    <section id="about" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Patented HACP™ Technology</span>
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Meet SaintSal™</h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              The specialist decision governor for money + law. SaintSal™ is built specifically for real estate finance
              and legal decisions—covenant-governed, explainable, and auditable. Powered by our patented HACP™ (Human-AI
              Collaborative Processing) technology.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/app/analyzer">
              <Button size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
                Run it through SaintSal™
              </Button>
            </Link>
          </div>

          {/* Right: Visual Demo Card */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">SaintSal™ Analysis</p>
                    <p className="text-xs text-muted-foreground">Deal #4521 • 123 Main St</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">BUY</span>
              </div>

              {/* Summary */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Strong flip opportunity with 24% projected ROI. Clear title, no liens, property below ARV by 18%.
                  Recommend proceeding with standard due diligence.
                </p>
              </div>

              {/* Metrics */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Est. Profit</p>
                  <p className="text-lg font-semibold text-foreground">$67,500</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className="text-lg font-semibold text-foreground">24.3%</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold text-foreground">High</p>
                </div>
              </div>

              {/* Risk Flags */}
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Risk Flags</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-500">
                    <AlertTriangle className="h-3 w-3" />
                    Foundation inspection needed
                  </span>
                </div>
              </div>

              {/* Next Moves */}
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Next Best Moves
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Submit offer at $185,000
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Order foundation inspection
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">SaintSal™ Verified • Full audit trail available</span>
                <Link href="/app/library">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Export Memo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
