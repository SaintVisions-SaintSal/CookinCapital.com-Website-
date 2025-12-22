"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { User, TrendingUp, Landmark } from "lucide-react"

const roles = [
  { id: "borrower", label: "Borrower", icon: User, href: "/app?role=borrower" },
  { id: "investor", label: "Investor", icon: TrendingUp, href: "/app?role=investor" },
  { id: "klender", label: "KLender", icon: Landmark, href: "/app?role=klender" },
]

export function RoleSelector({ currentRole }: { currentRole: string }) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary w-fit">
      {roles.map((role) => (
        <Link
          key={role.id}
          href={role.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            currentRole === role.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <role.icon className="h-4 w-4" />
          {role.label}
        </Link>
      ))}
      <span className="ml-2 px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">Demo Mode</span>
    </div>
  )
}
