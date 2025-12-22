import type React from "react"
import { AppSidebar } from "@/components/app/sidebar"
import { AppHeader } from "@/components/app/header"
import { SaintSalDock } from "@/components/app/saint-sal-dock"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-72 h-full overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>

      {/* SaintSal persistent dock */}
      <SaintSalDock />
    </div>
  )
}
