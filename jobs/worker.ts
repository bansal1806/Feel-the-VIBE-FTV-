import 'dotenv/config'
import { Worker } from 'bullmq'
import { getRedisConnection } from '@/lib/jobs/connection'
import { QUEUES, type RoomExpiryPayload, type TimecapsuleUnlockPayload } from '@/lib/jobs/types'
import { handleRoomExpiry, handleTimecapsuleUnlock } from '@/lib/jobs/handlers'

const redisConnection = getRedisConnection()

if (!redisConnection) {
  console.info('\nℹ️  [worker] Redis unavailable. Entering Native Emulator Mode.')
  console.info('[worker] The background worker process will stay idle.')
  console.info('[worker] Jobs are being handled in-process by the App Emulator.\n')
  
  // Keep the process alive if explicitly run, but sit idle
  // (In docker-less dev, the user usually doesn't need to run this script separately)
  setInterval(() => {}, 1000)
} else {
  const concurrency = Number(process.env.WORKER_CONCURRENCY ?? '5')

  console.info(`\n🚀 [worker] Starting Redis-backed workers (concurrency: ${concurrency})...`)

  new Worker<RoomExpiryPayload>(
    QUEUES.roomExpiry,
    async (job) => handleRoomExpiry(job.data),
    { connection: redisConnection, concurrency },
  )

  new Worker<TimecapsuleUnlockPayload>(
    QUEUES.timecapsuleUnlock,
    async (job) => handleTimecapsuleUnlock(job.data),
    { connection: redisConnection, concurrency },
  )

  console.info('✅ [worker] Workers ready.\n')

  const cleanup = async () => {
    if (redisConnection) {
      await redisConnection.quit()
    }
    process.exit(0)
  }

  process.on('SIGTERM', cleanup)
  process.on('SIGINT', cleanup)
}
