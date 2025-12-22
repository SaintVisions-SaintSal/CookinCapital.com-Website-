import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { VibePageTracker } from "@/components/vibe-page-tracker"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "CookinCapital | Real Estate Capital OS",
  description:
    "The single operating system where every real estate move is acquired, analyzed, funded, legally protected, managed, and exited. Powered by SaintSal AI.",
  generator: "CookinCapital",
  keywords: [
    "real estate",
    "capital",
    "deal analyzer",
    "lending",
    "investment",
    "SaintSal",
    "HACP",
    "fix and flip",
    "hard money",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CookinCap",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cookincap.io",
    siteName: "CookinCapital",
    title: "CookinCapital | Real Estate Capital OS",
    description:
      "The best operators in the game, joined by SaintSal™ AI. Institutional lending, deal analysis, and legal protection.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "CookinCapital - Real Estate Capital OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CookinCapital | Real Estate Capital OS",
    description: "The best operators in the game, joined by SaintSal™ AI.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f12" },
    { media: "(prefers-color-scheme: light)", color: "#d4a744" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CookinCap" />
        <meta name="application-name" content="CookinCap" />
        <meta name="msapplication-TileColor" content="#0f0f12" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <Script id="vibe-pixel" strategy="beforeInteractive">
          {`
            !function(v,i,b,e,c,o){if(!v[c]){var s=v[c]=function(){s.process?s.process.apply(s,arguments):s.queue.push(arguments)};s.queue=[],s.b=1*new Date;var t=i.createElement(b);t.async=!0,t.src=e;var n=i.getElementsByTagName(b)[0];n.parentNode.insertBefore(t,n)}}(window,document,"script","https://s.vibe.co/vbpx.js","vbpx");
            vbpx('init','8nmf0P');
            vbpx('event', 'page_view');
          `}
        </Script>
        <Script
          src="https://link.msgsndr.com/js/external-tracking.js"
          data-tracking-id="tk_9effa9702ab74e0dae821e8b9558b637"
          strategy="afterInteractive"
        />
        <Script src="https://js.stripe.com/v3/buy-button.js" strategy="afterInteractive" async />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans antialiased`}>
        <VibePageTracker />
        {children}
      </body>
    </html>
  )
}
