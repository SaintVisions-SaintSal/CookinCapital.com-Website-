import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Shield, TrendingUp, Scale } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by SaintSal™ + HACP™</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            <span className="text-gold-gradient">CookinCapital</span> — The best operators in the game, joined by{" "}
            <span className="text-gold-gradient">SaintSal™ AI</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl max-w-3xl mx-auto text-pretty">
            CookinCapital unites institutional commercial lending, real estate investment, and legal expertise with
            SaintSal™ decision technology to set a new standard for every deal end-to-end.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/app/analyzer">
              <Button size="lg" className="h-14 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                Analyze a Deal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/prequal">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base border-border hover:bg-secondary bg-transparent"
              >
                Apply for Capital
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-semibold text-foreground">$2B+</p>
                <p className="text-sm text-muted-foreground">Funds Delivered</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-semibold text-foreground">$3B+</p>
                <p className="text-sm text-muted-foreground">Distressed Assets Resolved</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-semibold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Lending Partners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
