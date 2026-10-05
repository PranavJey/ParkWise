import React from 'react';
import type { AvailabilityStatus } from '@/types';
import { cn, getStatusStyle } from '@/lib/utils';

interface AvailabilityBadgeProps {
  availability: number;
  status: AvailabilityStatus;
  className?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availability,
  status,
  className,
}) => {
  const s = getStatusStyle(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        s.bg, s.text, s.border,
        className
      )}
      role="status"
      aria-label={`${availability}% available — ${s.label}`}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full inline-block beacon-pulse', s.dot)} />
      {availability}%
      <span className="text-zinc-500 font-normal">· {s.label}</span>
    </span>
  );
};
