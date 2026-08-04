import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { CapitalShowcase } from "@/components/landing/capital-showcase"
import { Pillars } from "@/components/landing/pillars"
import { HowItWorks } from "@/components/landing/how-it-works"
import { SaintSalSection } from "@/components/landing/saint-sal-section"
import { TechStack } from "@/components/landing/tech-stack"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { corpusStats } from "@/lib/intelligence/store"

/**
 * Homepage. Server component so the hero can quote real corpus counts —
 * every figure it shows is RentCast-sourced or derived, and therefore safe
 * on a public surface.
 */
export default function HomePage() {
  const corpus = corpusStats()

  return (
    <main className="min-h-screen bg-obsidian">
      <Header />
      <Hero corpus={corpus} />
      <CapitalShowcase />
      <Pillars />
      <HowItWorks />
      <SaintSalSection />
      <TechStack />
      <CTASection />
      <Footer />
      <PWAInstallPrompt />
    </main>
  )
}
