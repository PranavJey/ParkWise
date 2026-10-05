import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ParkingSpot, UserLocation } from '@/types';
import { parkingService, DEFAULT_DEMO_COORDINATES } from '@/services/parking';
import { haversineDistance } from '@/lib/geo';

export interface UseParkingDiscoveryOptions {
  userLocation: UserLocation | null;
  locationLoading?: boolean;
  radiusMeters?: number;
}

export interface UseParkingDiscoveryReturn {
  /** All retrieved parking spots from the service */
  parkingSpots: ParkingSpot[];
  /** Filtered parking spots based on search query and active filter */
  filteredParkings: ParkingSpot[];
  /** Whether parking spots are currently being fetched */
  loading: boolean;
  /** Error message if provider failed */
  error: string | null;
  /** Manually trigger a fresh fetch from the parking service */
  refresh: () => Promise<void>;
  /** Search text input */
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  /** Active filter pill id */
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  /** Currently selected parking spot id */
  selectedParkingId: string;
  /** Currently selected parking spot entity */
  selectedParking: ParkingSpot | null;
  /** Select a parking spot */
  selectParking: (parking: ParkingSpot) => void;
  /** Reset search and filters */
  resetFilters: () => void;
}

const SIGNIFICANT_LOCATION_DELTA_METERS = 20;

/**
 * High-level hook managing parking discovery, service communication,
 * location changes, client-side filtering, and selection state.
 */
export function useParkingDiscovery(
  options: UseParkingDiscoveryOptions
): UseParkingDiscoveryReturn {
  const { userLocation, locationLoading = false, radiusMeters = 5000 } = options;

  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedParkingId, setSelectedParkingId] = useState<string>('pk-1');

  // Track coordinates and authenticity of the last successful fetch
  const lastFetchedCoordsRef = useRef<{ lat: number; lon: number; isReal: boolean } | null>(null);
  const activeReqIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine current active anchor coordinates
  const currentAnchor = useMemo(() => {
    if (userLocation) {
      return {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
        isReal: true,
      };
    }
    return {
      lat: DEFAULT_DEMO_COORDINATES.latitude,
      lon: DEFAULT_DEMO_COORDINATES.longitude,
      isReal: false,
    };
  }, [userLocation]);

  const fetchParking = useCallback(
    async (force = false) => {
      // Do not fetch default demo coordinates while browser geolocation is still resolving!
      if (!currentAnchor.isReal && locationLoading) {
        setLoading(true);
        return;
      }

      const { lat, lon, isReal } = currentAnchor;

      // Skip redundant fetch only if position hasn't moved significantly
      // AND we haven't transitioned between demo coordinates and real coordinates.
      const wasPreviousReal = lastFetchedCoordsRef.current?.isReal ?? false;
      if (!force && lastFetchedCoordsRef.current && wasPreviousReal === isReal) {
        const deltaM = haversineDistance(
          lastFetchedCoordsRef.current.lat,
          lastFetchedCoordsRef.current.lon,
          lat,
          lon
        );
        if (deltaM < SIGNIFICANT_LOCATION_DELTA_METERS) {
          return;
        }
      }

      // Abort any ongoing stale fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const reqId = ++activeReqIdRef.current;
      setLoading(true);
      setError(null);

      if (import.meta.env.DEV) {
        console.log(
          `[useParkingDiscovery] Fetching parking for ${isReal ? 'REAL' : 'DEMO'} coordinates: (${lat}, ${lon}) [req #${reqId}]`
        );
      }

      try {
        const spots = await parkingService.getNearbyParking(lat, lon, {
          radiusMeters,
          signal: controller.signal,
        });

        // Discard result if superseded by a newer request or aborted
        if (reqId !== activeReqIdRef.current || controller.signal.aborted) {
          return;
        }

        setParkingSpots(spots);
        lastFetchedCoordsRef.current = { lat, lon, isReal };

        if (import.meta.env.DEV) {
          console.log(
            `[useParkingDiscovery] Received ${spots.length} spots for (${lat}, ${lon}). First spot: "${spots[0]?.name}" at (${spots[0]?.latitude}, ${spots[0]?.longitude})`
          );
        }

        // Ensure a selected spot is preserved or reset to first
        setSelectedParkingId((currentId) => {
          if (spots.some((s) => s.id === currentId)) {
            return currentId;
          }
          return spots[0]?.id ?? '';
        });
      } catch (err: unknown) {
        if (controller.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        if (reqId !== activeReqIdRef.current) {
          return;
        }

        const msg = err instanceof Error ? err.message : 'Failed to fetch parking locations';
        setError(msg);
      } finally {
        if (reqId === activeReqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [currentAnchor, locationLoading, radiusMeters]
  );

  // Fetch when anchor coordinates change meaningfully
  useEffect(() => {
    fetchParking(false);
  }, [fetchParking]);

  // Clean manual refresh
  const refresh = useCallback(async () => {
    await fetchParking(true);
  }, [fetchParking]);

  // Real-time filtered parking locations
  const filteredParkings = useMemo(() => {
    return parkingSpots.filter((parking) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        parking.name.toLowerCase().includes(query) ||
        parking.address.toLowerCase().includes(query) ||
        parking.tagline.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'high_availability':
          return parking.availabilityPercentage >= 70;
        case 'ev_charging':
          return parking.evCharging;
        case 'covered':
          return parking.covered;
        case 'budget':
          return parking.pricePerHour <= 25;
        case 'all':
        default:
          return true;
      }
    });
  }, [parkingSpots, searchQuery, activeFilter]);

  // Currently selected parking spot
  const selectedParking = useMemo(() => {
    return (
      filteredParkings.find((p) => p.id === selectedParkingId) ||
      filteredParkings[0] ||
      null
    );
  }, [filteredParkings, selectedParkingId]);

  const selectParking = useCallback((parking: ParkingSpot) => {
    setSelectedParkingId(parking.id);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  return {
    parkingSpots,
    filteredParkings,
    loading,
    error,
    refresh,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedParkingId,
    selectedParking,
    selectParking,
    resetFilters,
  };
}
