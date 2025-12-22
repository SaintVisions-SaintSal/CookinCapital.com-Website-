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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
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
