import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, X, ArrowRight, Loader2, MapPin,
  CheckCircle2, AlertTriangle, Zap, Umbrella, RotateCcw,
} from 'lucide-react';
import { AI_QUICK_PROMPTS } from '@/data/mockParking';
import type { ParkingSpot } from '@/types';
import { useAIRecommendation } from '@/hooks/useAIRecommendation';
import { formatDistance, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current parking candidates from ParkingService — AI ranks these, never invents new ones */
  parkingSpots: ParkingSpot[];
  /** Called when user confirms the AI-recommended spot — syncs map + card list */
  onSelectParking: (parking: ParkingSpot) => void;
}

const STATUS_LABEL: Record<string, string> = {
  extracting: 'Understanding your preferences\u2026',
  ranking:    'Finding your best match\u2026',
  explaining: 'Generating recommendation\u2026',
};

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  parkingSpots,
  onSelectParking,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { status, result, error, recommend, reset } = useAIRecommendation();

  const isLoading = status === 'extracting' || status === 'ranking' || status === 'explaining';
  const isDone    = status === 'done';
  const isError   = status === 'error';

  // Find the recommended parking from the EXISTING parking data
  const bestParking = result
    ? (parkingSpots.find((p) => p.id === result.bestParkingId) ?? null)
    : null;

  // Keyboard close — use a ref to avoid linter warning about self-referencing closure
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { reset(); setQuery(''); onClose(); }
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, reset]);

  // Auto-focus input when modal opens idle
  useEffect(() => {
    if (isOpen && status === 'idle') {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen, status]);

  const handleClose = () => { reset(); setQuery(''); onClose(); };
  const handleReset = () => { reset(); setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); };

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return;
    recommend(query, parkingSpots);
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
    recommend(prompt, parkingSpots);
  };

  const handleSelectParking = () => {
    if (bestParking) { onSelectParking(bestParking); handleClose(); }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      {/* Backdrop dismiss */}
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-zinc-950 text-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-zinc-800 overflow-hidden z-10 flex flex-col max-h-[90vh]">

        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-800" />
        </div>

        {/* Ambient gradient decoration */}
        <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 bg-radial from-emerald-500/8 via-indigo-500/4 to-transparent rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 bg-radial from-purple-500/8 via-transparent to-transparent rounded-full blur-2xl" />

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="text-base font-bold text-white">ParkWise AI</h2>
              <p className="text-xs text-zinc-400">
                {isDone && !result?.aiUnavailable
                  ? 'Powered by Llama\u00a03.1 \u00b7 Groq'
                  : 'Intelligent parking recommendations'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close AI assistant"
            className="w-9 h-9 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────── */}
        <div className="overflow-y-auto no-scrollbar flex-1 relative z-10">

          {/* ── IDLE: Input + quick prompts ──────────────────────── */}
          {status === 'idle' && (
            <div className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="ai-query"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2"
                >
                  What are you looking for?
                </label>
                <textarea
                  id="ai-query"
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                  }}
                  placeholder={'e.g. Cheap covered parking within 5 minutes walk'}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5">Quick queries</p>
                <div className="flex flex-col gap-2">
                  {AI_QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{prompt}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!query.trim()}
                className="w-full h-12 rounded-2xl bg-white text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Find my best parking
              </button>

              <p className="text-center text-[11px] text-zinc-700 leading-relaxed">
                AI identifies preferences &amp; ranks real nearby parking.
                <br />No parking data is invented.
              </p>
            </div>
          )}

          {/* ── LOADING ──────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white mb-1">
                  {STATUS_LABEL[status] ?? 'Processing\u2026'}
                </p>
                <p className="text-xs text-zinc-500">Searching {parkingSpots.length} nearby spots</p>
              </div>
              {/* Step dots */}
              <div className="flex items-center gap-2">
                {(['extracting', 'ranking', 'explaining'] as const).map((step, i) => {
                  const steps = ['extracting', 'ranking', 'explaining'];
                  const current = steps.indexOf(status);
                  const stepIdx = steps.indexOf(step);
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        status === step    ? 'bg-emerald-400'
                        : current > stepIdx ? 'bg-zinc-600'
                        :                    'bg-zinc-800'
                      )} />
                      {i < 2 && <div className="w-5 h-px bg-zinc-800" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────── */}
          {isError && (
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-950 border border-red-900 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Unable to complete recommendation</p>
                <p className="text-xs text-zinc-500 max-w-[260px]">
                  {error ?? 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try again
              </button>
            </div>
          )}

          {/* ── DONE: Recommendation result ───────────────────────────── */}
          {isDone && bestParking && result && (
            <div className="p-6 space-y-4">
              {/* No exact match warning */}
              {result.noExactMatch && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-900/50 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>No parking fully matches your preferences. Showing the closest available option.</span>
                </div>
              )}

              {/* Best match label */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Best match</span>
                {result.usedFallback && (
                  <span className="ml-auto text-[10px] font-medium text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                    AI offline \u00b7 local ranking
                  </span>
                )}
              </div>

              {/* Parking card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <p className="text-base font-bold text-white mb-0.5">{bestParking.name}</p>
                <p className="text-xs text-zinc-400 mb-3">{bestParking.tagline}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Distance', value: formatDistance(bestParking.distanceMeters) },
                    { label: 'Walk',     value: `~${bestParking.walkingMinutes} min` },
                    { label: 'Rate',     value: bestParking.pricePerHour === 0 ? 'Free' : formatPrice(bestParking.pricePerHour) },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-bold text-white mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Availability bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-semibold text-zinc-500 mb-1.5">
                    <span>Est. availability</span>
                    <span>{bestParking.availabilityPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${bestParking.availabilityPercentage}%`,
                        backgroundColor:
                          bestParking.status === 'high'   ? '#10b981' :
                          bestParking.status === 'medium' ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                {/* Feature badges */}
                {(bestParking.covered || bestParking.evCharging) && (
                  <div className="flex flex-wrap gap-2">
                    {bestParking.covered && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-semibold">
                        <Umbrella className="w-3 h-3" /> Covered
                      </span>
                    )}
                    {bestParking.evCharging && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-900/50 text-emerald-400 text-[11px] font-semibold">
                        <Zap className="w-3 h-3" /> EV Charging
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* AI Explanation */}
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Why this spot</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">&ldquo;{result.explanation}&rdquo;</p>
              </div>
            </div>
          )}

          {/* Edge case: done but spot not found in current list */}
          {isDone && !bestParking && (
            <div className="p-6 text-center">
              <p className="text-sm text-zinc-400">Recommended spot is no longer in the list. Try refreshing.</p>
              <button type="button" onClick={handleReset} className="mt-4 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold cursor-pointer hover:bg-zinc-800">
                Try again
              </button>
            </div>
          )}
        </div>

        {/* ── Footer actions (done state only) ─────────────────────── */}
        {isDone && bestParking && (
          <div className="p-5 pt-4 border-t border-zinc-800 flex gap-3 shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleReset}
              aria-label="Try a different query"
              className="h-12 w-12 shrink-0 rounded-2xl border border-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSelectParking}
              className="flex-1 h-12 rounded-2xl bg-white text-zinc-950 text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              Select &amp; view on map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
