import type { ParkingSpot, AvailabilityStatus, ParkingType, Amenity } from '@/types';
import type { ParkingProvider, GetNearbyParkingOptions } from './types';
import { haversineDistance, estimateWalkingTime } from '@/lib/geo';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const DEFAULT_TIMEOUT_MS = 9_000;

/**
 * OpenStreetMap parking provider using the public Overpass API.
 * Retrieves real-world parking nodes and ways around the user's coordinates.
 */
export class OpenStreetMapParkingProvider implements ParkingProvider {
  readonly id = 'openstreetmap-provider';
  readonly name = 'OpenStreetMap (Overpass API)';

  private endpoints: string[];

  constructor(endpoints: string[] = OVERPASS_ENDPOINTS) {
    this.endpoints = endpoints;
  }

  async getNearbyParking(
    latitude: number,
    longitude: number,
    options?: GetNearbyParkingOptions
  ): Promise<ParkingSpot[]> {
    const radius = Math.min(options?.radiusMeters ?? 4000, 6000);
    const limit = options?.limit ?? 30;

    // Overpass QL query: queries nodes and ways with amenity=parking within radius
    const query = `[out:json][timeout:8];(node[amenity=parking](around:${radius},${latitude},${longitude});way[amenity=parking](around:${radius},${latitude},${longitude}););out center ${limit};`;

    if (import.meta.env.DEV) {
      console.log(
        `[OpenStreetMapParkingProvider] Overpass query center: (${latitude}, ${longitude}), radius: ${radius}m`
      );
    }

    let lastError: unknown = null;

    // Try endpoints with fallback
    for (const endpoint of this.endpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      // Connect caller's signal if supplied
      if (options?.signal) {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Overpass HTTP ${response.status}: ${response.statusText}`);
        }

        const data: OverpassResponse = await response.json();
        if (!data || !Array.isArray(data.elements) || data.elements.length === 0) {
          if (import.meta.env.DEV) {
            console.log(
              `[OpenStreetMapParkingProvider] Overpass returned 0 elements for center: (${latitude}, ${longitude})`
            );
          }
          // Empty or invalid result
          return [];
        }

        const spots = this.normalizeElements(data.elements, latitude, longitude);
        if (import.meta.env.DEV) {
          console.log(
            `[OpenStreetMapParkingProvider] Received ${data.elements.length} raw OSM elements, normalized to ${spots.length} spots for center (${latitude}, ${longitude}).`
          );
          if (spots.length > 0) {
            console.log(
              `[OpenStreetMapParkingProvider] First returned spot: "${spots[0].name}" at (${spots[0].latitude}, ${spots[0].longitude}), distance: ${spots[0].distanceMeters}m`
            );
          }
        }

        return spots;
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        if (import.meta.env.DEV) {
          console.warn(`[OpenStreetMapParkingProvider] Endpoint ${endpoint} failed:`, err);
        }
        // Try next endpoint in list
      }
    }

    throw lastError || new Error('All Overpass endpoints failed');
  }

  /**
   * Normalizes raw OSM elements into canonical ParkingSpot models.
   */
  private normalizeElements(
    elements: OverpassElement[],
    userLat: number,
    userLon: number
  ): ParkingSpot[] {
    const spots: ParkingSpot[] = [];

    for (const el of elements) {
      const lat = el.center?.lat ?? el.lat;
      const lon = el.center?.lon ?? el.lon;

      if (typeof lat !== 'number' || typeof lon !== 'number') {
        continue;
      }

      const tags = el.tags || {};

      // Name normalization
      const rawName = tags.name || tags['name:en'] || tags.operator || tags.description;
      let name: string;
      if (rawName && rawName.trim().length > 0) {
        name = rawName.trim();
      } else if (tags.parking === 'underground') {
        name = 'Underground Parking';
      } else if (tags.parking === 'multi-storey') {
        name = 'Multi-Level Parking';
      } else if (tags.parking === 'surface') {
        name = 'Surface Parking Lot';
      } else {
        name = 'Parking Area';
      }

      // Parking Type
      let parkingType: ParkingType = 'open';
      if (tags.parking === 'underground') {
        parkingType = 'underground';
      } else if (tags.parking === 'multi-storey') {
        parkingType = 'multilevel';
      } else if (tags.covered === 'yes' || tags.parking === 'sheds' || tags.parking === 'carports') {
        parkingType = 'covered';
      }

      // Covered & EV attributes
      const isCovered =
        tags.covered === 'yes' ||
        tags.parking === 'underground' ||
        tags.parking === 'multi-storey';

      const hasEvCharging =
        tags['socket:type2'] !== undefined ||
        tags.charging_station !== undefined ||
        tags['capacity:charging'] !== undefined ||
        tags.amenity === 'charging_station';

      // Capacity estimation
      let totalCapacity = 80;
      if (tags.capacity && !Number.isNaN(parseInt(tags.capacity, 10))) {
        totalCapacity = Math.max(5, parseInt(tags.capacity, 10));
      } else if (parkingType === 'multilevel') {
        totalCapacity = 240;
      } else if (parkingType === 'underground') {
        totalCapacity = 160;
      }

      // Deterministic estimated availability based on element ID
      // (OpenStreetMap does not provide real-time occupancy)
      const seed = Math.abs(el.id % 60) + 25; // 25% - 84%
      const availabilityPercentage = seed;
      let status: AvailabilityStatus = 'medium';
      if (seed >= 70) {
        status = 'high';
      } else if (seed < 35) {
        status = 'low';
      }

      const availableSpaces = Math.max(1, Math.round((totalCapacity * availabilityPercentage) / 100));

      // Pricing estimation
      let pricePerHour = 20;
      if (tags.fee === 'no') {
        pricePerHour = 0;
      } else if (tags.fee === 'yes') {
        pricePerHour = 30;
      }

      // Amenities list
      const amenities: Amenity[] = [];
      if (isCovered) amenities.push('covered');
      if (hasEvCharging) amenities.push('ev_charging');
      if (tags.wheelchair === 'yes') amenities.push('handicap');
      if (tags.opening_hours === '24/7') amenities.push('24_7');
      if (tags.surveillance === 'yes' || tags.camera === 'yes') amenities.push('cctv');
      if (tags.valet === 'yes') amenities.push('valet');

      // Distance and walking estimates
      const distanceMeters = Math.round(haversineDistance(userLat, userLon, lat, lon));
      const walkingMinutes = estimateWalkingTime(distanceMeters);

      // Address construction
      let address = 'OpenStreetMap verified location';
      if (tags['addr:street']) {
        address = tags['addr:housenumber']
          ? `${tags['addr:housenumber']} ${tags['addr:street']}`
          : tags['addr:street'];
      } else if (tags.operator) {
        address = `Operated by ${tags.operator}`;
      } else if (tags.access && tags.access !== 'yes') {
        address = `Access: ${tags.access}`;
      }

      // Tagline
      let tagline = 'OpenStreetMap parking';
      if (tags.operator) {
        tagline = `Operated by ${tags.operator}`;
      } else if (parkingType === 'underground') {
        tagline = 'Underground parking facility';
      } else if (parkingType === 'multilevel') {
        tagline = 'Multi-storey parking structure';
      } else if (tags.access) {
        tagline = `${tags.access.charAt(0).toUpperCase() + tags.access.slice(1)} parking`;
      }

      // Nearest landmark — derived from OSM address tags where available.
      // Prefer fine-grained locality names; fall back to operator or city.
      const nearestLandmark: string | undefined = (() => {
        const area =
          tags['addr:suburb'] ||
          tags['addr:neighbourhood'] ||
          tags['addr:city_district'] ||
          tags['addr:quarter'] ||
          tags['addr:village'] ||
          tags['addr:town'] ||
          tags['addr:city'];
        if (area) return `Near ${area}`;
        if (tags.operator) return `Near ${tags.operator}`;
        return undefined;
      })();

      const deterministicRating = Number((4.0 + (Math.abs(el.id % 9) * 0.1)).toFixed(1));
      const deterministicReviews = 20 + Math.abs(el.id % 180);

      spots.push({
        id: `osm-${el.type}-${el.id}`,
        name,
        latitude: lat,
        longitude: lon,
        distanceMeters,
        walkingMinutes,
        availabilityPercentage,
        availableSpaces,
        totalCapacity,
        pricePerHour,
        currency: 'INR',
        covered: isCovered,
        evCharging: hasEvCharging,
        address,
        lastUpdated: new Date().toISOString(),
        source: 'open-data',

        tagline,
        status,
        type: parkingType,
        amenities,
        rating: deterministicRating,
        reviewsCount: deterministicReviews,
        nearestLandmark,

        // UI aliases
        distance: distanceMeters,
        walkingTime: walkingMinutes,
        availability: availabilityPercentage,
        availableSpots: availableSpaces,
        totalSpots: totalCapacity,
        price: pricePerHour,
      });
    }

    // Sort: Nearest parking first (Requirement 9)
    spots.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return spots;
  }
}

export const openStreetMapParkingProvider = new OpenStreetMapParkingProvider();
