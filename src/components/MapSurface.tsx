import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import L from 'leaflet';
import type { ParkingWithDistance } from '@/types';
import type { UserLocation, LocationErrorKind } from '@/types';
import { LeafletMap } from './LeafletMap';
import { Compass, LocateFixed, Plus, Minus, Layers, AlertTriangle, Loader, MapPinOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Imperative handle ────────────────────────────────────────────────────────
export interface MapSurfaceHandle {
  recenter: () => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface MapSurfaceProps {
  userLocation: UserLocation | null;
  locationLoading: boolean;
  locationError: LocationErrorKind | null;
  parkings: ParkingWithDistance[];
  selectedId: string | null;
  onSelect: (p: ParkingWithDistance) => void;
  onRetryLocation: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const MapSurface = forwardRef<MapSurfaceHandle, MapSurfaceProps>(
  (
    {
      userLocation,
      locationLoading,
      locationError,
      parkings,
      selectedId,
      onSelect,
      onRetryLocation,
      className,
    },
    ref,
  ) => {
    // Internal ref to the Leaflet map instance so we can call flyTo etc.
    const leafletMapInstanceRef = useRef<L.Map | null>(null);

    // Track a stable recenter callback that LeafletMap can call back into
    const recenterCallbackRef = useRef<(() => void) | null>(null);

    const handleRecenter = useCallback(() => {
      recenterCallbackRef.current?.();
    }, []);

    // Expose recenter to parent via ref
    useImperativeHandle(ref, () => ({ recenter: handleRecenter }), [
      handleRecenter,
    ]);

    // Called by LeafletMap to register its fly-to-user function
    const registerRecenter = useCallback((fn: () => void) => {
      recenterCallbackRef.current = fn;
    }, []);

    // Zoom controls (delegated to Leaflet via the shared map ref)
    const handleZoomIn = useCallback(() => {
      leafletMapInstanceRef.current?.zoomIn();
    }, []);
    const handleZoomOut = useCallback(() => {
      leafletMapInstanceRef.current?.zoomOut();
    }, []);

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-[#D8DBE0] shadow-sm bg-[#E8EBF0]',
          className,
        )}
        role="region"
        aria-label="Parking discovery map"
      >
        {/* ── Leaflet map ─────────────────────────────────────────────────── */}
        <LeafletMap
          userLocation={userLocation}
          parkings={parkings}
          selectedId={selectedId}
          onSelectParking={onSelect}
          onRecenter={() => {}}
          mapRef={leafletMapInstanceRef}
          onRegisterRecenter={registerRecenter}
          className="w-full h-full"
        />

        {/* ── Loading overlay ─────────────────────────────────────────────── */}
        {locationLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 rounded-3xl bg-[#E8EBF0]/90 pointer-events-none">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-md border border-[#E8E8E8]">
              <Loader className="w-6 h-6 text-zinc-500 animate-spin" />
              <p className="text-sm font-bold text-zinc-800">Finding your location…</p>
              <p className="text-xs text-zinc-400 text-center max-w-[200px]">
                ParkWise uses your location to find nearby parking.
              </p>
            </div>
          </div>
        )}

        {/* ── Permission denied overlay ───────────────────────────────────── */}
        {!locationLoading && locationError === 'permission_denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 rounded-3xl bg-[#E8EBF0]/90">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-md border border-[#E8E8E8] max-w-[260px] mx-4">
              <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <MapPinOff className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-zinc-800 text-center">Location access disabled</p>
              <p className="text-xs text-zinc-500 text-center">
                Enable location in your browser settings, then retry.
              </p>
              <button
                type="button"
                onClick={onRetryLocation}
                className="px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Unavailable / timeout overlay ──────────────────────────────── */}
        {!locationLoading &&
          locationError !== null &&
          locationError !== 'permission_denied' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 rounded-3xl bg-[#E8EBF0]/90">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-md border border-[#E8E8E8] max-w-[260px] mx-4">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm font-bold text-zinc-800 text-center">
                  {locationError === 'unsupported'
                    ? 'Location not supported'
                    : locationError === 'timeout'
                    ? 'Location request timed out'
                    : 'Position unavailable'}
                </p>
                <p className="text-xs text-zinc-500 text-center">
                  {locationError === 'unsupported'
                    ? 'Your browser does not support geolocation. Showing demo parking.'
                    : locationError === 'timeout'
                    ? 'Position acquisition timed out. Showing demo parking.'
                    : 'Could not determine your position. Showing demo parking.'}
                </p>
                {locationError !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={onRetryLocation}
                    className="px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}

        {/* ── Status badge (top-left) ──────────────────────────────────────── */}
        {!locationLoading && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            {userLocation ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 shadow text-xs font-semibold text-zinc-700 border border-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 beacon-pulse inline-block" />
                Live · OSM
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 shadow text-xs font-semibold text-zinc-700 border border-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Demo Mode · OSM
              </div>
            )}
          </div>
        )}

        {/* ── Compass (top-right) ────────────────────────────────────────── */}
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            aria-label="Orient north"
            className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-white/60 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" style={{ color: '#dc2626' }} />
          </button>
        </div>

        {/* ── Zoom + Recenter (bottom-right) ────────────────────────────── */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col items-center gap-2">
          <div className="flex flex-col rounded-2xl bg-white shadow overflow-hidden border border-white/60">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-px bg-zinc-200" />
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Re-center to my location"
            disabled={!userLocation}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer',
              userLocation
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-zinc-300 text-zinc-400 cursor-not-allowed',
            )}
          >
            <LocateFixed
              className={cn(
                'w-4 h-4',
                userLocation ? 'text-emerald-400' : 'text-zinc-400',
              )}
            />
          </button>
        </div>

        {/* ── OSM attribution label (bottom-left, desktop) ──────────────── */}
        <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/85 border border-white/60 text-xs font-medium text-zinc-500">
          <Layers className="w-3 h-3" />
          <span>OpenStreetMap</span>
        </div>
      </div>
    );
  },
);

MapSurface.displayName = 'MapSurface';
