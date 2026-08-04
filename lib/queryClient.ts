import { QueryClient, type QueryFunction } from "@tanstack/react-query"

/**
 * Client-side data layer for the ported Deal Intelligence surfaces.
 * Same contract as the component library's Vite queryClient so the surfaces
 * port without edits — but relative to the Next.js app's own /api routes.
 */

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText
    throw new Error(`${res.status}: ${text}`)
  }
}

export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  })
  await throwIfResNotOk(res)
  return res
}

type UnauthorizedBehavior = "returnNull" | "throw"

export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/"))
    if (unauthorizedBehavior === "returnNull" && res.status === 401) return null as never
    await throwIfResNotOk(res)
    return (await res.json()) as never
  }

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: false,
    },
    mutations: { retry: false },
  },
})
