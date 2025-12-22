"use client"

import { useState, useEffect } from "react"
import { createClient, isSupabaseAvailable } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Menu, Plus, X, Settings, Calculator, FileText, DollarSign, LogOut, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/app" },
  { name: "Analyzer", href: "/app/analyzer" },
  { name: "My Deals", href: "/app/library" },
  { name: "Legal Help", href: "/app/legal" },
  { name: "Settings", href: "/app/settings" },
]

const sampleNotifications = [
  {
    id: 1,
    type: "deal",
    title: "Deal Analysis Complete",
    message: "Your analysis for 1234 Main St is ready to review",
    time: "5 min ago",
    read: false,
    icon: Calculator,
  },
  {
    id: 2,
    type: "application",
    title: "Application Update",
    message: "Your funding application is under review",
    time: "1 hour ago",
    read: false,
    icon: FileText,
  },
  {
    id: 3,
    type: "funding",
    title: "Funding Approved",
    message: "Congratulations! Your $250K loan is approved",
    time: "Yesterday",
    read: true,
    icon: DollarSign,
  },
]

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
    }
    fetchUser()
  }, [])

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

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"
  const userName = user?.user_metadata?.full_name || "User"
  const userEmail = user?.email || ""

  return (
    <>
      <header className="flex-shrink-0 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:h-20 lg:px-8">
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-foreground" />
        </button>

        <div className="relative hidden flex-1 max-w-md lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search deals, properties, documents..."
            className="h-10 pl-10 bg-secondary border-0"
          />
        </div>

        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Image src="/logo.png" alt="CookinCap" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-semibold text-foreground">CookinCap</span>
        </Link>

        <div className="flex-1 lg:hidden" />

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-card shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/50",
                          !notification.read && "bg-primary/5",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            notification.type === "deal" && "bg-blue-500/10 text-blue-500",
                            notification.type === "application" && "bg-yellow-500/10 text-yellow-500",
                            notification.type === "funding" && "bg-green-500/10 text-green-500",
                          )}
                        >
                          <notification.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                            {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground/70">{notification.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border p-3">
                    <Link
                      href="/app/settings"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      Notification Settings
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link href="/app/analyzer">
            <Button size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {userInitial}
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card shadow-2xl">
                  <div className="p-4 border-b border-border">
                    <p className="font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/app/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border">
            <div className="flex h-14 items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/logo.png" alt="CookinCap" width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-semibold text-sidebar-foreground">CookinCap</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6 text-sidebar-foreground" />
              </button>
            </div>
            <nav className="px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
