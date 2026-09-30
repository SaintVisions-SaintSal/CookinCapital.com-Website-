import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, Inbox } from "lucide-react"
import { intakeDatabase, operatorIdentity } from "@/lib/intake/server"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"
export const metadata = { title: "Intake exceptions | CookinCapital", robots: { index: false, follow: false } }

export default async function IntakeOperations({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (!await operatorIdentity()) notFound()
  const view = (await searchParams).view || "attention"
  let events: Array<{
    id: string; state: string; created_at: string; last_error: string | null
    payload: { fullName: string; email: string; purpose: string }
  }> = []
  let unavailable = false
  try {
    const db = intakeDatabase()
    const states = view === "pending" ? ["pending", "processing"]
      : view === "failed" ? ["failed"]
      : view === "accepted" ? ["accepted"]
      : ["pending", "processing", "accepted", "failed"]
    const { data, error } = await db.from("cc_intake_outbox")
      .select("id,state,created_at,last_error,payload").in("state", states)
      .order("created_at", { ascending: true }).limit(100)
    if (error) throw error
    events = data || []
  } catch { unavailable = true }
  const location = process.env.GHL_LOCATION_ID
  const ghl = location && /^[a-zA-Z0-9]+$/.test(location) ? `https://app.gohighlevel.com/v2/location/${location}` : null
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-3">CookinCapital / Operations</p>
            <h1 className="text-xl font-semibold">Intake exceptions</h1>
            <p className="text-sm text-muted-foreground mt-2">Requests that still need delivery or a CRM completion receipt. Oldest first, up to 100 records.</p>
          </div>
          <Button asChild variant="outline"><Link href="/operations/intake">Refresh</Link></Button>
        </header>
        <section className="flex flex-wrap gap-3 border-y border-border py-4" aria-label="Queue filters">
          {[["attention", "Needs attention"], ["pending", "Waiting to send"], ["accepted", "Awaiting CRM receipt"], ["failed", "Failed / uncertain"]].map(([key, label]) => (
            <Link key={key} href={`/operations/intake?view=${key}`}
              aria-current={view === key ? "page" : undefined}
              className={`px-4 py-3 rounded-lg text-sm ${view === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{label}</Link>
          ))}
        </section>
        {unavailable ? <p role="alert" className="bg-destructive/10 text-destructive p-6 rounded-xl">The intake queue could not be loaded. This does not mean there are no requests.</p>
          : events.length ? <div className="space-y-3">{events.map((event) => (
            <article key={event.id} className="border border-border bg-card rounded-xl p-5 flex flex-wrap gap-4 justify-between">
              <div className="min-w-0"><h2 className="font-medium break-words">{event.payload.fullName || "Account request"}</h2>
                <p className="text-sm text-muted-foreground break-all">{event.payload.email}</p>
                <p className="text-xs text-muted-foreground mt-2">{event.payload.purpose} · {new Date(event.created_at).toISOString()}</p>
                <p className="text-xs text-muted-foreground mt-2 break-all">Reference: {event.id}</p>
              </div>
              <div className="text-sm">
                <span className="rounded-md bg-secondary px-3 py-1">{event.state === "accepted" ? "Awaiting CRM receipt" : event.state}</span>
                {event.last_error && <p className="text-destructive mt-3">{event.last_error}</p>}
              </div>
            </article>
          ))}</div> : <section className="py-14 text-center border border-border rounded-xl">
            <Inbox className="w-6 h-6 text-primary mx-auto mb-4" />
            <h2 className="font-medium">No requests in this view.</h2>
            <p className="text-sm text-muted-foreground mt-2">Check conversations and due tasks in GHL for customer follow-up.</p>
          </section>}
        <section className="border-t border-border pt-6 flex flex-wrap gap-6 text-sm">
          {ghl ? <>
            <a href={`${ghl}/opportunities`} target="_blank" rel="noreferrer" className="flex gap-2 text-primary">Open lending pipeline <ArrowUpRight className="w-4 h-4" /></a>
            <a href={`${ghl}/conversations/conversations`} target="_blank" rel="noreferrer" className="flex gap-2 text-primary">Open conversations <ArrowUpRight className="w-4 h-4" /></a>
          </> : <p className="text-muted-foreground">GHL location routing is not configured.</p>}
          <p className="w-full text-xs text-muted-foreground">An accepted webhook is not proof of a created contact. Review uncertain delivery in GHL before re-queuing; never enroll contacts in messaging without the approved consent checks.</p>
        </section>
      </div>
    </main>
  )
}
