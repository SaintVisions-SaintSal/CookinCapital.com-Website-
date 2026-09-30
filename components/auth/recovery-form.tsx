"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, KeyRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { authMessage } from "@/lib/auth-flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RecoveryForm({ mode }: { mode: "request" | "reset" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const reset = mode === "reset"

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    if (reset && (password.length < 12 || password !== confirm)) {
      setError("Use at least 12 characters and make sure both passwords match.")
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      if (reset) {
        const { data: { user }, error: sessionError } = await supabase.auth.getUser()
        if (sessionError || !user) {
          setError("Your recovery session has expired. Request a new link to continue.")
          return
        }
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        await supabase.auth.signOut({ scope: "local" })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?flow=recovery`,
        })
        if (error) throw error
      }
      setDone(true)
    } catch (error) { setError(authMessage(error)) }
    finally { setBusy(false) }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
      <Link href="/auth/login" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
      <section className="w-full max-w-md">
        <Image src="/logo.png" alt="CookinCapital" width={48} height={48} className="mb-8 rounded-lg" />
        <KeyRound className="h-5 w-5 text-primary mb-4" />
        <h1 className="text-xl font-semibold">{reset ? "Choose a new password" : "Recover your account"}</h1>
        <p className="text-sm text-muted-foreground mt-3 mb-8">
          {reset ? "Set a new password, then sign in to return to SAL." : "Enter your account email. If it is registered, we’ll send a recovery link."}
        </p>
        {done ? (
          <div role="status" className="space-y-5 border border-border bg-card p-6 rounded-xl">
            <p>{reset ? "Your password has been updated. Sign in with your new password." : "If this email is registered, a recovery link has been requested. Check your inbox and spam folder."}</p>
            <Button asChild className="w-full"><Link href="/auth/login">Return to sign in</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {reset ? <>
              <div className="space-y-2"><Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" minLength={12} required
                  value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
              </div>
              <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required
                  value={confirm} onChange={(event) => setConfirm(event.target.value)} className="h-11" />
              </div>
            </> : <div className="space-y-2"><Label htmlFor="recovery-email">Email</Label>
              <Input id="recovery-email" type="email" autoComplete="email" required value={email}
                onChange={(event) => setEmail(event.target.value)} className="h-11" />
            </div>}
            {error && <p role="alert" className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full h-11">
              {busy ? "Please wait…" : reset ? "Update password" : "Request recovery link"}
            </Button>
            {reset && <Link href="/auth/forgot-password" className="block text-sm text-primary underline">Request a new recovery link</Link>}
          </form>
        )}
        <p className="mt-8 text-xs text-muted-foreground">
          <Link href="/help?doc=privacy" className="underline">Privacy</Link>{" · "}
          <Link href="/help?doc=terms" className="underline">Terms</Link>{" · "}
          <Link href="/research" className="underline">Explore Research</Link>
        </p>
      </section>
    </main>
  )
}
