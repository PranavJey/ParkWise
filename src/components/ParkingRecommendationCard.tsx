import React from 'react';
import type { ParkingWithDistance } from '@/types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { formatDistance, formatPrice } from '@/lib/utils';
import { MapPin, Clock, Navigation, ChevronRight, Zap, Umbrella } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParkingRecommendationCardProps {
  parking: ParkingWithDistance;
  selected?: boolean;
  onSelect?: () => void;
  onViewDetails?: () => void;
  onNavigate?: () => void;
}

export const ParkingRecommendationCard: React.FC<ParkingRecommendationCardProps> = ({
  parking,
  selected = false,
  onSelect,
  onViewDetails,
  onNavigate,
}) => {
  return (
    <article
      onClick={onSelect}
      className={cn(
        'parking-card bg-white rounded-3xl border p-5 cursor-pointer',
        selected
          ? 'border-zinc-900 shadow-xl'
          : 'border-[#E8E8E8] shadow-sm hover:shadow-md'
      )}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${parking.name}, ${parking.availability}% spots available`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(); } }}
    >
      {/* Top row: name + availability */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-zinc-950 tracking-tight truncate leading-tight">
            {parking.name}
          </h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5 truncate">{parking.tagline}</p>
        </div>
        <AvailabilityBadge availability={parking.availability} status={parking.status} className="shrink-0" />
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 py-3 border-t border-b border-zinc-100 mb-4">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold">{formatDistance(parking.distance)}</span>
        </div>
        <span className="w-px h-4 bg-zinc-200" />
        <div className="flex items-center gap-1.5 text-zinc-600">
          <span className="text-xs font-semibold">{formatPrice(parking.price)}</span>
        </div>
        <span className="w-px h-4 bg-zinc-200" />
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold">{parking.walkingTime} min walk</span>
        </div>

        {/* Amenity pills — pushed right */}
        <div className="ml-auto flex items-center gap-1.5">
          {parking.amenities.includes('ev_charging') && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <Zap className="w-3 h-3" />EV
            </span>
          )}
          {parking.amenities.includes('covered') && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold">
              <Umbrella className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
        {/* Primary: View details */}
        <button
          type="button"
          onClick={onViewDetails}
          aria-label={`View details for ${parking.name}`}
          className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-2xl bg-zinc-950 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          View details
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Secondary: Navigate */}
        <button
          type="button"
          onClick={onNavigate}
          aria-label={`Navigate to ${parking.name}`}
          className="h-11 px-4 rounded-2xl border border-[#E8E8E8] bg-white text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>Go</span>
        </button>
      </div>
    </article>
  );
};
