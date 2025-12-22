"use client"

import { useState, useEffect } from "react"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calculator, Scale, FolderOpen, Sparkles, Settings, LogOut } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Deal Analyzer", href: "/app/analyzer", icon: Calculator },
  { name: "My Deals", href: "/app/library", icon: FolderOpen },
  { name: "Legal Help", href: "/app/legal", icon: Scale },
  { name: "Settings", href: "/app/settings", icon: Settings },
]

export function AppSidebar() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isSupabaseAvailable()) {
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()
          setUser(user)
        }
      } catch (e) {
        console.warn("[v0] Could not fetch user")
      }
    }
    fetchUser()
  }, [])

  const handleSaintSalClick = () => {
    if (typeof window !== "undefined" && (window as any).openSaintSalDock) {
      ;(window as any).openSaintSalDock()
    }
  }

  const handleLogout = async () => {
    try {
      if (isSupabaseAvailable()) {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch (e) {
      console.warn("[v0] Could not sign out")
    }
    router.push("/")
    router.refresh()
  }

  const userName = user?.user_metadata?.full_name || "User"
  const userEmail = user?.email || ""

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Link
          href="/"
          className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6 hover:bg-sidebar-accent/30 transition-colors"
        >
          <Image src="/logo.png" alt="CookinCap" width={44} height={44} className="rounded-lg" />
          <div>
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              Cookin<span className="text-primary">Cap</span>
            </span>
            <p className="text-xs text-sidebar-foreground/60">Command Center</p>
          </div>
        </Link>

        {/* Main navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* SaintSal quick action */}
        <div className="px-4 pb-4">
          <button
            onClick={handleSaintSalClick}
            className="flex w-full items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Sparkles className="h-5 w-5" />
            Ask SaintSal™
          </button>
        </div>

        {/* User info and Logout */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
