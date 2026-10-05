import type { ParkingSpot } from '@/types';
import type { ParkingProvider, GetNearbyParkingOptions } from './types';
import { PARKING_TEMPLATES } from '@/data/mockParking';
import {
  metresToLatDelta,
  metresToLonDelta,
  haversineDistance,
  estimateWalkingTime,
} from '@/lib/geo';

/**
 * Demo parking provider generating deterministic, simulated parking spots
 * anchored dynamically to any provided geographic coordinates.
 *
 * All spots are annotated with source: 'demo' and simulated timestamps.
 */
export class DemoParkingProvider implements ParkingProvider {
  readonly id = 'demo-provider';
  readonly name = 'Demo Simulated Parking Provider';

  async getNearbyParking(
    latitude: number,
    longitude: number,
    options?: GetNearbyParkingOptions
  ): Promise<ParkingSpot[]> {
    // Generate deterministic parking spots anchored to the provided coordinates
    const spots: ParkingSpot[] = PARKING_TEMPLATES.map((t) => {
      const spotLat = latitude + metresToLatDelta(t.latOffsetM);
      const spotLon = longitude + metresToLonDelta(t.lonOffsetM, latitude);

      const distanceMeters = Math.round(
        haversineDistance(latitude, longitude, spotLat, spotLon)
      );
      const walkingMinutes = estimateWalkingTime(distanceMeters);

      const hasCovered = t.amenities.includes('covered');
      const hasEv = t.amenities.includes('ev_charging');

      // Explicit simulated timestamp (~5 minutes ago for realistic freshness)
      const lastUpdated = new Date(Date.now() - 300_000).toISOString();

      const spot: ParkingSpot = {
        id: t.id,
        name: t.name,
        latitude: spotLat,
        longitude: spotLon,
        distanceMeters,
        walkingMinutes,
        availabilityPercentage: t.availability,
        availableSpaces: t.availableSpots,
        totalCapacity: t.totalSpots,
        pricePerHour: t.price,
        currency: 'INR',
        covered: hasCovered,
        evCharging: hasEv,
        address: t.address,
        lastUpdated,
        source: 'demo',

        // UI & structured fields
        tagline: t.tagline,
        status: t.status,
        type: t.type,
        amenities: t.amenities,
        rating: t.rating,
        reviewsCount: t.reviewsCount,

        // Backward compatibility aliases
        distance: distanceMeters,
        walkingTime: walkingMinutes,
        availability: t.availability,
        availableSpots: t.availableSpots,
        totalSpots: t.totalSpots,
        price: t.price,
      };

      return spot;
    });

    let result = spots;
    if (options?.radiusMeters && options.radiusMeters > 0) {
      result = result.filter((s) => s.distanceMeters <= options.radiusMeters!);
    }

    if (options?.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    return result;
  }
}

export const demoParkingProvider = new DemoParkingProvider();
