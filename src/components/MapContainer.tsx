import React from 'react';
import type { ParkingLocation } from '@/types';
import { ParkingMapMarker } from './ParkingMapMarker';
import { Plus, Minus, LocateFixed, Layers, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapContainerProps {
  parkings: ParkingLocation[];
  selectedParking: ParkingLocation | null;
  onSelectParking: (parking: ParkingLocation) => void;
  className?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  parkings,
  selectedParking,
  onSelectParking,
  className,
}) => {
  const [zoomLevel, setZoomLevel] = React.useState<number>(14);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 1, 10));

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[32px] select-none',
        'bg-[#ECEEF2] border border-zinc-200/90 shadow-sm',
        'flex items-center justify-center transition-all',
        className
      )}
      role="region"
      aria-label="Interactive parking discovery map"
    >
      {/* =========================================================
          CONVINCING VECTOR MAP PLACEHOLDER
          Simulates city blocks, major roads, metro corridors, 
          waterway, and green open parks
          ========================================================= */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1000 800"
      >
        <defs>
          <pattern id="city-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#ECEEF2" />
            {/* City Urban Blocks */}
            <rect x="8" y="8" width="40" height="40" rx="8" fill="#F8F9FA" />
            <rect x="52" y="8" width="40" height="40" rx="8" fill="#F4F5F7" />
            <rect x="8" y="52" width="40" height="40" rx="8" fill="#F4F5F7" />
            <rect x="52" y="52" width="40" height="40" rx="8" fill="#F8F9FA" />
          </pattern>
        </defs>

        {/* Base Grid */}
        <rect width="1000" height="800" fill="url(#city-grid)" />

        {/* Urban Parks */}
        <rect x="80" y="320" width="160" height="180" rx="24" fill="#E6F4EA" />
        <rect x="680" y="100" width="220" height="140" rx="28" fill="#E6F4EA" />
        <circle cx="500" cy="400" r="90" fill="#E6F4EA" opacity="0.7" />

        {/* River / Water Canal */}
        <path
          d="M -50 720 Q 250 640 450 710 T 950 620 L 1050 640 L 1050 850 L -50 850 Z"
          fill="#E0F2FE"
          stroke="#BAE6FD"
          strokeWidth="3"
        />

        {/* Minor City Streets */}
        <path
          d="M 0 150 L 1000 150 M 0 300 L 1000 300 M 0 450 L 1000 450 M 0 600 L 1000 600"
          stroke="#E2E5E9"
          strokeWidth="6"
        />
        <path
          d="M 180 0 L 180 800 M 360 0 L 360 800 M 540 0 L 540 800 M 720 0 L 720 800 M 900 0 L 900 800"
          stroke="#E2E5E9"
          strokeWidth="6"
        />

        {/* Major Arterial Roads / Expressways */}
        <path
          d="M -20 220 L 1020 220"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M -20 220 L 1020 220"
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeDasharray="10 10"
        />

        {/* Diagonal Boulevard */}
        <path
          d="M 50 50 L 950 750"
          stroke="#FFFFFF"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M 50 50 L 950 750"
          stroke="#E2E8F0"
          strokeWidth="2"
          strokeDasharray="12 12"
        />

        {/* Central Circular Plaza / Ring */}
        <circle cx="500" cy="400" r="130" fill="none" stroke="#FFFFFF" strokeWidth="22" />
        <circle cx="500" cy="400" r="130" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />

        {/* Etched Street Names */}
        <text x="210" y="210" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="2">
          INNER RING BOULEVARD
        </text>
        <text x="560" y="380" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="1.5">
          CENTRAL CIRCUS
        </text>
        <text x="120" y="470" fill="#94A3B8" fontSize="10" fontWeight="600">
          City Green Park
        </text>
        <text x="680" y="580" fill="#94A3B8" fontSize="10" fontWeight="600">
          Metro Transit corridor
        </text>
      </svg>

      {/* User's Current Position Indicator Pulse */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ left: '46%', top: '52%' }}
        aria-hidden="true"
      >
        <div className="relative flex items-center justify-center">
          <div className="animate-ping absolute w-9 h-9 rounded-full bg-blue-500 opacity-40" />
          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* =========================================================
          PARKING MAP MARKERS (Connected to mock data coordinates)
          ========================================================= */}
      {parkings.map((parking) => {
        const isSelected = selectedParking?.id === parking.id;
        return (
          <div
            key={parking.id}
            className="absolute transition-all duration-300"
            style={{
              left: `${(parking as unknown as { mapCoords?: { x: number } }).mapCoords?.x ?? 50}%`,
              top: `${(parking as unknown as { mapCoords?: { y: number } }).mapCoords?.y ?? 50}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <ParkingMapMarker
              id={parking.id}
              name={parking.name}
              price={parking.price}
              availability={parking.availability}
              status={parking.status}
              selected={isSelected}
              onClick={() => onSelectParking(parking)}
            />
          </div>
        );
      })}

      {/* =========================================================
          FLOATING MAP CONTROLS
          ========================================================= */}
      {/* Top Left: Map Simulation Status Pill */}
      <div className="absolute top-4 left-4 z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/80 shadow-xs text-xs font-semibold text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Grid</span>
          <span className="text-[10px] text-zinc-400 border-l border-zinc-200 pl-1.5 font-normal">
            z{zoomLevel}
          </span>
        </div>
      </div>

      {/* Top Right: Compass Pill */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          aria-label="Re-orient map north"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-xs text-zinc-700 hover:text-zinc-950 hover:bg-white active:scale-95 transition-all"
        >
          <Compass className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      {/* Bottom Right: Zoom & Re-Center Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-2">
        {/* Zoom In/Out Pill Stack */}
        <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="w-10 h-10 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-zinc-200 w-full" />
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-10 h-10 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Re-center Button */}
        <button
          type="button"
          aria-label="Re-center map to my location"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-900 text-white shadow-md hover:bg-zinc-800 active:scale-95 transition-all"
        >
          <LocateFixed className="w-5 h-5 text-emerald-400" />
        </button>
      </div>

      {/* Bottom Left: Map Layer Info Pill */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/80 shadow-xs text-[11px] font-medium text-zinc-500">
        <Layers className="w-3.5 h-3.5 text-zinc-400" />
        <span>OpenStreetMap Foundation Ready</span>
      </div>
    </div>
  );
};
