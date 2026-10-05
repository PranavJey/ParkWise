import { useState, useMemo, useCallback } from 'react';
import type { ParkingLocation, FilterOption } from '@/types';
import { MOCK_PARKING_LOCATIONS } from '@/data/mockParking';

export function useParkingDiscovery() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [selectedParkingId, setSelectedParkingId] = useState<string>(MOCK_PARKING_LOCATIONS[0].id);

  // Real-time filtered parking locations
  const filteredParkings = useMemo(() => {
    return MOCK_PARKING_LOCATIONS.filter((parking) => {
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
  }, [searchQuery, activeFilter]);

  // Selected parking object
  const selectedParking = useMemo(() => {
    return (
      filteredParkings.find((p) => p.id === selectedParkingId) ||
      filteredParkings[0] ||
      null
    );
  }, [filteredParkings, selectedParkingId]);

  const selectParking = useCallback((parking: ParkingLocation) => {
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
