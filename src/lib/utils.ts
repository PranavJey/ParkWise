import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AvailabilityStatus } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatPrice(price: number): string {
  return `₹${price}/hr`;
}

export function getAvailabilityStatus(pct: number): AvailabilityStatus {
  if (pct >= 60) return 'high';
  if (pct >= 30) return 'medium';
  return 'low';
}

export interface StatusStyle {
  dot: string;
  text: string;
  bg: string;
  border: string;
  markerBg: string;
  label: string;
}

export function getStatusStyle(status: AvailabilityStatus): StatusStyle {
  switch (status) {
    case 'high':
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        markerBg: '#16a34a',
        label: 'Available',
      };
    case 'medium':
      return {
        dot: 'bg-amber-500',
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        markerBg: '#d97706',
        label: 'Moderate',
      };
    case 'low':
      return {
        dot: 'bg-red-500',
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        markerBg: '#dc2626',
        label: 'Filling fast',
      };
  }
}
