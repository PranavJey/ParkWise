import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  filterActive?: boolean;
  onFilterToggle?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  filterActive = false,
  onFilterToggle,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-4 h-12 rounded-full bg-white border border-[#E8E8E8] shadow-sm',
        'focus-within:border-zinc-400 focus-within:shadow transition-all',
        className
      )}
    >
      <Search className="w-4 h-4 text-zinc-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search parking, street, venue..."
        aria-label="Search for parking"
        className="flex-1 h-full bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
      />
      {onFilterToggle && (
        <button
          type="button"
          onClick={onFilterToggle}
          aria-label="Toggle filters"
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0',
            filterActive
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
