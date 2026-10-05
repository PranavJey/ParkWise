import { useState, useMemo, useCallback } from 'react';
import type { ParkingWithDistance, FilterOption } from '@/types';
import { FALLBACK_PARKINGS } from '@/data/parking';

export function useParkingDiscovery(initialParkings: ParkingWithDistance[] = FALLBACK_PARKINGS) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [selectedParkingId, setSelectedParkingId] = useState<string>(initialParkings[0]?.id ?? '');

  // Real-time filtered parking locations
  const filteredParkings = useMemo(() => {
    return initialParkings.filter((parking: ParkingWithDistance) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        parking.name.toLowerCase().includes(query) ||
        parking.address.toLowerCase().includes(query) ||
        parking.tagline.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'high_availability':
          return parking.availability >= 70;
        case 'ev_charging':
          return parking.amenities.includes('ev_charging');
        case 'covered':
          return parking.amenities.includes('covered');
        case 'budget':
          return parking.price <= 30;
        case 'all':
        default:
          return true;
      }
    });
  }, [initialParkings, searchQuery, activeFilter]);

  // Selected parking object
  const selectedParking = useMemo(() => {
    return (
      filteredParkings.find((p: ParkingWithDistance) => p.id === selectedParkingId) ||
      filteredParkings[0] ||
      null
    );
  }, [filteredParkings, selectedParkingId]);

  const selectParking = useCallback((parking: ParkingWithDistance) => {
    setSelectedParkingId(parking.id);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedParkingId,
    selectedParking,
    selectParking,
    filteredParkings,
    resetFilters,
  };
}
