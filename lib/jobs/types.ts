export type RoomExpiryPayload = {
  roomId: string
  expiresAt: string
}

export type TimecapsuleUnlockPayload = {
  timecapsuleId: string
  unlockAt: string
}

export const QUEUES = {
  roomExpiry: 'room-expiry',
  timecapsuleUnlock: 'timecapsule-unlock',
} as const

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES]

