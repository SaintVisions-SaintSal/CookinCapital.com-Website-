import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 lg:p-16">
          {/* Background accent */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ready to run your next deal through SaintSal™?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of real estate professionals who trust CookinCapital for their most important decisions.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/app/analyzer">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Analyze a Deal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/app/opportunities">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base border-border hover:bg-secondary bg-transparent"
                >
                  Become a KLender
                </Button>
              </Link>
              <Link href="/app/opportunities">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base border-border hover:bg-secondary bg-transparent"
                >
                  Invest with Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
