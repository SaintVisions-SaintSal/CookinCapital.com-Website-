import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/auth-flow"
import { queueConfirmedSignup } from "@/lib/intake/server"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function Complete({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  let authenticated = false
  try {
    const auth = await createServerClient()
    const { data: { user }, error } = await auth.auth.getUser()
    authenticated = Boolean(!error && user?.email_confirmed_at)
  } catch { /* Configuration and availability are handled as an unauthenticated session. */ }
  if (!authenticated) redirect("/auth/login")
  let queued = false
  try { queued = await queueConfirmedSignup() } catch { /* Never block product access on CRM availability. */ }
  const next = safeNext((await searchParams).next)
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <section className="max-w-lg w-full border border-border rounded-xl bg-card p-8 space-y-6">
        <p className="text-xs tracking-widest uppercase text-primary">CookinCapital / SaintSal</p>
        <h1 className="text-xl font-semibold">Your account is ready.</h1>
        <p className="text-muted-foreground">Start a conversation with SAL or return to your research. A capital inquiry is a separate step.</p>
        {!queued && <p role="status" className="text-sm text-muted-foreground">Your account is active. Team synchronization is pending; it does not prevent you from using SAL.</p>}
        <Button asChild className="w-full h-11"><Link href={next}>Continue to SAL</Link></Button>
        <Link href="/prequal" className="block text-sm text-primary underline">Talk to the capital team</Link>
      </section>
    </main>
  )
}
