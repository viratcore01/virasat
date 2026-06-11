/**
 * In-memory rate limiter for API routes.
 * Uses sliding window algorithm per IP + identifier.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const key = `${options.keyPrefix || 'rl'}:${identifier}`

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: options.maxRequests - 1, resetAt }
  }

  entry.count++

  if (entry.count > options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt }
}

export function getRateLimitIdentifier(req: Request): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown'
  return ip
}

const PRESETS = {
  strict: { windowMs: 60_000, maxRequests: 5 },
  moderate: { windowMs: 60_000, maxRequests: 20 },
  generous: { windowMs: 60_000, maxRequests: 100 },
} as const

export const RATE_LIMITS = {
  AUTH_LOGIN: { ...PRESETS.strict, keyPrefix: 'auth:login' },
  AUTH_SIGNUP: { ...PRESETS.moderate, keyPrefix: 'auth:signup' },
  AUTH_RECOVERY: { ...PRESETS.strict, keyPrefix: 'auth:recovery' },
  SENSITIVE: { ...PRESETS.moderate, keyPrefix: 'sensitive' },
} as const

export function cleanupStore(): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

setInterval(cleanupStore, 60_000)
