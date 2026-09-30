import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const metadata = { robots: { index: false, follow: false } }

export default function PreviewHome() {
  if (process.env.CC_PREVIEW_MODE !== "true") notFound()
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-primary">CookinCapital / Review</p>
          <h1 className="text-3xl font-semibold">A simpler way in.</h1>
          <p className="text-muted-foreground leading-relaxed">Review the repaired account screens and shorter inquiry flow. This preview is disconnected from production: it cannot create accounts, send messages or submit CRM requests.</p>
        </header>
        <section className="divide-y divide-border border-y border-border">
          {[
            ["/auth/sign-up", "Get SAL", "A direct account path, separate from a capital application."],
            ["/prequal", "Talk to the team", "Four essential fields. Phone and text updates stay optional."],
            ["/auth/forgot-password", "Recover an account", "A real recovery screen instead of a missing page."],
            ["/auth/reset-password", "Set a new password", "Confirmation, mismatch handling and expired-session recovery."],
            ["/auth/login", "Sign in", "Clear errors and a return path to the customer's intended workspace."],
          ].map(([href, title, description]) => <div key={href} className="py-6 flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="font-medium">{title}</h2><p className="text-sm text-muted-foreground mt-2">{description}</p></div>
            <Button asChild variant="outline"><Link href={href}>Review</Link></Button>
          </div>)}
        </section>
        <p className="text-xs text-muted-foreground">The operator queue is server-protected and deliberately has no preview bypass. Database selection, Heather’s assignment, workflow mapping and real delivery tests remain release gates.</p>
      </div>
    </main>
  )
}
