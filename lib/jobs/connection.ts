import IORedis from 'ioredis'

let connection: IORedis | null = null
let hasWarnedLocalFallback = false

export function getRedisConnection() {
  if (connection) {
    return connection
  }

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    if (process.env.NODE_ENV === 'development' && !hasWarnedLocalFallback) {
        console.info('[jobs] Redis URL not configured. Using Native Emulator fallback.')
        hasWarnedLocalFallback = true
    }
    return null
  }

  // Pre-emptive check for localhost to avoid noisy bullmq errors if Docker is down
  const isLocalhost = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')
  
  try {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: true, // Allow jobs to be queued while reconnecting (though we prefer emulator)
      connectTimeout: isLocalhost ? 1000 : 5000,
      retryStrategy(times) {
        // In development, stop retrying after 1 attempt if it's localhost (favor emulator)
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
          if (times > 1 && isLocalhost) {
            return null // Stop retrying localhost
          }
        }
        const delay = Math.min(times * 100, 3000)
        return delay
      },
      reconnectOnError(err) {
        return err.message.includes('READONLY')
      },
    })

    connection.on('error', (err: any) => {
      // Suppress noisy logs for localhost connection failures in development
      const isRefused = err.code === 'ECONNREFUSED' || 
                       err.message?.includes('ECONNREFUSED') ||
                       err.errors?.some((e: any) => e.code === 'ECONNREFUSED')

      if (isRefused && isLocalhost) {
        // Only log once to inform the user
        if (!hasWarnedLocalFallback) {
          console.warn('[jobs] ⚠️  Local Redis (localhost:6379) unreachable. Running in Native Emulator mode.')
          hasWarnedLocalFallback = true
        }
        return
      }
      
      console.error('[jobs] Redis connection error:', err)
    })

    return connection
  } catch (error) {
    console.error('[jobs] Failed to initialize Redis connection', error)
    connection = null
    return null
  }
}

