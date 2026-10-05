import type { ParkingLocation, FilterOption } from '@/types';

/**
 * MOCK PARKING DATA — Phase 2
 *
 * Parking locations are defined as geographic offsets (metres) from the
 * user's current position. This ensures the prototype works regardless of
 * where the tester runs it.
 *
 * ⚠  These are SIMULATED locations for development/demo purposes only.
 *    They do NOT represent real parking facilities.
 *
 * Actual coordinates are computed at runtime via buildMockParkings()
 * in src/data/parking.ts using the user's real geolocation.
 */

export interface ParkingTemplate
  extends Omit<ParkingLocation, 'latitude' | 'longitude'> {
  /** Offset from user in metres (positive = north/east) */
  latOffsetM: number;
  lonOffsetM: number;
}

export const PARKING_TEMPLATES: ParkingTemplate[] = [
  {
    id: 'pk-1',
    name: 'Central Parking',
    tagline: 'Multi-level covered — 4 floors',
    availability: 82,
    status: 'high',
    price: 30,
    address: 'Demo Area — Simulated location',
    totalSpots: 240,
    availableSpots: 196,
    type: 'multilevel',
    amenities: ['covered', 'ev_charging', 'cctv', 'handicap', '24_7'],
    rating: 4.8,
    reviewsCount: 312,
    latOffsetM: 200,
    lonOffsetM: -150,
  },
  {
    id: 'pk-2',
    name: 'City Mall Parking',
    tagline: 'Underground retail basement',
    availability: 54,
    status: 'medium',
    price: 20,
    address: 'Demo Area — Simulated location',
    totalSpots: 180,
    availableSpots: 97,
    type: 'underground',
    amenities: ['covered', 'cctv', 'handicap', 'valet'],
    rating: 4.5,
    reviewsCount: 184,
    latOffsetM: 380,
    lonOffsetM: 200,
  },
  {
    id: 'pk-3',
    name: 'Metro Parking',
    tagline: 'Transit interchange smart lot',
    availability: 24,
    status: 'low',
    price: 40,
    address: 'Demo Area — Simulated location',
    totalSpots: 120,
    availableSpots: 28,
    type: 'open',
    amenities: ['cctv', '24_7', 'handicap'],
    rating: 4.1,
    reviewsCount: 95,
    latOffsetM: -250,
    lonOffsetM: 300,
  },
  {
    id: 'pk-4',
    name: 'Grand Plaza Garage',
    tagline: 'Automated barrier + EV fast chargers',
    availability: 91,
    status: 'high',
    price: 35,
    address: 'Demo Area — Simulated location',
    totalSpots: 310,
    availableSpots: 282,
    type: 'multilevel',
    amenities: ['covered', 'ev_charging', 'cctv', 'valet', '24_7', 'handicap'],
    rating: 4.9,
    reviewsCount: 420,
    latOffsetM: -100,
    lonOffsetM: -320,
  },
  {
    id: 'pk-5',
    name: 'Tech Park Avenue',
    tagline: 'Solar canopy surface lot',
    availability: 68,
    status: 'medium',
    price: 25,
    address: 'Demo Area — Simulated location',
    totalSpots: 200,
    availableSpots: 136,
    type: 'covered',
    amenities: ['ev_charging', 'cctv', '24_7'],
    rating: 4.4,
    reviewsCount: 160,
    latOffsetM: 500,
    lonOffsetM: -80,
  },
  {
    id: 'pk-6',
    name: 'Heritage Station Hub',
    tagline: 'Economy ground parking',
    availability: 15,
    status: 'low',
    price: 15,
    address: 'Demo Area — Simulated location',
    totalSpots: 90,
    availableSpots: 14,
    type: 'open',
    amenities: ['cctv'],
    rating: 3.9,
    reviewsCount: 88,
    latOffsetM: -420,
    lonOffsetM: 160,
  },
];

export const FILTER_OPTIONS: { id: FilterOption; label: string }[] = [
  { id: 'all',               label: 'All spots' },
  { id: 'high_availability', label: 'High availability (>70%)' },
  { id: 'ev_charging',       label: '⚡ EV Charging' },
  { id: 'covered',           label: '☂ Covered' },
  { id: 'budget',            label: '🏷 Under ₹30/hr' },
];

export const AI_QUICK_PROMPTS = [
  'Best spot with EV charging',
  'Cheapest within 5 min walk',
  'Most available spot right now',
  'Covered parking with wide bays',
];
