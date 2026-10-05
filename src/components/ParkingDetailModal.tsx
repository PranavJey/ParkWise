import React, { useEffect } from 'react';
import type { ParkingWithDistance } from '@/types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { formatDistance, formatPrice } from '@/lib/utils';
import { X, MapPin, Clock, Zap, ShieldCheck, Info, Navigation } from 'lucide-react';

interface ParkingDetailModalProps {
  parking: ParkingWithDistance | null;
  onClose: () => void;
  onNavigate?: () => void;
}

export const ParkingDetailModal: React.FC<ParkingDetailModalProps> = ({
  parking,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!parking) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10">
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-zinc-100">
          <div>
            <h2 id="detail-title" className="text-xl font-bold text-zinc-950 tracking-tight">
              {parking.name}
            </h2>
            {parking.nearestLandmark && (
              <p className="flex items-center gap-1.5 mt-1 text-zinc-700 text-xs font-semibold">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                {parking.nearestLandmark}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-zinc-500 text-xs font-medium">
              <MapPin className="w-3 h-3" />
              {parking.address}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto no-scrollbar p-6 space-y-5">
          {/* Availability */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Estimated availability</span>
              <AvailabilityBadge availability={parking.availability} status={parking.status} />
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${parking.availability}%`,
                  backgroundColor:
                    parking.status === 'high' ? '#16a34a'
                    : parking.status === 'medium' ? '#d97706'
                    : '#dc2626',
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-zinc-500">
              <span>{parking.availableSpots} est. available</span>
              <span>{parking.totalSpots} total</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Walk', value: `${parking.walkingTime} min`, icon: <Clock className="w-4 h-4 text-zinc-400" /> },
              { label: 'Distance', value: formatDistance(parking.distance), icon: <MapPin className="w-4 h-4 text-zinc-400" /> },
              { label: 'Rate', value: formatPrice(parking.price), icon: null },
            ].map(({ label, value, icon }) => (
              <div key={label} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-center">
                {icon && <div className="flex justify-center mb-1">{icon}</div>}
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Facilities</h4>
            <div className="grid grid-cols-2 gap-2">
              {parking.amenities.includes('ev_charging') && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-700">
                  <Zap className="w-4 h-4 text-emerald-600" /> EV Fast Charging
                </div>
              )}
              {parking.amenities.includes('covered') && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-700">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" /> Covered Parking
                </div>
              )}
              {parking.amenities.includes('cctv') && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-700">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" /> 24/7 Security
                </div>
              )}
              {parking.amenities.includes('handicap') && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-700">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" /> Accessible Bays
                </div>
              )}
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Estimated data</strong> — Availability and capacity are estimates only. Location data sourced from OpenStreetMap contributors.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 pt-4 border-t border-zinc-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border border-zinc-200 text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onNavigate}
            className="flex-1 h-12 rounded-2xl bg-zinc-950 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>
        </div>
      </div>
    </div>
  );
};
