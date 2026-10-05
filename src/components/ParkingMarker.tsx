import React from 'react';
import type { AvailabilityStatus } from '@/types';
import { cn, getStatusStyle } from '@/lib/utils';

interface ParkingMarkerProps {
  availability: number;
  status: AvailabilityStatus;
  selected?: boolean;
  name: string;
  price: number;
  onClick?: () => void;
}

export const ParkingMarker: React.FC<ParkingMarkerProps> = ({
  availability,
  status,
  selected = false,
  name,
  price,
  onClick,
}) => {
  const style = getStatusStyle(status);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${name}: ${availability}% availability, ₹${price}/hr`}
      aria-pressed={selected}
      className={cn(
        'relative flex flex-col items-center cursor-pointer group',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-full'
      )}
    >
      {/* Name tooltip on selected */}
      {selected && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap pointer-events-none z-10">
          {name}
        </div>
      )}

      {/* Circle marker */}
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-full text-white font-bold border-2 border-white transition-all duration-200',
          selected ? 'w-14 h-14 shadow-xl' : 'w-11 h-11 shadow-md',
          'group-hover:scale-110'
        )}
        style={{ backgroundColor: style.markerBg }}
      >
        <span className={cn('leading-none font-extrabold', selected ? 'text-sm' : 'text-xs')}>
          {availability}
        </span>
        <span className="text-[8px] font-semibold opacity-80 leading-none">%</span>
      </div>

      {/* Triangle pointer */}
      <div
        className="w-0 h-0 -mt-px"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${style.markerBg}`,
        }}
      />

      {/* Ground shadow */}
      <div className={cn(
        'rounded-full bg-black/15 blur-sm mt-0.5 transition-all duration-200',
        selected ? 'w-7 h-1.5' : 'w-5 h-1'
      )} />
    </button>
  );
};
