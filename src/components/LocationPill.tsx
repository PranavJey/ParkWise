import React from 'react';
import { Navigation, Loader2, AlertCircle, MapPinOff } from 'lucide-react';
import type { UserLocation, LocationErrorKind, LocationStatus } from '@/types';
import { cn } from '@/lib/utils';

export interface LocationPillProps {
  status?: LocationStatus;
  location?: UserLocation | null;
  loading?: boolean;
  error?: LocationErrorKind | null;
  onRetry?: () => void;
  onRecenter?: () => void;
  onClick?: () => void;
  className?: string;
}

export const LocationPill: React.FC<LocationPillProps> = ({
  status = 'idle',
  location,
  loading = false,
  error = null,
  onRetry,
  onRecenter,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (error && onRetry) {
      onRetry();
    } else if (location && onRecenter) {
      onRecenter();
    } else if (onClick) {
      onClick();
    }
  };

  let title = 'Near your location';
  let subtitle = 'Detecting position…';
  let dotBg = 'bg-zinc-950 text-white';
  let statusBadge = (
    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
  );
  let icon = <Navigation className="w-3 h-3 text-white fill-white" style={{ transform: 'rotate(45deg)' }} />;

  if (loading) {
    title = 'Locating you…';
    subtitle = 'Detecting position…';
    icon = <Loader2 className="w-3 h-3 text-white animate-spin" />;
    statusBadge = (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white animate-ping" />
    );
  } else if (location) {
    // Requirement 3 & 6: Accept precise or reduced-accuracy location
    title = 'Current location';
    const isApprox = location.isApproximate || location.accuracy > 250;
    subtitle = isApprox
      ? `${location.latitude.toFixed(3)}°, ${location.longitude.toFixed(3)}° · Approx`
      : `${location.latitude.toFixed(3)}°, ${location.longitude.toFixed(3)}° · Live GPS`;
    dotBg = 'bg-zinc-950 text-white';
    statusBadge = (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white beacon-pulse" />
    );
  } else if (status === 'permission_denied' || error === 'permission_denied') {
    title = 'Location access denied';
    subtitle = 'Demo mode · Tap to retry';
    dotBg = 'bg-amber-600 text-white';
    icon = <MapPinOff className="w-3.5 h-3.5 text-white" />;
    statusBadge = (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
    );
  } else if (status === 'timeout' || error === 'timeout') {
    title = 'Location timed out';
    subtitle = 'Demo mode · Tap to retry';
    dotBg = 'bg-zinc-800 text-white';
    icon = <AlertCircle className="w-3.5 h-3.5 text-white" />;
    statusBadge = (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
    );
  } else if (status === 'unavailable' || error === 'unavailable' || error === 'position_unavailable') {
    title = 'Position unavailable';
    subtitle = 'Demo mode · Tap to retry';
    dotBg = 'bg-zinc-800 text-white';
    icon = <AlertCircle className="w-3.5 h-3.5 text-white" />;
    statusBadge = (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
    );
  } else if (status === 'unsupported' || error === 'unsupported') {
    title = 'Location unsupported';
    subtitle = 'Demo mode active';
    dotBg = 'bg-zinc-800 text-white';
    icon = <AlertCircle className="w-3.5 h-3.5 text-white" />;
    statusBadge = (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-zinc-400 border border-white" />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Current search location: ${title} (${subtitle})`}
      className={cn(
        'flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-[#E8E8E8] shadow-sm',
        'hover:border-zinc-300 hover:shadow transition-all cursor-pointer',
        className
      )}
    >
      {/* Location dot with live indicator */}
      <div className={cn('relative flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors', dotBg)}>
        {icon}
        {statusBadge}
      </div>

      <div className="text-left min-w-0">
        <p className="text-xs font-bold text-zinc-900 leading-tight truncate">{title}</p>
        <p className="text-xs text-zinc-400 font-medium leading-tight truncate">{subtitle}</p>
      </div>

      <div className="ml-1 text-zinc-400 shrink-0">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};
