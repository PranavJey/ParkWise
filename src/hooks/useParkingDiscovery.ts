import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ParkingSpot, UserLocation } from '@/types';
import { parkingService } from '@/services/parking';
import { DEFAULT_DEMO_COORDINATES } from '@/data/parking';
import { haversineDistance } from '@/lib/geo';

export interface UseParkingDiscoveryOptions {
  userLocation: UserLocation | null;
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
  const { userLocation, radiusMeters = 5000 } = options;

  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedParkingId, setSelectedParkingId] = useState<string>('pk-1');

  // Track coordinates of the last successful fetch to avoid thrashing
  const lastFetchedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const isFetchingRef = useRef(false);

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
      const { lat, lon } = currentAnchor;

      // Skip redundant fetch if position hasn't moved significantly
      if (!force && lastFetchedCoordsRef.current) {
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

      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const spots = await parkingService.getNearbyParking(lat, lon, {
          radiusMeters,
        });
        setParkingSpots(spots);
        lastFetchedCoordsRef.current = { lat, lon };

        // Ensure a selected spot is preserved or reset to first
        setSelectedParkingId((currentId) => {
          if (spots.some((s) => s.id === currentId)) {
            return currentId;
          }
          return spots[0]?.id ?? '';
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch parking locations';
        setError(msg);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [currentAnchor, radiusMeters]
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
