import React from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocationIndicatorProps {
  label?: string;
  subLabel?: string;
  className?: string;
  onClick?: () => void;
}

export const LocationIndicator: React.FC<LocationIndicatorProps> = ({
  label = 'Near your location',
  subLabel = 'Connaught Hub • 500m radius',
  className,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-left',
        'bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 hover:shadow-xs',
        'transition-all duration-200 active:scale-95 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900',
        className
      )}
      aria-label={`Current search area: ${label}`}
    >
      <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white shrink-0 shadow-xs">
        <Navigation className="w-3 h-3 fill-current rotate-45" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1 ring-white" />
        </span>
      </div>

      <div className="flex flex-col min-w-0 pr-1">
        <span className="text-xs font-bold text-zinc-900 leading-tight group-hover:text-black truncate">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] font-medium text-zinc-400 leading-tight truncate">
            {subLabel}
          </span>
        )}
      </div>
    </button>
  );
};
