import type { ParkingSpot } from '@/types';
import type { ParkingPreferences } from './types';

/**
 * Scores a single parking spot against user preferences.
 *
 * Scoring factors (all deterministic — the LLM never touches this):
 *   Distance     0–30  pts  (closer = better, capped at 5 km)
 *   Availability 0–20  pts  (+15 bonus if explicitly requested)
 *   Price        0–20  pts  (only adjusted when pricePriority is set)
 *   Covered     +20/-8 pts  (only adjusted when covered is requested)
 *   EV          +20/-8 pts  (only adjusted when evCharging is requested)
 *   Walk time   -40   pts  (hard penalty when exceeds maxWalkingMinutes)
 *   Max price   -25   pts  (hard penalty when pricePerHour exceeds limit)
 *
 * Missing OSM data (covered/EV unknown) is treated as neutral — no penalty.
 */
function scoreParking(parking: ParkingSpot, prefs: ParkingPreferences): number {
  let score = 0;

  // 1. Distance: 0–30 pts, normalized to 5 km
  score += Math.max(0, 30 * (1 - parking.distanceMeters / 5000));

  // 2. Walking time hard penalty
  if (prefs.maxWalkingMinutes !== null) {
    if (parking.walkingMinutes > prefs.maxWalkingMinutes) {
      score -= 40;
    } else {
      score += 5; // comfortably within preference
    }
  }

  // 3. Availability: 0–20 pts, +15 extra if it was requested
  const availScore = (parking.availabilityPercentage / 100) * 20;
  score += availScore;
  if (prefs.availabilityPriority === 'high') {
    score += (parking.availabilityPercentage / 100) * 15;
  }

  // 4. Price
  if (prefs.pricePriority === 'high') {
    // User wants cheap: free → 20 pts, ₹60+/hr → 0 pts
    score += Math.max(0, 20 * (1 - parking.pricePerHour / 60));
  } else if (prefs.pricePriority === 'low') {
    // User is fine paying more for quality
    score += Math.min(20, parking.pricePerHour * 0.3);
  }

  // Hard max-price penalty
  if (prefs.preferredMaxPrice !== null && parking.pricePerHour > prefs.preferredMaxPrice) {
    score -= 25;
  }

  // 5. Covered preference (only penalize if user explicitly asked for covered)
  if (prefs.covered === true) {
    score += parking.covered ? 20 : -8;
  }

  // 6. EV charging preference
  if (prefs.evCharging === true) {
    score += parking.evCharging ? 20 : -8;
  }

  return score;
}

/**
 * Ranks all candidate parking spots by score (highest first).
 * The LLM does NOT participate in this step — fully deterministic.
 */
export function rankParkingSpots(
  candidates: ParkingSpot[],
  prefs: ParkingPreferences
): ParkingSpot[] {
  if (candidates.length === 0) return [];

  return [...candidates]
    .map((p) => ({ parking: p, score: scoreParking(p, prefs) }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.parking);
}

/**
 * Generates a deterministic (no LLM) explanation for the recommended parking.
 * Used as fallback when the AI service is unavailable.
 */
export function generateFallbackExplanation(
  prefs: ParkingPreferences,
  best: ParkingSpot
): string {
  const reasons: string[] = [];

  if (prefs.covered === true && best.covered) reasons.push('covered');
  if (prefs.evCharging === true && best.evCharging) reasons.push('has EV charging');
  if (prefs.pricePriority === 'high') {
    reasons.push(best.pricePerHour === 0 ? 'free to park' : `affordable at ₹${best.pricePerHour}/hr`);
  }
  if (prefs.maxWalkingMinutes !== null && best.walkingMinutes <= prefs.maxWalkingMinutes) {
    reasons.push(`within your ${prefs.maxWalkingMinutes}-minute walking limit`);
  }
  if (prefs.availabilityPriority === 'high') {
    reasons.push(`${best.availabilityPercentage}% estimated availability`);
  }

  if (reasons.length === 0) {
    return `${best.name} is the nearest available spot at ${best.distanceMeters} m, with ${best.availabilityPercentage}% estimated availability.`;
  }

  return `${best.name} is the best match — it is ${reasons.join(', ')} and ${best.distanceMeters} m away.`;
}
