import { getRedisConnection } from './jobs/connection'

const redis = getRedisConnection()

// Simple in-memory fallback for local development when Redis is unavailable
const memoryCache = new Map<string, { value: string; expires: number }>()

function getMemoryValue(key: string) {
    const item = memoryCache.get(key)
    if (!item) return null
    if (Date.now() > item.expires) {
        memoryCache.delete(key)
        return null
    }
    return JSON.parse(item.value)
}

function setMemoryValue(key: string, value: any, ttl: number) {
    memoryCache.set(key, {
        value: JSON.stringify(value),
        expires: Date.now() + ttl * 1000
    })
}

/**
 * Cache keys
 */
export const CACHE_KEYS = {
    user: (id: string) => `user:${id}`,
    userProfile: (id: string) => `user:profile:${id}`,
    connection: (userId: string, peerId: string) => `connection:${userId}:${peerId}`,
    room: (id: string) => `room:${id}`,
    roomMembers: (id: string) => `room:members:${id}`,
    feed: (userId: string) => `feed:${userId}`,
    recommendations: (userId: string) => `recommendations:${userId}`,
    session: (token: string) => `session:${token}`,
    otpAttempts: (email: string) => `otp:attempts:${email}`,
    rateLimit: (key: string) => `ratelimit:${key}`,
} as const

/**
 * Cache TTL (in seconds)
 */
export const CACHE_TTL = {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 24 hours
} as const

/**
 * Check if Redis is actually connected
 */
function isRedisConnected(): boolean {
    return !!redis && redis.status === 'ready'
}

/**
 * Set cache value
 */
export async function setCache(
    key: string,
    value: any,
    ttl: number = CACHE_TTL.medium
): Promise<void> {
    if (isRedisConnected()) {
        try {
            await redis!.setex(key, ttl, JSON.stringify(value))
            return
        } catch (error) {
            console.error('[cache] Redis set error:', error)
        }
    }
    setMemoryValue(key, value, ttl)
}

/**
 * Get cache value
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
    if (isRedisConnected()) {
        try {
            const value = await redis!.get(key)
            return value ? JSON.parse(value) : null
        } catch (error) {
            console.error('[cache] Redis get error:', error)
        }
    }
    return getMemoryValue(key)
}

/**
 * Delete cache value
 */
export async function deleteCache(key: string): Promise<void> {
    if (isRedisConnected()) {
        try {
            await redis!.del(key)
            return
        } catch (error) {
            console.error('[cache] Redis delete error:', error)
        }
    }
    memoryCache.delete(key)
}

/**
 * Delete multiple cache values by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
    if (isRedisConnected()) {
        try {
            const keys = await redis!.keys(pattern)
            if (keys.length > 0) {
                await redis!.del(...keys)
            }
            return
        } catch (error) {
            console.error('[cache] Redis delete pattern error:', error)
        }
    }
    
    // In-memory pattern deletion (basic startsWith/endsWith support)
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    for (const key of Array.from(memoryCache.keys())) {
        if (regex.test(key)) {
            memoryCache.delete(key)
        }
    }
}

/**
 * Check if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
    if (isRedisConnected()) {
        try {
            const exists = await redis!.exists(key)
            return exists === 1
        } catch (error) {
            console.error('[cache] Redis exists error:', error)
        }
    }
    return memoryCache.has(key) && getMemoryValue(key) !== null
}

/**
 * Increment counter (for rate limiting, etc.)
 */
export async function incrementCache(key: string, ttl?: number): Promise<number> {
    if (isRedisConnected()) {
        try {
            const value = await redis!.incr(key)
            if (ttl && value === 1) {
                await redis!.expire(key, ttl)
            }
            return value
        } catch (error) {
            console.error('[cache] Redis increment error:', error)
        }
    }

    const current = getMemoryValue(key) || 0
    const next = current + 1
    setMemoryValue(key, next, ttl || CACHE_TTL.day)
    return next
}

/**
 * Add item to set
 */
