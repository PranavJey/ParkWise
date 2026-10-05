import type { ParkingSpot } from '@/types';
import { PARKING_TEMPLATES } from './mockParking';
import {
  metresToLatDelta,
  metresToLonDelta,
  haversineDistance,
  estimateWalkingTime,
} from '@/lib/geo';

/**
 * Default coordinates for development demo mode when geolocation is
 * unavailable or permission is denied (Bengaluru City Center).
 */
export const DEFAULT_DEMO_COORDINATES = {
  latitude: 12.9716,
  longitude: 77.5946,
};

/**
 * Builds a synchronous parking dataset anchored to specific coordinates.
 *
 * Preserved for backwards compatibility with any synchronous utilities.
 * Primary application logic should consume parkingService.getNearbyParking()
 * via useParkingDiscovery().
 */
export function buildMockParkings(
  userLat: number,
  userLon: number
): ParkingSpot[] {
  const lastUpdated = new Date(Date.now() - 300_000).toISOString();

  return PARKING_TEMPLATES.map((t) => {
    const latitude = userLat + metresToLatDelta(t.latOffsetM);
    const longitude = userLon + metresToLonDelta(t.lonOffsetM, userLat);

    const distanceMeters = Math.round(
      haversineDistance(userLat, userLon, latitude, longitude)
    );
    const walkingMinutes = estimateWalkingTime(distanceMeters);

    return {
      id: t.id,
      name: t.name,
      latitude,
      longitude,
      distanceMeters,
      walkingMinutes,
      availabilityPercentage: t.availability,
      availableSpaces: t.availableSpots,
      totalCapacity: t.totalSpots,
      pricePerHour: t.price,
      currency: 'INR',
      covered: t.amenities.includes('covered'),
      evCharging: t.amenities.includes('ev_charging'),
      address: t.address,
      lastUpdated,
      source: 'demo' as const,

      tagline: t.tagline,
      status: t.status,
      type: t.type,
      amenities: t.amenities,
      rating: t.rating,
      reviewsCount: t.reviewsCount,

      // Aliases
      distance: distanceMeters,
      walkingTime: walkingMinutes,
      availability: t.availability,
      availableSpots: t.availableSpots,
      totalSpots: t.totalSpots,
      price: t.price,
    };
  });
}

/**
 * Fallback dataset when the user's location is unavailable.
 */
export const FALLBACK_PARKINGS: ParkingSpot[] = buildMockParkings(
  DEFAULT_DEMO_COORDINATES.latitude,
  DEFAULT_DEMO_COORDINATES.longitude
);
