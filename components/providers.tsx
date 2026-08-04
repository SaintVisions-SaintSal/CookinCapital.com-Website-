"use client"

import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"

/** Client data layer for the Deal Intelligence surfaces. Dark only — no theme provider. */
export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
