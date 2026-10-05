import React from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPillProps {
  onClick?: () => void;
  className?: string;
}

export const LocationPill: React.FC<LocationPillProps> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Current search location: Near your location"
      className={cn(
        'flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-[#E8E8E8] shadow-sm',
        'hover:border-zinc-300 hover:shadow transition-all cursor-pointer',
        className
      )}
    >
      {/* Location dot with live indicator */}
      <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-zinc-950 text-white shrink-0">
        <Navigation className="w-3 h-3 text-white fill-white" style={{ transform: 'rotate(45deg)' }} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
      </div>

      <div className="text-left">
        <p className="text-xs font-bold text-zinc-900 leading-tight">Near your location</p>
        <p className="text-xs text-zinc-400 font-medium leading-tight">City Centre · 500 m</p>
      </div>

      <div className="ml-1 text-zinc-400">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};
