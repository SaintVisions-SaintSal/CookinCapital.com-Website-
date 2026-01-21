import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Deal Analyzer", href: "/app/analyzer" },
    { label: "Capital & Lending", href: "/capital" },
    { label: "Invest", href: "/invest" },
    { label: "Legal Services", href: "/app/legal" },
    { label: "Investor Portal", href: "/app/opportunities" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Apply Now", href: "/apply" },
    { label: "SaintVisionGroup", href: "https://saintvisiongroup.com", external: true },
  ],
  resources: [
    { label: "SaintSal.ai", href: "https://saintsal.ai", external: true },
    { label: "Cookin.io", href: "https://cookin.io", external: true },
    { label: "CookinKnowledge", href: "https://cookinknowledge.com", external: true },
    { label: "Support", href: "https://saintvisiongroup.com/client-hub", external: true },
  ],
  legal: [
    { label: "Privacy", href: "https://cookinknowledge.com/privacy", external: true },
    { label: "Terms", href: "https://cookinknowledge.com/terms", external: true },
    { label: "Disclaimer", href: "https://cookinknowledge.com/disclaimer", external: true },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="CookinCapital" width={44} height={44} className="rounded-lg" />
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-primary">Cookin'</span>
                <span className="text-white">Capital</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              The Real Estate Capital OS. Acquire, analyze, fund, manage, and exit—all powered by SaintSal™ + HACP™.
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>438 Main St, Huntington Beach, CA 92648</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+19499972097" className="hover:text-foreground transition-colors">
                  1-949-997-2097
                </a>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">Part of the Saint Vision Group ecosystem.</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CookinCapital. All rights reserved. SaintSal™ and HACP™ are trademarks.
          </p>
          <p className="text-xs text-muted-foreground">cookincap.io</p>
        </div>
      </div>
    </footer>
  )
}
