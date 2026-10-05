import React from 'react';
import { cn } from '@/lib/utils';
import type { AvailabilityStatus } from '@/types';

export interface ParkingMapMarkerProps {
  id: string;
  name: string;
  price?: number;
  availability: number;
  status: AvailabilityStatus;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ParkingMapMarker: React.FC<ParkingMapMarkerProps> = ({
  name,
  price,
  availability,
  status,
  selected = false,
  onClick,
  className,
}) => {
  // Background and border colors per status
  const colorSchemes = {
    high: {
      bg: 'bg-emerald-600',
      border: 'border-white',
      ring: 'ring-emerald-500/30',
      labelBg: 'bg-emerald-50 text-emerald-800',
    },
    medium: {
      bg: 'bg-amber-500',
      border: 'border-white',
      ring: 'ring-amber-500/30',
      labelBg: 'bg-amber-50 text-amber-800',
    },
    low: {
      bg: 'bg-rose-500',
      border: 'border-white',
      ring: 'ring-rose-500/30',
      labelBg: 'bg-rose-50 text-rose-800',
    },
  };

  const scheme = colorSchemes[status];

  return (
    <div
      className={cn(
        'relative flex flex-col items-center group cursor-pointer transition-transform duration-300 ease-out select-none',
        selected ? 'scale-110 z-30' : 'hover:scale-105 z-10',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Parking location ${name}: ${availability}% available, ${price ? `₹${price} per hour` : ''}`}
      aria-pressed={selected}
    >
      {/* Floating Info Tag on Selected or Hover */}
      {(selected || false) && (
        <div
          className={cn(
            'absolute -top-11 px-2.5 py-1 rounded-full whitespace-nowrap shadow-md',
            'bg-zinc-900 text-white text-[11px] font-semibold tracking-tight flex items-center gap-1.5',
            'animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none'
          )}
        >
          <span className="truncate max-w-[100px]">{name}</span>
          {price !== undefined && (
            <span className="text-zinc-400 font-normal border-l border-zinc-700 pl-1.5">
              ₹{price}/h
            </span>
          )}
        </div>
      )}

      {/* Main Circular Marker */}
      <div
        className={cn(
          'w-11 h-11 rounded-full flex flex-col items-center justify-center text-white',
          'border-2 shadow-md transition-all duration-300',
          scheme.bg,
          scheme.border,
          selected
            ? 'ring-4 ring-zinc-900 shadow-xl'
            : 'ring-2 ring-black/5 hover:ring-3 hover:ring-black/10'
        )}
      >
        {/* Compact typography fitted inside circle without colliding */}
        <div className="flex items-baseline justify-center leading-none tracking-tight">
          <span className="text-[13px] font-extrabold">{availability}</span>
          <span className="text-[9px] font-bold opacity-90 ml-0.5">%</span>
        </div>
        <span className="text-[8px] font-semibold uppercase tracking-wider text-white/80 leading-none mt-0.5">
          Spots
        </span>
      </div>

      {/* Triangular anchor pointer at bottom */}
      <div
        className={cn(
          'w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-[1px]',
          status === 'high'
            ? 'border-t-emerald-600'
            : status === 'medium'
            ? 'border-t-amber-500'
            : 'border-t-rose-500'
        )}
      />

      {/* Subtle ground shadow */}
      <div
        className={cn(
          'w-5 h-1.5 rounded-full bg-black/20 blur-[1px] mt-0.5 transition-all',
          selected ? 'w-7 bg-black/30' : ''
        )}
      />
    </div>
  );
};
