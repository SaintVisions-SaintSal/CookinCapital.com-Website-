import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { HelpCenter } from "@/components/help/help-center"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help & Legal | CookinCapital",
  description: "Privacy Policy, Terms of Service, Code of Conduct, and other legal documents for CookinCapital and Saint Vision Group.",
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <HelpCenter />
      </main>
      <Footer />
    </div>
  )
}
