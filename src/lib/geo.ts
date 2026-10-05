/**
 * Geographic utility functions for ParkWise.
 *
 * All functions use standard geographic conventions:
 *   - latitude  in decimal degrees (positive = North)
 *   - longitude in decimal degrees (positive = East)
 */

const EARTH_RADIUS_M = 6_371_000; // metres

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine great-circle distance between two lat/lon points.
 * Returns distance in metres.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Formats a distance in metres for display.
 *
 * < 1000 m  → "350 m"
 * ≥ 1000 m  → "1.2 km"
 */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)} m`;
  }
  return `${(metres / 1000).toFixed(1)} km`;
}

/**
 * Estimates walking time (minutes) from a distance in metres.
 *
 * Average walking speed: ~80 m/min (~4.8 km/h).
 * Minimum returned value: 1 minute.
 */
export function estimateWalkingTime(metres: number): number {
  return Math.max(1, Math.round(metres / 80));
}

/**
 * Converts a lat/lon offset in metres to approximate decimal degrees.
 * Used to place mock parking offsets relative to the user's location.
 *
 * Accuracy is sufficient for city-scale demo purposes.
 */
export function metresToLatDelta(metres: number): number {
  // 1 degree latitude ≈ 111 320 m everywhere
  return metres / 111_320;
}

export function metresToLonDelta(metres: number, atLatitude: number): number {
  // 1 degree longitude ≈ 111 320 × cos(lat)
  return metres / (111_320 * Math.cos(toRad(atLatitude)));
}
