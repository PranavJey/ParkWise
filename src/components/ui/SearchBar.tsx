import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  onFilterToggle?: () => void;
  isFilterActive?: boolean;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  onFilterToggle,
  isFilterActive = false,
  placeholder = 'Search parking, street, or venue...',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center w-full h-12 rounded-full bg-white',
        'border border-zinc-200/90 shadow-xs hover:border-zinc-300',
        'transition-all duration-200 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10',
        className
      )}
    >
      <div className="flex items-center justify-center pl-4 pr-2 text-zinc-400">
        <Search className="w-4 h-4 stroke-[2.2]" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search parking locations"
        className="w-full h-full bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none pr-3"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search text"
          className="p-1 mr-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {onFilterToggle && (
        <div className="pr-1.5">
          <button
            type="button"
            onClick={onFilterToggle}
            aria-label="Toggle filters"
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full transition-all',
              isFilterActive
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            )}
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      )}
    </div>
  );
};
