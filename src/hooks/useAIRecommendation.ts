import { useState, useCallback } from 'react';
import type { ParkingSpot } from '@/types';
import type { AIRecommendationResult, AIRecommendationStatus } from '@/services/ai/types';
import { extractPreferences, explainRecommendation } from '@/services/ai/aiService';
import { fallbackParsePreferences } from '@/services/ai/fallbackParser';
import { rankParkingSpots, generateFallbackExplanation } from '@/services/ai/rankingEngine';

export interface UseAIRecommendationReturn {
  status: AIRecommendationStatus;
  result: AIRecommendationResult | null;
  error: string | null;
  recommend: (query: string, candidates: ParkingSpot[]) => Promise<void>;
  reset: () => void;
}

/**
 * Orchestrates the complete Phase 5 AI recommendation flow:
 *
 * 1. Extract structured preferences (LLM or fallback regex parser)
 * 2. Score and rank parking candidates deterministically
 * 3. Generate a natural-language explanation (LLM or fallback template)
 *
 * The LLM never selects or invents parking locations —
 * all candidate data comes from the existing ParkingService.
 */
export function useAIRecommendation(): UseAIRecommendationReturn {
  const [status,  setStatus]  = useState<AIRecommendationStatus>('idle');
  const [result,  setResult]  = useState<AIRecommendationResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const recommend = useCallback(async (
    query:      string,
    candidates: ParkingSpot[]
  ) => {
    if (!query.trim()) return;

    if (candidates.length === 0) {
      setError('No parking spots available to recommend from. Please wait for parking data to load.');
      setStatus('error');
      return;
    }

    setStatus('extracting');
    setError(null);
    setResult(null);

    // ── Step 1: Preference extraction ────────────────────────────────────
    let aiUnavailable = false;
    let preferences = fallbackParsePreferences(query); // always compute fallback first

    try {
      preferences = await extractPreferences(query);
    } catch {
      // AI unavailable — use fallback preferences already computed above
      aiUnavailable = true;
      if (import.meta.env.DEV) {
        console.warn('[ParkWise AI] Preference extraction failed; using fallback parser.');
      }
    }

    // ── Step 2: Deterministic ranking ────────────────────────────────────
    setStatus('ranking');
    const ranked = rankParkingSpots(candidates, preferences);
    const best   = ranked[0];

    if (!best) {
      setError('No parking spots could be ranked. Please try again.');
      setStatus('error');
      return;
    }

    // Detect if best match fails any hard constraint
    const noExactMatch =
      (preferences.covered      === true && !best.covered)   ||
      (preferences.evCharging   === true && !best.evCharging) ||
      (preferences.maxWalkingMinutes !== null && best.walkingMinutes > preferences.maxWalkingMinutes);

    // ── Step 3: Explanation ───────────────────────────────────────────────
    setStatus('explaining');
    let explanation = generateFallbackExplanation(preferences, best);

    if (!aiUnavailable) {
      try {
        explanation = await explainRecommendation(
          query,
          preferences,
          best,
          ranked.slice(1, 3)
        );
      } catch {
        // Already have fallback explanation above
        if (import.meta.env.DEV) {
          console.warn('[ParkWise AI] Explanation generation failed; using fallback.');
        }
      }
    }

    // ── Done ─────────────────────────────────────────────────────────────
    setStatus('done');
    setResult({
      preferences,
      bestParkingId:  best.id,
      explanation,
      usedFallback:   aiUnavailable,
      aiUnavailable,
      noExactMatch,
    });
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, recommend, reset };
}
