import { redirect } from "next/navigation"

export default function DashboardRedirect() {
  // Redirect /app/dashboard to /app (which is the main dashboard)
  redirect("/app")
}
