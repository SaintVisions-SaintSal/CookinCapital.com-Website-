import { FileSearch, Brain, BadgeCheck, Rocket } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: FileSearch,
    title: "Submit Your Deal",
    description:
      "Enter property details through our streamlined intake. Your data syncs instantly across the platform.",
  },
  {
    step: "02",
    icon: Brain,
    title: "SaintSal™ Analyzes",
    description: "Our patented HACP™ technology runs comprehensive underwriting, legal checks, and market analysis.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    title: "Get Your Signal",
    description: "Receive a clear BUY/PASS/RENEGOTIATE decision with risk flags, reasons, and next best moves.",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Execute & Fund",
    description: "Match to the right capital path, generate lender-ready packets, and close with confidence.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From intake to exit in four steps
          </h2>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-full hidden h-px w-full bg-border lg:block" />
              )}

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Step number */}
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
