import React from 'react';
import { LocationIndicator } from './LocationIndicator';
import { IconButton } from './ui/IconButton';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  onFilterToggle?: () => void;
  isFilterActive?: boolean;
  onOpenAI?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onFilterToggle,
  isFilterActive = false,
  onOpenAI,
  className,
}) => {
  return (
    <header
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4',
        'bg-white/95 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-40',
        className
      )}
    >
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
          <span className="font-extrabold text-base sm:text-lg tracking-tighter">P</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-0.5 -mt-2 ring-1 ring-zinc-950" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-950">
              ParkWise
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 uppercase tracking-wider">
              AI
            </span>
          </div>
          <p className="hidden sm:block text-[11px] font-medium text-zinc-400 tracking-tight">
            Find parking. Park smarter.
          </p>
        </div>
      </div>

      {/* Middle: Location Indicator */}
      <div className="flex items-center justify-center">
        <LocationIndicator label="Near your location" subLabel="City Center • 500m" />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {onOpenAI && (
          <button
            type="button"
            onClick={onOpenAI}
            aria-label="Open AI parking assistant"
            className="hidden md:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Assistant</span>
          </button>
        )}

        {onFilterToggle && (
          <IconButton
            size="sm"
            variant={isFilterActive ? 'dark' : 'light'}
            ariaLabel="Toggle filters"
            onClick={onFilterToggle}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </IconButton>
        )}
      </div>
    </header>
  );
};
