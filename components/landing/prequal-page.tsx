"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SMS_CONSENT_TEXT } from "@/lib/intake/contracts"

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

export function PreQualPage() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [reference, setReference] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const [smsConsent, setSmsConsent] = useState(false)
  const [phone, setPhone] = useState("")
  const requestId = useRef<string | null>(null)
  const captcha = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const turnstile = () => (window as typeof window & { turnstile?: Turnstile }).turnstile

  function renderCaptcha() {
    if (widget.current || !captcha.current || !siteKey || !turnstile()) return
    widget.current = turnstile()!.render(captcha.current, {
      sitekey: siteKey, action: "cc-intake", theme: "dark",
      callback: (token: string) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => { setCaptchaToken(""); setError("The security check couldn't load. Please refresh and try again.") },
    })
  }

  useEffect(() => () => {
    if (widget.current) turnstile()?.remove(widget.current)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!captchaToken) { setError("Complete the security check before sending your request."); return }
    if (smsConsent && !phone) { setError("Add a phone number or turn off text updates."); return }
    const form = new FormData(event.currentTarget)
    requestId.current ||= crypto.randomUUID()
    setBusy(true)
    try {
      const response = await fetch("/api/intake", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          requestId: requestId.current, fullName: form.get("fullName"),
          email: form.get("email"), purpose: form.get("purpose"), message: form.get("message"),
          phone, smsConsent, privacyAccepted: form.get("privacyAccepted") === "on",
          website: form.get("website") || "", captchaToken,
        }),
      })
      const body = await response.json()
      if (!response.ok || !body.received || !body.reference) throw new Error(body.error || "We couldn't confirm your request was saved. Please retry.")
      setReference(body.reference)
    } catch (error) {
      setError(error instanceof Error && !/fetch|timeout|aborted/i.test(error.message)
        ? error.message : "Connection interrupted. We couldn't confirm the save. Retry with the same details.")
    } finally {
      setBusy(false)
      setCaptchaToken("")
      if (widget.current) turnstile()?.reset(widget.current)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="CookinCapital" width={36} height={36} className="rounded-lg" />
            <span className="font-semibold">CookinCapital</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-[0.8fr_1fr] gap-12 lg:gap-20">
        <section className="space-y-7">
          <p className="text-xs uppercase tracking-widest text-primary">Capital / Research / SaintSal</p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">One request.<br />The right next step.</h1>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Tell us what you’re working on. Start with the essentials; detailed financial documents come later, only if needed.
          </p>
          <div className="border-t border-border pt-7 space-y-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">No SSN, date of birth or credit report is requested in this form. Please do not include sensitive financial information in your message.</p>
            </div>
            <p className="text-sm text-muted-foreground">This is an initial inquiry, not a credit application, offer of financing or approval.</p>
          </div>
          <div className="border-t border-border pt-7 space-y-4">
            <Link href="/auth/sign-up" className="flex items-center justify-between gap-4 text-sm font-medium text-primary">
              Just need SAL? Create your account <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/apply" className="flex items-center justify-between gap-4 text-sm text-muted-foreground hover:text-foreground">
              Already working with us? Full application <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
          {reference ? (
            <div role="status" className="space-y-6 py-8">
              <CheckCircle2 className="h-7 w-7 text-primary" />
              <h2 className="text-xl font-semibold">Your request is saved.</h2>
              <p className="text-sm text-muted-foreground">It is queued for team review. This receipt does not mean financing is approved or that an email or text has been sent.</p>
              <p className="text-xs text-muted-foreground break-all">Reference: {reference}</p>
              <Button asChild className="w-full h-11"><Link href="/research">Continue with SAL Research</Link></Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="text-xl font-semibold">How can we help?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="intake-name">Full name</Label>
                  <Input id="intake-name" name="fullName" autoComplete="name" minLength={2} maxLength={100} required className="h-11" />
                </div>
                <div className="space-y-2"><Label htmlFor="intake-email">Email</Label>
                  <Input id="intake-email" name="email" type="email" autoComplete="email" maxLength={254} required className="h-11" />
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="intake-purpose">I’m here for</Label>
                <select id="intake-purpose" name="purpose" required defaultValue="capital"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary">
                  <option value="capital">Capital for a property or business</option>
                  <option value="research">Property research and deal analysis</option>
                  <option value="account">SAL or account support</option>
                  <option value="general">Something else</option>
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="intake-message">A little about your request</Label>
                <textarea id="intake-message" name="message" required minLength={10} maxLength={2000} rows={3}
                  placeholder="What are you working on, and how can we help?"
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-primary resize-y" />
              </div>
              <details className="border-y border-border py-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">Add a phone number or request text updates (optional)</summary>
                <div className="space-y-3 mt-4">
                  <Label htmlFor="intake-phone">Phone, including country code</Label>
                  <Input id="intake-phone" type="tel" autoComplete="tel" placeholder="+19495550123" pattern="\+[1-9][0-9]{7,14}"
                    value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11" />
                  <label className="flex gap-3 items-start py-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={smsConsent} onChange={(event) => setSmsConsent(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-primary shrink-0" />
                    {SMS_CONSENT_TEXT}
                  </label>
                </div>
              </details>
              <div aria-hidden="true" className="hidden">
                <label htmlFor="intake-website">Website</label><input id="intake-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <label className="flex items-start gap-3 py-2 text-xs text-muted-foreground">
                <input name="privacyAccepted" type="checkbox" required className="h-4 w-4 mt-0.5 accent-primary shrink-0" />
                <span>I agree to the <Link href="/help?doc=terms" className="underline text-foreground">Terms of Service</Link> and acknowledge the{" "}
                  <Link href="/help?doc=privacy" className="underline text-foreground">Privacy Policy</Link>. You may email me about this request. This is not marketing consent.</span>
              </label>
              {siteKey ? <>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderCaptcha}
                  onError={() => setError("The security check couldn't load. Please refresh and try again.")} />
                <div ref={captcha} />
              </> : <p role="status" className="text-sm text-muted-foreground">Online intake is awaiting secure configuration. No request can be sent from this preview.</p>}
              {error && <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}
              <Button type="submit" disabled={busy || !captchaToken} className="h-11 w-full">
                {busy ? "Saving your request…" : "Send request"}
              </Button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
