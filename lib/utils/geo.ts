export function haversineDistanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const R = 6371 // Earth radius in km
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)

  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav))
  return R * c
}

export function formatDistance(distanceKm: number | null | undefined) {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return null
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`
  }
  return `${Math.round(distanceKm)} km`
}

