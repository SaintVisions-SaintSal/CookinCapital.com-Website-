export class AIResilienceError extends Error {
  constructor(
    message: string,
    public readonly isRetryable: boolean = true,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = "AIResilienceError"
  }
}

export interface RetryOptions {
  maxRetries?: number
  fallbackModel?: string
  onRetry?: (attempt: number, error: Error) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, fallbackModel, onRetry } = options
  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Check if error is retryable
      const isRateLimited = error.status === 429 || error.message?.includes("rate limit")
      const isServerError = error.status >= 500 && error.status < 600
      const isTimeout = error.message?.includes("timeout") || error.code === "ETIMEDOUT"

      if (!isRateLimited && !isServerError && !isTimeout) {
        // Non-retryable error - fail immediately
        throw new AIResilienceError(error.message, false, error.status)
      }

      // Notify about retry
      onRetry?.(attempt + 1, error)

      // Last attempt - try fallback if available
      if (attempt === maxRetries - 1) {
        if (fallbackModel) {
          console.log(`[v0] All retries failed, attempting fallback to ${fallbackModel}`)
          // Caller should handle fallback model switching
        }
        break
      }

      // Exponential backoff with jitter
      const baseDelay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s, 8s
      const jitter = Math.random() * 1000 // 0-1s random jitter
      const delay = baseDelay + jitter

      console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new AIResilienceError(`All ${maxRetries} retry attempts failed: ${lastError!.message}`)
}

export function isRetryableError(error: any): boolean {
  if (error.status === 429) return true // Rate limit
  if (error.status >= 500 && error.status < 600) return true // Server errors
  if (error.code === "ETIMEDOUT") return true // Timeout
  if (error.message?.includes("rate limit")) return true
  if (error.message?.includes("timeout")) return true
  return false
}
