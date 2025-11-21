import { Queue } from 'bullmq'
import { getRedisConnection } from './connection'
import { QUEUES } from './types'

let roomQueue: Queue | null | undefined
let capsuleQueue: Queue | null | undefined

function createQueue(name: string) {
  const connection = getRedisConnection()
  if (!connection) return null
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  })
}

export function getRoomExpiryQueue() {
  if (roomQueue === undefined) {
    roomQueue = createQueue(QUEUES.roomExpiry)
  }
  return roomQueue
}

export function getTimecapsuleQueue() {
  if (capsuleQueue === undefined) {
    capsuleQueue = createQueue(QUEUES.timecapsuleUnlock)
  }
  return capsuleQueue
}

