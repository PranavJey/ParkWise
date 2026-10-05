export type AvailabilityStatus = 'high' | 'medium' | 'low';

export type Amenity =
  | 'ev_charging'
  | 'covered'
  | 'cctv'
  | 'handicap'
  | 'valet'
  | '24_7';

export type ParkingType = 'covered' | 'open' | 'multilevel' | 'underground';

export interface ParkingLocation {
  id: string;
  name: string;
  tagline: string;
  availability: number; // 0 to 100 percentage
  status: AvailabilityStatus;
  distance: number; // in meters
  price: number; // in INR (₹/hr)
  walkingTime: number; // in minutes
  latitude: number;
  longitude: number;
  address: string;
  totalSpots: number;
  availableSpots: number;
  type: ParkingType;
  amenities: Amenity[];
  rating: number;
  reviewsCount: number;
  mapCoords: {
    x: number; // percentage X position on placeholder map (0-100)
    y: number; // percentage Y position on placeholder map (0-100)
  };
}

export type FilterOption =
  | 'all'
  | 'high_availability'
  | 'ev_charging'
  | 'covered'
  | 'budget';

export type NavigationTab = 'map' | 'parking' | 'ai';
