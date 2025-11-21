export const SwipeDirection = {
  LIKE: 'LIKE',
  PASS: 'PASS',
} as const

export type SwipeDirection = (typeof SwipeDirection)[keyof typeof SwipeDirection]

export const SwipeTargetType = {
  USER: 'USER',
  ROOM: 'ROOM',
  EVENT: 'EVENT',
} as const

export type SwipeTargetType = (typeof SwipeTargetType)[keyof typeof SwipeTargetType]