export async function addToSet(key: string, value: string): Promise<void> {
    if (isRedisConnected()) {
        try {
            await redis!.sadd(key, value)
            return
        } catch (error) {
            console.error('[cache] Redis sadd error:', error)
        }
    }
    
    const set = new Set(getMemoryValue(key) || [])
    set.add(value)
    setMemoryValue(key, Array.from(set), CACHE_TTL.day)
}

/**
 * Remove item from set
 */
export async function removeFromSet(key: string, value: string): Promise<void> {
    if (isRedisConnected()) {
        try {
            await redis!.srem(key, value)
            return
        } catch (error) {
            console.error('[cache] Redis srem error:', error)
        }
    }

    const set = new Set(getMemoryValue(key) || [])
    set.delete(value)
    setMemoryValue(key, Array.from(set), CACHE_TTL.day)
}

/**
 * Get all items from set
 */
export async function getSetMembers(key: string): Promise<string[]> {
    if (isRedisConnected()) {
        try {
            return await redis!.smembers(key)
        } catch (error) {
            console.error('[cache] Redis smembers error:', error)
        }
    }
    return getMemoryValue(key) || []
}

/**
 * Check if item is in set
 */
export async function isInSet(key: string, value: string): Promise<boolean> {
    if (isRedisConnected()) {
        try {
            const isMember = await redis!.sismember(key, value)
            return isMember === 1
        } catch (error) {
            console.error('[cache] Redis sismember error:', error)
        }
    }
    const set = new Set(getMemoryValue(key) || [])
    return set.has(value)
}

/**
 * Add item to sorted set with score
 */
export async function addToSortedSet(
    key: string,
    value: string,
    score: number
): Promise<void> {
    if (isRedisConnected()) {
        try {
            await redis!.zadd(key, score, value)
            return
        } catch (error) {
            console.error('[cache] Redis zadd error:', error)
        }
    }

    const set: Array<{ value: string; score: number }> = getMemoryValue(key) || []
    const index = set.findIndex(i => i.value === value)
    if (index > -1) {
        set[index].score = score
    } else {
        set.push({ value, score })
    }
    set.sort((a, b) => a.score - b.score)
    setMemoryValue(key, set, CACHE_TTL.day)
}

/**
 * Get items from sorted set by score range
 */
export async function getSortedSetRange(
    key: string,
    min: number,
    max: number
): Promise<string[]> {
    if (isRedisConnected()) {
        try {
            return await redis!.zrangebyscore(key, min, max)
        } catch (error) {
            console.error('[cache] Redis zrange error:', error)
        }
    }

    const set: Array<{ value: string; score: number }> = getMemoryValue(key) || []
    return set
        .filter(item => item.score >= min && item.score <= max)
        .map(item => item.value)
}

/**
 * Rate limiting helper
 */
export async function checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
    const key = CACHE_KEYS.rateLimit(identifier)
    const attempts = await incrementCache(key, windowSeconds)

    return {
        allowed: attempts <= maxAttempts,
        remaining: Math.max(0, maxAttempts - attempts),
    }
}

/**
 * Cache decorator for functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string,
    ttl: number = CACHE_TTL.medium
): T {
    return (async (...args: Parameters<T>) => {
        const key = keyGenerator(...args)

        // Try to get from cache
        const cached = await getCache(key)
        if (cached !== null) {
            return cached
        }

        // Execute function and cache result
        const result = await fn(...args)
        await setCache(key, result, ttl)

        return result
    }) as T
}

/**
 * Invalidate user-related caches
 */
export async function invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
        deleteCache(CACHE_KEYS.user(userId)),
        deleteCache(CACHE_KEYS.userProfile(userId)),
        deleteCache(CACHE_KEYS.feed(userId)),
        deleteCache(CACHE_KEYS.recommendations(userId)),
        deleteCachePattern(`connection:${userId}:*`),
        deleteCachePattern(`connection:*:${userId}`),
    ])
}

/**
 * Invalidate room-related caches
 */
export async function invalidateRoomCache(roomId: string): Promise<void> {
    await Promise.all([
        deleteCache(CACHE_KEYS.room(roomId)),
        deleteCache(CACHE_KEYS.roomMembers(roomId)),
    ])
}

