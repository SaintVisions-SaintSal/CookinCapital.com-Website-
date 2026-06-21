import { ApplyPageClient } from "@/components/landing/apply-page-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply for Capital | CookinCapital",
  description: "Complete your residential loan application with e-signature capabilities.",
}

export default function ApplyPage() {
  return <ApplyPageClient />
}
