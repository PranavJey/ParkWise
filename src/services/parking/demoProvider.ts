import type { ParkingSpot } from '@/types';
import type { ParkingProvider, GetNearbyParkingOptions } from './types';
import { PARKING_TEMPLATES } from '@/data/mockParking';
import {
  metresToLatDelta,
  metresToLonDelta,
  haversineDistance,
  estimateWalkingTime,
} from '@/lib/geo';
import { getNearestArea } from '@/services/geocoding/nominatimService';

/**
 * Demo parking provider generating deterministic, simulated parking spots
 * anchored dynamically to any provided geographic coordinates.
 *
 * - Names are generated as "Parking 1", "Parking 2", etc. — never city-specific.
 * - nearestLandmark is resolved via Nominatim reverse geocoding using the
 *   user's actual coordinates, so "Near Tambaram" or "Near Anna Nagar" appears
 *   automatically for wherever the user actually is.
 * - All spots are annotated with source: 'demo' and simulated timestamps.
 */
export class DemoParkingProvider implements ParkingProvider {
  readonly id = 'demo-provider';
  readonly name = 'Demo Simulated Parking Provider';

  async getNearbyParking(
    latitude: number,
    longitude: number,
    options?: GetNearbyParkingOptions
  ): Promise<ParkingSpot[]> {
    // Resolve the area name for the user's location via Nominatim.
    // This is ONE network request for the whole batch (result is cached).
    // We don't await here yet — we'll use it below if it resolves quickly.
    const areaPromise = getNearestArea(latitude, longitude, options?.signal).catch(() => null);

    const lastUpdated = new Date(Date.now() - 300_000).toISOString();

    const spots: ParkingSpot[] = PARKING_TEMPLATES.map((t) => {
      const spotLat = latitude + metresToLatDelta(t.latOffsetM);
      const spotLon = longitude + metresToLonDelta(t.lonOffsetM, latitude);

      const distanceMeters = Math.round(
        haversineDistance(latitude, longitude, spotLat, spotLon)
      );
      const walkingMinutes = estimateWalkingTime(distanceMeters);

      const hasCovered = t.amenities.includes('covered');
      const hasEv = t.amenities.includes('ev_charging');

      const spot: ParkingSpot = {
        id: t.id,
        // Name is set to a placeholder — overwritten with "Parking N" after filtering
        name: t.id,
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
        address: 'Demo area · simulated location',
        lastUpdated,
        source: 'demo',

        tagline: t.tagline,
        status: t.status,
        type: t.type,
        amenities: t.amenities,
        rating: t.rating,
        reviewsCount: t.reviewsCount,

        // nearestLandmark is populated after the Nominatim call resolves (below)
        nearestLandmark: undefined,

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

    // Apply radius and limit filters
    let result = spots;
    if (options?.radiusMeters && options.radiusMeters > 0) {
      result = result.filter((s) => s.distanceMeters <= options.radiusMeters!);
    }
    if (options?.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    // Assign sequential names AFTER filtering so numbers are 1..N with no gaps
    result.forEach((spot, index) => {
      spot.name = `Parking ${index + 1}`;
    });

    // Await the Nominatim area name and populate nearestLandmark on all spots
    const area = await areaPromise;
    if (area) {
      result.forEach((spot) => {
        spot.nearestLandmark = `Near ${area}`;
      });
    }

    return result;
  }
}

export const demoParkingProvider = new DemoParkingProvider();
