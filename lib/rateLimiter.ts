import type Redis from "ioredis"

const localStore = new Map<string, { count: number; reset: number }>()

export function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real
  return "unknown"
}

let redisClient: Redis | null = null
if (process.env.REDIS_URL) {
  try {
    // dynamic require so module is optional during development
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require("ioredis")
    redisClient = new IORedis(process.env.REDIS_URL)
  } catch (e) {
    console.error("ioredis not available, falling back to in-memory rate limiter", e)
    redisClient = null
  }
}

export async function checkRateLimit(req: Request, key = "global", limit = 10, windowMs = 60_000) {
  const ip = getClientIp(req)
  const storeKey = `${key}:${ip}`
  const now = Date.now()

  if (redisClient) {
    try {
      const count = await redisClient.incr(storeKey)
      if (count === 1) {
        await redisClient.pexpire(storeKey, windowMs)
      }
      const ttl = await redisClient.pttl(storeKey)
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        reset: Date.now() + (ttl > 0 ? ttl : windowMs),
      }
    } catch (e) {
      console.error("Redis rate limiter failed, falling back to in-memory:", e)
    }
  }

  // In-memory fallback
  let entry = localStore.get(storeKey)
  if (!entry || now > entry.reset) {
    entry = { count: 0, reset: now + windowMs }
  }
  entry.count += 1
  localStore.set(storeKey, entry)
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.reset,
  }
}

export async function resetRateLimitFor(req: Request, key = "global") {
  const ip = getClientIp(req)
  const storeKey = `${key}:${ip}`
  if (redisClient) {
    try {
      await redisClient.del(storeKey)
      return
    } catch (e) {
      console.error("Failed to reset redis rate limit key:", e)
    }
  }
  localStore.delete(storeKey)
}

export default { checkRateLimit, getClientIp, resetRateLimitFor }
