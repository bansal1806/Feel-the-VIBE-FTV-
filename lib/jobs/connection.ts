import IORedis from 'ioredis'

let connection: IORedis | null = null

export function getRedisConnection() {
  if (connection) {
    return connection
  }

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.warn('[jobs] Redis URL not configured. Background jobs are disabled.')
    return null
  }

  try {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    })
    connection.on('error', (err) => {
      console.error('[jobs] Redis connection error', err)
    })
    return connection
  } catch (error) {
    console.error('[jobs] Failed to initialize Redis connection', error)
    connection = null
    return null
  }
}

