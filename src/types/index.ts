export type AvailabilityStatus = 'high' | 'medium' | 'low';

export type Amenity =
  | 'ev_charging'
  | 'covered'
  | 'cctv'
  | 'handicap'
  | 'valet'
  | '24_7';

export type ParkingType = 'covered' | 'open' | 'multilevel' | 'underground';

/** Base parking definition — coordinates are real geo coordinates */
export interface ParkingLocation {
  id: string;
  name: string;
  tagline: string;
  availability: number;     // 0-100 percentage
  status: AvailabilityStatus;
  price: number;            // ₹/hr
  latitude: number;
  longitude: number;
  address: string;
  totalSpots: number;
  availableSpots: number;
  type: ParkingType;
  amenities: Amenity[];
  rating: number;
  reviewsCount: number;
}

/** Parking with computed distance & walking estimate from user location */
export interface ParkingWithDistance extends ParkingLocation {
  distance: number;       // metres, calculated from user position
  walkingTime: number;    // estimated minutes at 80 m/min walking pace
}

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
