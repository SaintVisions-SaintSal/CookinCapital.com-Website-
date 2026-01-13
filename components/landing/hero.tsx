import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Brain, Database, Lock, Globe, Zap, Cpu } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-background/80 backdrop-blur-sm px-5 py-2.5">
              <div className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium tracking-wide text-primary">Autonomous Capital Intelligence</span>
            </div>

            <div className="mb-8 flex justify-center">
              <Image
                src="/logo.png"
                alt="CookinCapital"
                width={200}
                height={200}
                className="rounded-2xl shadow-2xl shadow-primary/20"
                priority
              />
            </div>

            <p className="text-xl lg:text-2xl font-light text-muted-foreground tracking-wide">
              Institutional Capital Infrastructure
            </p>

            <p className="mt-8 text-lg leading-relaxed text-muted-foreground lg:text-xl max-w-3xl mx-auto text-pretty">
              The first autonomous capital platform where institutional lending, legal strategy, and AI-driven decision
              intelligence converge. Every deal analyzed, graded, and executed with precision—powered by{" "}
              <span className="text-primary font-medium">SaintSal™</span>, our proprietary decision engine.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:bg-card">
              <Brain className="h-6 w-6 text-primary mb-3" />
              <p className="font-medium text-foreground text-sm">HACP™ Engine</p>
              <p className="mt-1 text-xs text-muted-foreground">Human-AI Collaborative Processing</p>
            </div>
            <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:bg-card">
              <Database className="h-6 w-6 text-primary mb-3" />
              <p className="font-medium text-foreground text-sm">35+ Data Endpoints</p>
              <p className="mt-1 text-xs text-muted-foreground">PropertyRadar, MLS, County Records</p>
            </div>
            <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:bg-card">
              <Lock className="h-6 w-6 text-primary mb-3" />
              <p className="font-medium text-foreground text-sm">Covenant-Governed</p>
              <p className="mt-1 text-xs text-muted-foreground">Explainable & Auditable AI</p>
            </div>
            <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:bg-card">
              <Globe className="h-6 w-6 text-primary mb-3" />
              <p className="font-medium text-foreground text-sm">50+ Lender Network</p>
              <p className="mt-1 text-xs text-muted-foreground">$2B+ Capital Deployed</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/research">
              <Button
                size="lg"
                className="h-14 px-10 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                Enter Command Center
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/prequal">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base border-border hover:bg-card bg-transparent font-medium"
              >
                Apply for Capital
              </Button>
            </Link>
          </div>

          <div className="mt-16 pt-12 border-t border-border/50">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Cpu className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">SaintSal™ Decision Engine</p>
                  <p className="text-sm text-muted-foreground">Your autonomous co-pilot for capital decisions</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>BUY / PASS / RENEGOTIATE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Grade A-F Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Full Audit Trail</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl lg:text-4xl font-semibold text-foreground">$2B+</p>
              <p className="mt-1 text-sm text-muted-foreground">Capital Deployed</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-semibold text-foreground">$3B+</p>
              <p className="mt-1 text-sm text-muted-foreground">Distressed Assets Resolved</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-semibold text-foreground">24/7</p>
              <p className="mt-1 text-sm text-muted-foreground">Autonomous Operations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
