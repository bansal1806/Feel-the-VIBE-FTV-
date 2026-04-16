import type { JobsOptions } from 'bullmq'
import { getRoomExpiryQueue, getTimecapsuleQueue } from './queues'
import type { RoomExpiryPayload, TimecapsuleUnlockPayload } from './types'

import { handleRoomExpiry, handleTimecapsuleUnlock } from './handlers'

export async function scheduleRoomExpiryJob(payload: RoomExpiryPayload, options: JobsOptions = {}) {
  const queue = getRoomExpiryQueue()
  
  const delay = Math.max(0, new Date(payload.expiresAt).getTime() - Date.now())

  if (!queue) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[jobs] 🚀 Emulator: Scheduling room expiry (${payload.roomId}) in ${Math.round(delay/1000)}s`)
      setTimeout(() => {
        handleRoomExpiry(payload).catch(err => 
          console.error(`[jobs] Emulator failed for room ${payload.roomId}:`, err)
        )
      }, delay)
    } else {
      console.warn('[jobs] room expiry queue unavailable; skipping job scheduling')
    }
    return
  }

  await queue.add(payload.roomId, payload, {
    delay,
    ...options,
  })
}

export async function scheduleTimecapsuleUnlockJob(
  payload: TimecapsuleUnlockPayload,
  options: JobsOptions = {},
) {
  const queue = getTimecapsuleQueue()
  
  const delay = Math.max(0, new Date(payload.unlockAt).getTime() - Date.now())

  if (!queue) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[jobs] 🚀 Emulator: Scheduling timecapsule unlock (${payload.timecapsuleId}) in ${Math.round(delay/1000)}s`)
      setTimeout(() => {
        handleTimecapsuleUnlock(payload).catch(err => 
          console.error(`[jobs] Emulator failed for timecapsule ${payload.timecapsuleId}:`, err)
        )
      }, delay)
    } else {
      console.warn('[jobs] timecapsule queue unavailable; skipping job scheduling')
    }
    return
  }

  await queue.add(payload.timecapsuleId, payload, {
    delay,
    ...options,
  })
}

