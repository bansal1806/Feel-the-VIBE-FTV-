import Redis from 'ioredis'
import { log } from './logger'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    log.warn('Redis URL not configured. Redis features will be disabled.')
    return null
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const isLocal = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')
        if (process.env.NODE_ENV === 'development' && isLocal && times > 3) {
          return null // Stop retrying localhost in dev
        }
        // Exponential backoff with max delay of 3 seconds
        const delay = Math.min(times * 50, 3000)
        if (process.env.NODE_ENV !== 'development') {
          log.info(`Redis retry attempt ${times}, waiting ${delay}ms`)
        }
        return delay
      },
      reconnectOnError(err) {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          return true
        }
        return false
      },
    })

    redis.on('error', (err: any) => {
      const isLocal = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')
      const isRefused = err.code === 'ECONNREFUSED' || 
                       err.message?.includes('ECONNREFUSED') ||
                       err.errors?.some((e: any) => e.code === 'ECONNREFUSED')

      if (process.env.NODE_ENV === 'development' && isLocal && isRefused) {
        return // Silent in dev for localhost
      }
      log.error('Redis Client Error', err)
    })

    redis.on('connect', () => {
      log.info('Redis connected successfully')
    })

    redis.on('ready', () => {
      log.info('Redis ready to accept commands')
    })

    redis.on('close', () => {
      log.warn('Redis connection closed')
    })

    redis.on('reconnecting', () => {
      log.info('Redis reconnecting...')
    })

    return redis
  } catch (error) {
    log.error('Failed to initialize Redis client', error)
    return null
  }
}
