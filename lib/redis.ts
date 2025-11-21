import Redis from 'ioredis'

let redisClient: Redis | null = null

export function createClient(): Redis {
  if (redisClient) {
    return redisClient
  }
  
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })
  
  return redisClient
}

export function getRedisClient(): Redis {
  return createClient()
}

