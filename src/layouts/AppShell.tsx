import React, { useState, useRef } from 'react';
import type { ParkingSpot, NavigationTab } from '@/types';
import { FILTER_OPTIONS } from '@/services/parking';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useParkingDiscovery } from '@/hooks/useParkingDiscovery';
import { MapSurface, type MapSurfaceHandle } from '@/components/MapSurface';
import { ParkingRecommendationCard } from '@/components/ParkingRecommendationCard';
import { AIAction } from '@/components/AIAction';
import { BottomNav, SideNav } from '@/components/Navigation';
import { LocationPill } from '@/components/LocationPill';
import { SearchBar } from '@/components/SearchBar';
import { ParkingDetailModal } from '@/components/ParkingDetailModal';
import { AIModal } from '@/components/AIModal';
import { cn } from '@/lib/utils';
import { SlidersHorizontal } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('map');
  const [detailParking, setDetailParking] = useState<ParkingSpot | null>(null);
  const [aiOpen, setAIOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const mapSurfaceRef = useRef<MapSurfaceHandle>(null);

  // Live user location hook
  const {
    status: locationStatus,
    location,
    loading: locationLoading,
    error: locationError,
    retry: retryLocation,
  } = useUserLocation();

  // Phase 3: Data layer discovery hook powered by ParkingService
  const {
    filteredParkings: filtered,
    selectedParking: selected,
    selectParking,
    searchQuery: search,
    setSearchQuery: setSearch,
    activeFilter,
    setActiveFilter,
    resetFilters,
  } = useParkingDiscovery({
    userLocation: location,
  });

  const handleSelect = (p: ParkingSpot) => {
    selectParking(p);
    if (carouselRef.current) {
      const el = carouselRef.current.querySelector<HTMLElement>(`[data-id="${p.id}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleNavigate = (parking: ParkingSpot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parking.latitude},${parking.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // handlePrompt removed — Phase 5 AI modal handles its own preference extraction.

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'ai') setAIOpen(true);
  };

  const handleRecenter = () => {
    mapSurfaceRef.current?.recenter();
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: '#F7F7F5' }}>
      {/* ══════════════════════════════════════════
          TOP HEADER
      ══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 pt-safe"
        style={{
          background: 'rgba(247,247,245,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mr-3">
            <div className="w-9 h-9 rounded-[12px] bg-zinc-950 flex items-center justify-center relative shrink-0">
              <span className="text-white font-extrabold text-base tracking-tighter leading-none">P</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-extrabold text-zinc-950 tracking-tight leading-tight">ParkWise</p>
              <p className="text-xs text-zinc-400 font-medium leading-tight">Find parking. Park smarter.</p>
            </div>
          </div>

          {/* Location Pill with real GPS state */}
          <div className="flex-1 flex items-center">
            <LocationPill
              status={locationStatus}
              location={location}
              loading={locationLoading}
              error={locationError}
              onRetry={retryLocation}
              onRecenter={handleRecenter}
            />
          </div>

          {/* Desktop nav */}
          <SideNav active={activeTab} onChange={handleTabChange} />
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        {/* ── Search + Filter Bar ── */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              filterActive={activeFilter !== 'all'}
              onFilterToggle={() => setActiveFilter(activeFilter === 'all' ? '' : 'all')}
              className="flex-1"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                aria-pressed={activeFilter === f.id}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer',
                  activeFilter === f.id
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                    : 'bg-white text-zinc-600 border-[#E8E8E8] hover:border-zinc-300 hover:text-zinc-900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RESPONSIVE GRID
            Mobile: stacked (map, then cards, then AI)
            Desktop: 2-column split (list | map)
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT: Parking List + AI Card (desktop) ── */}
          <div
            className={cn(
              'lg:col-span-5 flex flex-col gap-4',
              activeTab === 'map' ? 'order-2 lg:order-1' : 'order-1 lg:order-1'
            )}
          >
            {/* Section label */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-zinc-900">Nearby spots</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600">
                  {filtered.length}
                </span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors"
                onClick={() => {}}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Sort
              </button>
            </div>

            {/* Desktop vertical scroll list */}
            <div
              className="hidden lg:flex flex-col gap-3 overflow-y-auto no-scrollbar"
              style={{ maxHeight: 'calc(100vh - 260px)' }}
            >
              {filtered.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-3xl border border-[#E8E8E8]">
                  <p className="text-sm font-bold text-zinc-700">No spots found</p>
                  <p className="text-xs text-zinc-400 mt-1">Clear your search or change filters</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                filtered.map((p) => (
                  <ParkingRecommendationCard
                    key={p.id}
                    parking={p}
                    selected={selected?.id === p.id}
                    onSelect={() => handleSelect(p)}
                    onViewDetails={() => setDetailParking(p)}
                    onNavigate={() => handleNavigate(p)}
                  />
                ))
              )}
            </div>

            {/* Mobile horizontal carousel (map tab) */}
            {activeTab === 'map' && (
              <div
                ref={carouselRef}
                className="lg:hidden flex items-stretch gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
              >
                {filtered.map((p) => (
                  <div key={p.id} data-id={p.id} className="w-[85vw] max-w-sm shrink-0 snap-center">
                    <ParkingRecommendationCard
                      parking={p}
                      selected={selected?.id === p.id}
                      onSelect={() => handleSelect(p)}
                      onViewDetails={() => setDetailParking(p)}
                      onNavigate={() => handleNavigate(p)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Mobile vertical list (parking tab) */}
            {activeTab === 'parking' && (
              <div className="lg:hidden flex flex-col gap-3 pb-24">
                {filtered.map((p) => (
                  <ParkingRecommendationCard
                    key={p.id}
                    parking={p}
                    selected={selected?.id === p.id}
                    onSelect={() => handleSelect(p)}
                    onViewDetails={() => setDetailParking(p)}
                    onNavigate={() => handleNavigate(p)}
                  />
                ))}
              </div>
            )}

            {/* AI Action card — desktop only in left column */}
            <AIAction onOpen={() => setAIOpen(true)} className="hidden lg:flex" />
          </div>

          {/* ── RIGHT: Map (full height on desktop, prominent on mobile) ── */}
          <div
            className={cn(
              'lg:col-span-7 flex flex-col',
              activeTab === 'parking' ? 'hidden lg:flex' : 'flex order-1 lg:order-2'
            )}
          >
            {/* isolation: isolate creates a new stacking context that scopes
                Leaflet's internal z-indexes (400/800/1000) to the map container.
                This prevents .leaflet-control and .leaflet-pane from bleeding
                above the ParkingDetailModal which renders outside this DOM subtree. */}
            <div style={{ height: 'clamp(320px, 48vw, 620px)', isolation: 'isolate' }}>
              <MapSurface
                ref={mapSurfaceRef}
                userLocation={location}
                locationLoading={locationLoading}
                locationError={locationError}
                parkings={filtered}
                selectedId={selected?.id ?? null}
                onSelect={handleSelect}
                onRetryLocation={retryLocation}
                className="w-full h-full"
              />
            </div>

            {/* AI action below map on mobile */}
            <div className="lg:hidden mt-4">
              <AIAction onOpen={() => setAIOpen(true)} />
            </div>

            {/* Spacer for mobile bottom nav */}
            <div className="lg:hidden h-24" />
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav active={activeTab} onChange={handleTabChange} />

      {/* ── Modals ── */}
      <ParkingDetailModal
        parking={detailParking}
        onClose={() => setDetailParking(null)}
        onNavigate={() => {
          if (detailParking) handleNavigate(detailParking);
        }}
      />
      <AIModal
        isOpen={aiOpen}
        onClose={() => setAIOpen(false)}
        parkingSpots={filtered}
        onSelectParking={handleSelect}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default AppShell;
