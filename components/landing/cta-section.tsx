import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Closing plate. One gold action, two quiet ones. Gotham strip at 12%,
 * masked so it never sits behind the headline.
 */

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant/40 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="gotham-plate gotham-strip gotham-fade-up opacity-[0.12]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="kl-panel-raised px-8 py-14 lg:px-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="kl-label">Command Center</span>
            <h2 className="mt-4 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-on-surface">
              Ready to run your next deal through SaintSal™?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-on-surface-variant/80">
              Underwriting, capital and compliance in one pass — with the reasoning on the page instead of inside a
              black box.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link href="/app/analyzer" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-13 w-full rounded-none bg-gold px-8 text-[14px] font-semibold text-[#291f00] hover:bg-gold-light sm:w-auto"
                  data-testid="button-cta-analyze"
                >
                  Analyze a Deal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/capital" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="kl-lit h-13 w-full rounded-none border-outline-variant bg-transparent px-8 text-[14px] font-medium text-on-surface-variant sm:w-auto"
                  data-testid="button-cta-lender"
                >
                  Become a KLender
                </Button>
              </Link>
              <Link href="/invest" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="kl-lit h-13 w-full rounded-none border-outline-variant bg-transparent px-8 text-[14px] font-medium text-on-surface-variant sm:w-auto"
                  data-testid="button-cta-invest"
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
