import React from 'react';
import type { ParkingLocation } from '@/types';
import { ParkingMarker } from './ParkingMarker';
import { Plus, Minus, LocateFixed, Layers, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapSurfaceProps {
  parkings: ParkingLocation[];
  selectedId: string | null;
  onSelect: (p: ParkingLocation) => void;
  className?: string;
}

export const MapSurface: React.FC<MapSurfaceProps> = ({
  parkings,
  selectedId,
  onSelect,
  className,
}) => {
  const [zoom, setZoom] = React.useState(14);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-[#E8EBF0] border border-[#D8DBE0] select-none',
        className
      )}
      role="region"
      aria-label="Parking discovery map"
    >
      {/* ── Vector city grid background ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 800 600"
      >
        {/* Base fill */}
        <rect width="800" height="600" fill="#ECF0F5" />

        {/* Parks */}
        <rect x="60"  y="260" width="140" height="160" rx="20" fill="#D8EDD9" />
        <rect x="580" y="70"  width="180" height="120" rx="20" fill="#D8EDD9" />
        <ellipse cx="400" cy="310" rx="70" ry="60" fill="#D8EDD9" opacity="0.6" />

        {/* Water */}
        <path d="M0 540 Q200 490 400 540 T800 480 L800 600 L0 600Z" fill="#D1EBF8" />

        {/* Minor streets */}
        <line x1="0" y1="120" x2="800" y2="120" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="0" y1="240" x2="800" y2="240" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="0" y1="360" x2="800" y2="360" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="0" y1="480" x2="800" y2="480" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="150" y1="0" x2="150" y2="600" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="290" y1="0" x2="290" y2="600" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="440" y1="0" x2="440" y2="600" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="590" y1="0" x2="590" y2="600" stroke="#DDE1E8" strokeWidth="5" />
        <line x1="720" y1="0" x2="720" y2="600" stroke="#DDE1E8" strokeWidth="5" />

        {/* City blocks */}
        <rect x="10"  y="10"  width="130" height="100" rx="8" fill="#E2E6EC" />
        <rect x="160" y="10"  width="120" height="100" rx="8" fill="#F0F2F5" />
        <rect x="300" y="10"  width="130" height="100" rx="8" fill="#E8EBF0" />
        <rect x="450" y="10"  width="130" height="100" rx="8" fill="#F0F2F5" />
        <rect x="10"  y="130" width="130" height="100" rx="8" fill="#F0F2F5" />
        <rect x="300" y="130" width="130" height="100" rx="8" fill="#E2E6EC" />
        <rect x="450" y="130" width="130" height="100" rx="8" fill="#E8EBF0" />
        <rect x="600" y="130" width="190" height="100" rx="8" fill="#F0F2F5" />
        <rect x="160" y="250" width="120" height="100" rx="8" fill="#F0F2F5" />
        <rect x="450" y="250" width="130" height="100" rx="8" fill="#E2E6EC" />
        <rect x="600" y="250" width="190" height="100" rx="8" fill="#E8EBF0" />
        <rect x="10"  y="370" width="130" height="100" rx="8" fill="#E8EBF0" />
        <rect x="300" y="370" width="130" height="100" rx="8" fill="#F0F2F5" />
        <rect x="600" y="370" width="190" height="100" rx="8" fill="#E2E6EC" />

        {/* Main arterial roads */}
        <line x1="0" y1="180" x2="800" y2="180" stroke="#FFF" strokeWidth="14" />
        <line x1="0" y1="180" x2="800" y2="180" stroke="#CDD1D9" strokeWidth="1.5" strokeDasharray="12 8" />
        <line x1="360" y1="0" x2="360" y2="600" stroke="#FFF" strokeWidth="14" />
        <line x1="360" y1="0" x2="360" y2="600" stroke="#CDD1D9" strokeWidth="1.5" strokeDasharray="12 8" />

        {/* Diagonal boulevard */}
        <line x1="0" y1="0" x2="800" y2="600" stroke="#FFF" strokeWidth="18" />
        <line x1="0" y1="0" x2="800" y2="600" stroke="#CDD1D9" strokeWidth="1.5" strokeDasharray="14 8" />

        {/* Road labels */}
        <text x="230" y="170" fill="#A0A8B4" fontSize="10" fontWeight="700" letterSpacing="2">INNER RING ROAD</text>
        <text x="170" y="375" fill="#A0A8B4" fontSize="9" fontWeight="600">City Park</text>
        <text x="595" y="95"  fill="#A0A8B4" fontSize="9" fontWeight="600">Greenway</text>
      </svg>

      {/* ── User Location Dot ── */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ left: '47%', top: '54%' }}
        aria-hidden="true"
      >
        <div className="relative flex items-center justify-center">
          <div className="location-ping absolute w-8 h-8 rounded-full bg-blue-400/50" />
          <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
        </div>
      </div>

      {/* ── Parking Markers ── */}
      {parkings.map((p) => (
        <div
          key={p.id}
          className="absolute z-30 transition-all duration-300"
          style={{
            left: `${p.mapCoords.x}%`,
            top: `${p.mapCoords.y}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <ParkingMarker
            availability={p.availability}
            status={p.status}
            selected={selectedId === p.id}
            name={p.name}
            price={p.price}
            onClick={() => onSelect(p)}
          />
        </div>
      ))}

      {/* ── Floating Controls ── */}

      {/* Top-left: live badge */}
      <div className="absolute top-3 left-3 z-40">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 shadow text-xs font-semibold text-zinc-700 border border-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 beacon-pulse inline-block" />
          Live · z{zoom}
        </div>
      </div>

      {/* Top-right: compass */}
      <div className="absolute top-3 right-3 z-40">
        <button
          type="button"
          aria-label="Orient north"
          className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-white/60 transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4" style={{ color: '#dc2626' }} />
        </button>
      </div>

      {/* Bottom-right: zoom + locate */}
      <div className="absolute bottom-3 right-3 z-40 flex flex-col items-center gap-2">
        <div className="flex flex-col rounded-2xl bg-white shadow overflow-hidden border border-white/60">
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(z + 1, 18))}
            aria-label="Zoom in"
            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-zinc-200" />
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(z - 1, 10))}
            aria-label="Zoom out"
            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          aria-label="Re-center to my location"
          className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <LocateFixed className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Bottom-left: OSM attribution */}
      <div className="absolute bottom-3 left-3 z-40 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/85 border border-white/60 text-xs font-medium text-zinc-500">
        <Layers className="w-3 h-3" />
        <span>OpenStreetMap ready</span>
      </div>
    </div>
  );
};
