import { prisma } from '../prisma'
import { batchUpdateRoomTrust } from '../connection/trust'
import { QUEUES, type RoomExpiryPayload, type TimecapsuleUnlockPayload } from './types'

export async function handleRoomExpiry(payload: RoomExpiryPayload) {
  const { roomId } = payload

  // Get all active members before closing the room
  const activeMembers = await prisma.roomMember.findMany({
    where: { roomId, leftAt: null },
    select: { userId: true },
  })

  // Close the room
  await prisma.room.updateMany({
    where: { id: roomId, active: true },
    data: { active: false },
  })

  // Get room details to calculate duration
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { createdAt: true, expiresAt: true },
  })

  // Award trust points for time spent together
  if (room) {
    const durationMs = room.expiresAt.getTime() - room.createdAt.getTime()
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    
    if (durationMinutes > 0) {
      await batchUpdateRoomTrust(roomId, durationMinutes)
    }
  }

  // Mark all members as left
  await prisma.roomMember.updateMany({
    where: { roomId, leftAt: null },
    data: { leftAt: new Date() },
  })

  // Create notifications
  if (activeMembers.length > 0) {
    await prisma.notification.createMany({
      data: activeMembers.map((member) => ({
        userId: member.userId,
        type: 'ROOM_ACTIVITY',
        payload: {
          message: 'A Now Room you were in has expired',
          roomId,
          action: 'room_expired',
        },
      })),
    })
  }

  return { closed: true, notified: activeMembers.length }
}

export async function handleTimecapsuleUnlock(payload: TimecapsuleUnlockPayload) {
  const { timecapsuleId } = payload

  const timecapsule = await prisma.timecapsule.findUnique({
    where: { id: timecapsuleId },
    include: {
      campus: true,
      creator: true,
    },
  })

  if (!timecapsule) {
    return { unlocked: false, error: 'Timecapsule not found' }
  }

  // Update the timecapsule
  await prisma.timecapsule.update({
    where: { id: timecapsuleId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date()
    },
  })

  // Get users who should be notified
  let targetUsers: { id: string }[] = []

  if (timecapsule.audience === 'campus' && timecapsule.campusId) {
    targetUsers = await prisma.user.findMany({
      where: { campusId: timecapsule.campusId },
      select: { id: true },
    })
  } else if (timecapsule.audience === 'public') {
    targetUsers = await prisma.user.findMany({
      where: { campusId: timecapsule.campusId },
      select: { id: true },
      take: 100,
    })
  }

  // Create notifications
  if (targetUsers.length > 0) {
    await prisma.notification.createMany({
      data: targetUsers.map((user) => ({
        userId: user.id,
        type: 'TIME_CAPSULE',
        payload: {
          message: `A timecapsule "${timecapsule.title}" has been unlocked!`,
          timecapsuleId,
          creatorAlias: timecapsule.creator.alias,
          action: 'timecapsule_unlocked',
        },
      })),
    })
  }

  return { unlocked: true, notified: targetUsers.length }
}
