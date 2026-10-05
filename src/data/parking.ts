import type { ParkingLocation, ParkingWithDistance } from '@/types';
import { PARKING_TEMPLATES } from './mockParking';
import {
  metresToLatDelta,
  metresToLonDelta,
  haversineDistance,
  estimateWalkingTime,
} from '@/lib/geo';

/**
 * Default coordinates for development demo mode when geolocation is
 * unavailable or permission is denied.
 */
export const DEFAULT_DEMO_COORDINATES = {
  latitude: 12.9716,
  longitude: 77.5946,
};

/**
 * Builds the mock parking dataset anchored to the user's real coordinates.
 *
 * Each parking location is placed at a fixed offset (metres) from the
 * supplied position, then has its distance and walking time computed.
 *
 * This function is pure — call it whenever the user's location updates.
 */
export function buildMockParkings(
  userLat: number,
  userLon: number,
): ParkingWithDistance[] {
  return PARKING_TEMPLATES.map((t) => {
    const latitude = userLat + metresToLatDelta(t.latOffsetM);
    const longitude = userLon + metresToLonDelta(t.lonOffsetM, userLat);

    const distance = haversineDistance(userLat, userLon, latitude, longitude);
    const walkingTime = estimateWalkingTime(distance);

    const base: ParkingLocation = {
      id: t.id,
      name: t.name,
      tagline: t.tagline,
      availability: t.availability,
      status: t.status,
      price: t.price,
      latitude,
      longitude,
      address: t.address,
      totalSpots: t.totalSpots,
      availableSpots: t.availableSpots,
      type: t.type,
      amenities: t.amenities,
      rating: t.rating,
      reviewsCount: t.reviewsCount,
    };

    return { ...base, distance, walkingTime };
  });
}

/**
 * Fallback dataset when the user's location is unavailable.
 *
 * Uses the default demo coordinates for realistic street-grid display in demo mode.
 */
export const FALLBACK_PARKINGS: ParkingWithDistance[] = buildMockParkings(
  DEFAULT_DEMO_COORDINATES.latitude,
  DEFAULT_DEMO_COORDINATES.longitude,
);
