"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, FileText, ClipboardCheck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Deal Analyzer", href: "/app/analyzer" },
  { label: "Commercial Lending", href: "/capital" },
  { label: "Invest", href: "/invest" },
  { label: "Legal Services", href: "/app/legal" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="CookinCap" width={44} height={44} className="rounded-lg" />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Cookin<span className="text-primary">Cap</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-sm font-medium border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
                >
                  Apply Now
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                <DropdownMenuItem asChild>
                  <Link href="/prequal" className="flex items-center gap-2 cursor-pointer">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Pre-Qualification</p>
                      <p className="text-xs text-muted-foreground">Quick 2-min application</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/apply" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Extended Application</p>
                      <p className="text-xs text-muted-foreground">Full funding application</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/app/analyzer">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Analyze a Deal</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 py-6 lg:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/prequal" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-primary/50 text-primary bg-transparent"
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Pre-Qualification
                  </Button>
                </Link>
                <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-border text-muted-foreground bg-transparent"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Extended Application
                  </Button>
                </Link>
                <Link href="/app/analyzer" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground">Analyze a Deal</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
