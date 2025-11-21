import type { JobsOptions } from 'bullmq'
import { getRoomExpiryQueue, getTimecapsuleQueue } from './queues'
import type { RoomExpiryPayload, TimecapsuleUnlockPayload } from './types'

export async function scheduleRoomExpiryJob(payload: RoomExpiryPayload, options: JobsOptions = {}) {
  const queue = getRoomExpiryQueue()
  if (!queue) {
    console.warn('[jobs] room expiry queue unavailable; skipping job scheduling')
    return
  }
  await queue.add(payload.roomId, payload, {
    delay: Math.max(0, new Date(payload.expiresAt).getTime() - Date.now()),
    ...options,
  })
}

export async function scheduleTimecapsuleUnlockJob(
  payload: TimecapsuleUnlockPayload,
  options: JobsOptions = {},
) {
  const queue = getTimecapsuleQueue()
  if (!queue) {
    console.warn('[jobs] timecapsule queue unavailable; skipping job scheduling')
    return
  }
  await queue.add(payload.timecapsuleId, payload, {
    delay: Math.max(0, new Date(payload.unlockAt).getTime() - Date.now()),
    ...options,
  })
}

