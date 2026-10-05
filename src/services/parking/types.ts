import type { ParkingSpot, FilterOption } from '@/types';

export const FILTER_OPTIONS: { id: FilterOption; label: string }[] = [
  { id: 'all', label: 'All spots' },
  { id: 'high_availability', label: 'High availability (>70%)' },
  { id: 'ev_charging', label: '⚡ EV Charging' },
  { id: 'covered', label: '☂ Covered' },
  { id: 'budget', label: '🏷 Under ₹25/hr' },
];

export interface GetNearbyParkingOptions {
  radiusMeters?: number;
  limit?: number;
  signal?: AbortSignal;
}

/**
 * Standard contract for parking data providers.
 *
 * Implementations can range from simulated demo generators
 * to real open-data portals (e.g. GBFS, MDS, OpenParkingData, municipality APIs).
 */
export interface ParkingProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Fetches parking locations distributed around the given anchor coordinates.
   */
  getNearbyParking(
    latitude: number,
    longitude: number,
    options?: GetNearbyParkingOptions
  ): Promise<ParkingSpot[]>;
}

export type ParkingServiceErrorCode =
  | 'INVALID_COORDINATES'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT'
  | 'ABORTED';

export class ParkingServiceError extends Error {
  readonly code: ParkingServiceErrorCode;
  readonly cause?: unknown;

  constructor(code: ParkingServiceErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ParkingServiceError';
    this.code = code;
    this.cause = cause;
  }
}
