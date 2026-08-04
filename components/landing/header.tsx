"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, FileText, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * Kinetic Luxury header — a machined bar, not a floating card.
 * Square corners, one hairline rule at the base, gold reserved for
 * the single primary action.
 */

const navItems = [
  { label: "Market Data", href: "/properties/search" },
  { label: "Deal Analyzer", href: "/app/analyzer" },
  { label: "Commercial Lending", href: "/capital" },
  { label: "Invest", href: "/invest" },
  { label: "Research", href: "/research" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "border-outline-variant/70 bg-obsidian/92 backdrop-blur-xl"
            : "border-outline-variant/35 bg-obsidian/60 backdrop-blur-md"
        }`}
        data-testid="header-site"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <nav className="flex h-[72px] items-center justify-between">
            <Link href="/" className="flex min-w-fit shrink-0 items-center gap-3" data-testid="link-home">
              <div className="relative h-10 w-10 shrink-0 border border-outline-variant/60 bg-surface-lowest">
                <Image src="/saintsal-logo.png" alt="SaintSal" fill className="object-contain p-1" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="whitespace-nowrap font-display text-[19px] font-semibold tracking-tight">
                  <span className="text-gold">Cookin</span>
                  <span className="text-on-surface">Capital</span>
                </span>
                <span className="kl-label mt-1 whitespace-nowrap">by SaintSal™</span>
              </div>
            </Link>

            <div className="ml-12 hidden items-center gap-7 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative whitespace-nowrap py-2 text-[13px] font-medium text-outline transition-colors hover:text-on-surface"
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <Link href="/auth/login">
                <Button variant="ghost" className="h-10 rounded-none px-4 text-[13px] font-medium text-outline hover:text-on-surface" data-testid="button-signin">
                  Sign In
                </Button>
              </Link>
              {mounted ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="kl-lit h-10 rounded-none border-outline-variant bg-transparent px-4 text-[13px] font-medium text-on-surface-variant"
                      data-testid="button-apply-menu"
                    >
                      Apply
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-none border-outline-variant bg-surface-mid p-0">
                    <DropdownMenuItem asChild className="rounded-none border-b border-outline-variant/50 px-4 py-3">
                      <Link href="/prequal" className="flex cursor-pointer items-center gap-3">
                        <ClipboardCheck className="h-4 w-4 text-gold" />
                        <div>
                          <p className="text-[13px] font-medium text-on-surface">Pre-Qualification</p>
                          <p className="text-[11px] text-outline">Two minutes, no credit pull</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-none px-4 py-3">
                      <Link href="/apply" className="flex cursor-pointer items-center gap-3">
                        <FileText className="h-4 w-4 text-gold" />
                        <div>
                          <p className="text-[13px] font-medium text-on-surface">Extended Application</p>
                          <p className="text-[11px] text-outline">Full funding package</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  className="h-10 rounded-none border-outline-variant bg-transparent px-4 text-[13px] font-medium text-on-surface-variant"
                >
                  Apply
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
              <Link href="/app/analyzer">
                <Button
                  className="h-10 rounded-none bg-gold px-5 text-[13px] font-semibold text-[#291f00] hover:bg-gold-light"
                  data-testid="button-analyze-deal"
                >
                  Analyze a Deal
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-on-surface" /> : <Menu className="h-6 w-6 text-on-surface" />}
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="border-t border-outline-variant/60 py-6 lg:hidden" data-testid="nav-mobile">
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="border-b border-outline-variant/30 py-3.5 text-[15px] font-medium text-on-surface-variant"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-2.5">
                  <Link href="/app/analyzer" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="h-12 w-full rounded-none bg-gold font-semibold text-[#291f00]">Analyze a Deal</Button>
                  </Link>
                  <Link href="/prequal" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="h-12 w-full justify-center rounded-none border-outline-variant bg-transparent">
                      <ClipboardCheck className="mr-2 h-4 w-4 text-gold" />
                      Pre-Qualification
                    </Button>
                  </Link>
                  <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="h-12 w-full justify-center rounded-none border-outline-variant bg-transparent text-outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Extended Application
                    </Button>
                  </Link>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="h-12 w-full justify-center rounded-none text-outline">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="h-[72px] shrink-0" aria-hidden="true" />
    </>
  )
}
