import 'dotenv/config'
import { Worker } from 'bullmq'
import { getRedisConnection } from '@/lib/jobs/connection'
import { QUEUES, type RoomExpiryPayload, type TimecapsuleUnlockPayload } from '@/lib/jobs/types'
import { prisma } from '@/lib/prisma'

const redisConnection = getRedisConnection()
if (!redisConnection) {
  console.error('[worker] Redis connection unavailable. Exiting worker.')
  process.exit(1)
}

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? '5')

new Worker<RoomExpiryPayload>(
  QUEUES.roomExpiry,
  async (job) => {
    const { roomId } = job.data
    await prisma.room.updateMany({
      where: { id: roomId, active: true },
      data: { active: false },
    })
    await prisma.roomMember.updateMany({
      where: { roomId, leftAt: null },
      data: { leftAt: new Date() },
    })
    return { closed: true }
  },
  { connection: redisConnection, concurrency },
)

new Worker<TimecapsuleUnlockPayload>(
  QUEUES.timecapsuleUnlock,
  async (job) => {
    const { timecapsuleId } = job.data
    await prisma.timecapsule.update({
      where: { id: timecapsuleId },
      data: { updatedAt: new Date() },
    })
    // TODO: trigger notifications
    return { unlocked: true }
  },
  { connection: redisConnection, concurrency },
)

process.on('SIGTERM', async () => {
  if (redisConnection) {
    await redisConnection.quit()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  if (redisConnection) {
    await redisConnection.quit()
  }
  process.exit(0)
})

