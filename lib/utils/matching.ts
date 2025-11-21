import type { User } from '@prisma/client'
import { haversineDistanceKm } from './geo'

export type CompatibilityResult = {
  score: number
  sharedInterests: string[]
  sharedIntents: string[]
  proximityKm: number | null
}

export function computeCompatibility(current: User, candidate: User): CompatibilityResult {
  const sharedInterests = intersectStringArrays(current.interests, candidate.interests)
  const sharedIntents = intersectStringArrays(current.intents ?? [], candidate.intents ?? [])

  let proximityKm: number | null = null
  if (
    typeof current.latitude === 'number' &&
    typeof current.longitude === 'number' &&
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number'
  ) {
    proximityKm = haversineDistanceKm(
      { latitude: current.latitude, longitude: current.longitude },
      { latitude: candidate.latitude, longitude: candidate.longitude },
    )
  }

  const interestScore = sharedInterests.length > 0 ? Math.min(60, sharedInterests.length * 12) : 10
  const intentScore = sharedIntents.length > 0 ? Math.min(25, sharedIntents.length * 12) : 5

  let proximityScore = 10
  if (proximityKm != null) {
    if (proximityKm < 0.5) proximityScore = 20
    else if (proximityKm < 2) proximityScore = 18
    else if (proximityKm < 5) proximityScore = 15
    else if (proximityKm < 15) proximityScore = 12
    else proximityScore = 6
  }

  const recencyScore = computeRecencyScore(candidate.lastActiveAt ?? candidate.updatedAt)

  const rawScore = interestScore + intentScore + proximityScore + recencyScore
  const score = Math.min(100, Math.round(rawScore))

  return { score, sharedInterests, sharedIntents, proximityKm }
}

function computeRecencyScore(date: Date) {
  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60)
  if (diffHours < 1) return 20
  if (diffHours < 6) return 15
  if (diffHours < 24) return 12
  if (diffHours < 72) return 9
  if (diffHours < 168) return 6
  return 3
}

function intersectStringArrays(a: string[] | null | undefined, b: string[] | null | undefined) {
  if (!Array.isArray(a) || !Array.isArray(b)) return []
  const set = new Set(a.map((entry) => entry.toLowerCase()))
  return b.filter((entry) => set.has(entry.toLowerCase()))
}

