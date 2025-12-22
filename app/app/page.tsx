"use client"

import { useSearchParams } from "next/navigation"
import { DashboardBorrower } from "@/components/app/dashboard-borrower"
import { DashboardInvestor } from "@/components/app/dashboard-investor"
import { DashboardKLender } from "@/components/app/dashboard-klender"
import { RoleSelector } from "@/components/app/role-selector"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") || "borrower") as "borrower" | "investor" | "klender"

  return (
    <div className="space-y-8">
      {/* Role selector for demo purposes */}
      <RoleSelector currentRole={role} />

      {/* Role-aware dashboard */}
      {role === "borrower" && <DashboardBorrower />}
      {role === "investor" && <DashboardInvestor />}
      {role === "klender" && <DashboardKLender />}
    </div>
  )
}
