import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  label: string;
  count?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  active,
  label,
  count,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap',
        'transition-all duration-200 cursor-pointer active:scale-95 shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
        active
          ? 'bg-zinc-900 text-white shadow-xs'
          : 'bg-white text-zinc-600 border border-zinc-200/90 hover:border-zinc-300 hover:text-zinc-900 shadow-2xs',
        className
      )}
      aria-pressed={active}
      {...props}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'inline-flex items-center justify-center text-[10px] w-4 h-4 rounded-full font-bold',
            active ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
