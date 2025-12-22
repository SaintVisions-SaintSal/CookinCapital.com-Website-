"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(standalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    const hasSeenPrompt = localStorage.getItem("pwa-prompt-seen")
    if (!hasSeenPrompt && !standalone) {
      // Show after a brief delay for page to load
      setTimeout(() => setShowPrompt(true), 1500)
    }

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowPrompt(false)
        localStorage.setItem("pwa-prompt-seen", "true")
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-seen", "true")
  }

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-primary/20 rounded-2xl p-5 shadow-2xl shadow-primary/10">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="pr-6">
            <h3 className="font-semibold text-lg text-foreground">Install App</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Add CookinCap to your home screen for instant access</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-3 mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Analyze deals on the go</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Apply for capital in seconds</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Get SaintSal insights anywhere</span>
          </div>
        </div>

        {isIOS ? (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4">
            <p className="flex items-center gap-3 font-medium text-foreground mb-2">
              <svg
                className="w-5 h-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              To install on iPhone/iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-1 text-muted-foreground">
              <li>
                Tap the{" "}
                <span className="inline-flex items-center mx-1">
                  <svg
                    className="w-4 h-4 inline"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span>{" "}
                Share button at the bottom
              </li>
              <li>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </li>
              <li>
                Tap <strong>"Add"</strong> in the top right
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <Button
            onClick={handleInstall}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base"
          >
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4">
            <p className="flex items-center gap-3 font-medium text-foreground mb-2">
              <Download className="w-5 h-5 text-primary" />
              To save to home screen:
            </p>
            <p className="text-muted-foreground">
              Use your browser menu and select "Add to Home Screen" or "Install App"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
