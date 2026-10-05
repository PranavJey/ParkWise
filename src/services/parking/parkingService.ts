import type { ParkingSpot } from '@/types';
import type { ParkingProvider, GetNearbyParkingOptions } from './types';
import { ParkingServiceError } from './types';
import { demoParkingProvider } from './demoProvider';
import { openStreetMapParkingProvider } from './osmProvider';

export interface ParkingServiceConfig {
  defaultRadiusMeters?: number;
  provider?: ParkingProvider;
  fallbackProvider?: ParkingProvider;
}

/**
 * Core ParkingService orchestrator with mandatory, transparent failover.
 *
 * Sits between the UI layer and the underlying data providers.
 * Validates coordinates, attempts real open-data discovery (OpenStreetMap/Overpass),
 * and automatically falls back to DemoParkingProvider on failure, timeout, or empty results.
 */
export class ParkingService {
  private primaryProvider: ParkingProvider;
  private fallbackProvider: ParkingProvider;
  private defaultRadiusMeters: number;

  constructor(config?: ParkingServiceConfig) {
    this.primaryProvider = config?.provider ?? openStreetMapParkingProvider;
    this.fallbackProvider = config?.fallbackProvider ?? demoParkingProvider;
    this.defaultRadiusMeters = config?.defaultRadiusMeters ?? 4000;
  }

  /**
   * Sets or switches the primary data provider.
   */
  setProvider(provider: ParkingProvider): void {
    if (!provider) {
      throw new Error('A valid ParkingProvider must be supplied.');
    }
    this.primaryProvider = provider;
  }

  /**
   * Returns the currently active primary provider instance.
   */
  getProvider(): ParkingProvider {
    return this.primaryProvider;
  }

  /**
   * Validates geographic coordinates.
   */
  private validateCoordinates(lat: number, lon: number): boolean {
    if (typeof lat !== 'number' || typeof lon !== 'number') return false;
    if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
    if (lat < -90 || lat > 90) return false;
    if (lon < -180 || lon > 180) return false;
    return true;
  }

  /**
   * Retrieves nearby parking spots around the target coordinates.
   *
   * Flow:
   * 1. Validate coordinates.
   * 2. Attempt primary provider (OpenStreetMap).
   * 3. If primary succeeds with > 0 spots, return real OSM spots.
   * 4. If primary fails (network error, timeout, HTTP error) OR returns 0 spots,
   *    seamlessly fall back to fallbackProvider (DemoParkingProvider).
   */
  async getNearbyParking(
    latitude: number,
    longitude: number,
    options?: GetNearbyParkingOptions
  ): Promise<ParkingSpot[]> {
    if (!this.validateCoordinates(latitude, longitude)) {
      throw new ParkingServiceError(
        'INVALID_COORDINATES',
        `Invalid coordinates supplied to ParkingService: (${latitude}, ${longitude})`
      );
    }

    const radiusMeters = options?.radiusMeters ?? this.defaultRadiusMeters;

    // Step 1: Attempt Primary Provider (OpenStreetMap)
    try {
      const spots = await this.primaryProvider.getNearbyParking(latitude, longitude, {
        ...options,
        radiusMeters,
      });

      if (Array.isArray(spots) && spots.length > 0) {
        // Return valid real open data
        return spots.filter((spot) => {
          return (
            spot &&
            typeof spot.id === 'string' &&
            typeof spot.name === 'string' &&
            typeof spot.latitude === 'number' &&
            typeof spot.longitude === 'number'
          );
        });
      }

      if (import.meta.env.DEV) {
        console.warn(
          `[ParkingService] Primary provider '${this.primaryProvider.name}' returned 0 spots. Triggering fallback to '${this.fallbackProvider.name}'.`
        );
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn(
          `[ParkingService] Primary provider '${this.primaryProvider.name}' failed. Triggering fallback to '${this.fallbackProvider.name}'. Error:`,
          err
        );
      }
    }

    // Step 2: Mandatory Fallback (Requirements 10 & 12)
    try {
      const fallbackSpots = await this.fallbackProvider.getNearbyParking(latitude, longitude, {
        ...options,
        radiusMeters,
      });

      return Array.isArray(fallbackSpots) ? fallbackSpots : [];
    } catch (fallbackErr) {
      throw new ParkingServiceError(
        'PROVIDER_ERROR',
        `Both primary and fallback parking providers failed: ${
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
        }`,
        fallbackErr
      );
    }
  }
}

/**
 * Shared singleton instance for the application.
 */
export const parkingService = new ParkingService();
