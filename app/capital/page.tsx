import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { CapitalPage } from "@/components/landing/capital-page"

export const metadata = {
  title: "Commercial Lending | CookinCap",
  description:
    "Access $5K - $5M+ in business funding. Real estate financing, equipment loans, working capital, SBA loans, and more. 50+ lending partners. Funded in as fast as 1 day.",
}

export default function Capital() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CapitalPage />
      <Footer />
    </main>
  )
}
