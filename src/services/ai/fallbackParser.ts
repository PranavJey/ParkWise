import type { ParkingPreferences } from './types';

/**
 * Lightweight regex-based preference parser.
 * Used as an emergency fallback when the AI service is unavailable.
 * Does NOT replace the LLM — only provides a best-effort parse for
 * the most obvious patterns so the app remains functional offline.
 */
export function fallbackParsePreferences(query: string): ParkingPreferences {
  const q = query.toLowerCase();

  // ── Walking time ─────────────────────────────────────────────────────────
  let maxWalkingMinutes: number | null = null;
  const walkMatch = q.match(
    /(\d+)\s*min(?:ute)?s?\s*walk|walk(?:ing)?\s*(?:up\s*to\s*)?(\d+)\s*min/i
  );
  if (walkMatch) {
    maxWalkingMinutes = parseInt(walkMatch[1] ?? walkMatch[2], 10);
  }

  // ── Price priority ───────────────────────────────────────────────────────
  let pricePriority: 'high' | 'medium' | 'low' | null = null;
  if (/cheap|budget|afford|inexpensive|low.?cost|free/.test(q)) {
    pricePriority = 'high';
  } else if (/premium|luxury|best quality/.test(q)) {
    pricePriority = 'low';
  }

  // ── Preferred max price ──────────────────────────────────────────────────
  let preferredMaxPrice: number | null = null;
  const priceMatch = q.match(
    /(?:under|below|less\s+than|max|at\s+most)\s*[₹$]?\s*(\d+)/i
  );
  if (priceMatch) {
    preferredMaxPrice = parseInt(priceMatch[1], 10);
    if (!pricePriority) pricePriority = 'high';
  }

  // ── Availability priority ────────────────────────────────────────────────
  let availabilityPriority: 'high' | 'medium' | 'low' | null = null;
  if (/avail|open|empty|free space|most space/.test(q)) {
    availabilityPriority = 'high';
  }

  // ── Covered ──────────────────────────────────────────────────────────────
  let covered: boolean | null = null;
  if (/covered|indoor|underground|multi.?storey|multi.?level|shelter|shade|roofed/.test(q)) {
    covered = true;
  }

  // ── EV Charging ──────────────────────────────────────────────────────────
  let evCharging: boolean | null = null;
  if (/\bev\b|electric\s*vehicle|charg/.test(q)) {
    evCharging = true;
  }

  return {
    maxWalkingMinutes,
    pricePriority,
    availabilityPriority,
    covered,
    evCharging,
    preferredMaxPrice,
  };
}
