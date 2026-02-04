import { Suspense } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { HelpCenter } from "@/components/help/help-center"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help & Legal Center | CookinCapital",
  description: "Privacy Policy, Terms of Service, Code of Conduct, Non-Disclosure Agreement, and other legal documents for CookinCapital and Saint Vision Group LLC.",
  keywords: ["privacy policy", "terms of service", "legal", "NDA", "code of conduct", "CookinCapital", "Saint Vision Group"],
  openGraph: {
    title: "Help & Legal Center | CookinCapital",
    description: "Privacy Policy, Terms of Service, Code of Conduct, and legal documents for CookinCapital.",
    type: "website",
  },
}

function HelpCenterSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center mb-16">
        <div className="h-12 w-64 bg-muted/30 rounded-lg mx-auto animate-pulse" />
        <div className="h-6 w-96 bg-muted/30 rounded-lg mx-auto mt-6 animate-pulse" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[600px] bg-muted/30 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <Suspense fallback={<HelpCenterSkeleton />}>
          <HelpCenter />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
