export type AvailabilityStatus = 'high' | 'medium' | 'low';

export type Amenity =
  | 'ev_charging'
  | 'covered'
  | 'cctv'
  | 'handicap'
  | 'valet'
  | '24_7';

export type ParkingType = 'covered' | 'open' | 'multilevel' | 'underground';

export type ParkingSource =
  | 'demo'
  | 'open-data'
  | 'community'
  | 'sensor'
  | 'api';

/**
 * Normalized canonical ParkingSpot model.
 *
 * Designed to support both current prototype requirements and future
 * AI reasoning (availability, distance, walking time, pricing, facilities, provenance).
 */
export interface ParkingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  walkingMinutes: number;
  availabilityPercentage: number;
  availableSpaces: number;
  totalCapacity: number;
  pricePerHour: number;
  currency: string;
  covered: boolean;
  evCharging: boolean;
  address: string;
  lastUpdated: string;
  source: ParkingSource;

  // Additional structured metadata
  tagline: string;
  status: AvailabilityStatus;
  type: ParkingType;
  amenities: Amenity[];
  rating: number;
  reviewsCount: number;

  /**
   * Human-readable nearest landmark or area, derived from real geographic data.
   * For OSM spots: populated from OSM address/operator tags.
   * For demo spots: populated via Nominatim reverse geocoding of the spot's coordinates.
   * Never an invented or hardcoded name.
   */
  nearestLandmark?: string;

  // ── Backward-compatibility aliases for Phase 1 & 2 UI components ──────────
  distance: number;       // alias for distanceMeters
  walkingTime: number;    // alias for walkingMinutes
  availability: number;   // alias for availabilityPercentage
  availableSpots: number; // alias for availableSpaces
  totalSpots: number;     // alias for totalCapacity
  price: number;          // alias for pricePerHour
}

/** Base parking definition */
export type ParkingLocation = ParkingSpot;

/** Parking with computed distance & walking estimate from anchor location */
export type ParkingWithDistance = ParkingSpot;

export type FilterOption =
  | 'all'
  | 'high_availability'
  | 'ev_charging'
  | 'covered'
  | 'budget';

export type NavigationTab = 'map' | 'parking' | 'ai';

// ─── Location types ─────────────────────────────────────────────────────────

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export type LocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported';

export type LocationErrorKind =
  | 'permission_denied'
  | 'unavailable'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;       // metres
  timestamp: number;      // Date.now()
  isApproximate?: boolean;
}

export interface LocationState {
  status: LocationStatus;
  location: UserLocation | null;
  loading: boolean;
  error: LocationErrorKind | null;
  permissionState: LocationPermissionState;
}
