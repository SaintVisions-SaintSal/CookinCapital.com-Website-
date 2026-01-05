import { ResearchHub } from "@/components/research/research-hub"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Research Intelligence Hub | CookinCapital",
  description:
    "Search for anything. SaintSal guides you, navigates you across our platform, and executes your vision. Real-time data. AI intelligence. Actionable solutions.",
}

export default function ResearchPage() {
  return <ResearchHub />
}
