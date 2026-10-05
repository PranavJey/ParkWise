/**
 * ParkWise AI Service — Phase 6 (Secure Server-Side Architecture)
 *
 * Calls the secure same-origin ParkWise AI proxy endpoint (/api/ai).
 * The browser never holds or exposes the GROQ_API_KEY.
 *
 * Hosted inference is performed on the server side using Meta Llama 3.1 8B Instant via Groq.
 * Llama 3.1 is an open-weight model released under the Meta Llama 3.1 Community License.
 *
 * If the endpoint is unavailable or fails, calls throw so the caller
 * (useAIRecommendation hook) automatically uses local fallback parsing and template explanation.
 * The deterministic ranking engine always runs locally in all cases.
 */

import type { ParkingPreferences } from './types';
import type { ParkingSpot } from '@/types';

const AI_ENDPOINT = '/api/ai';
const TIMEOUT_MS = 10_000;

export async function extractPreferences(query: string): Promise<ParkingPreferences> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'extractPreferences',
        query,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`AI endpoint ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = (await response.json()) as { preferences?: ParkingPreferences };
    if (!data.preferences) {
      throw new Error('Malformed AI response: missing preferences');
    }

    return data.preferences;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function explainRecommendation(
  userQuery: string,
  preferences: ParkingPreferences,
  best: ParkingSpot,
  alternatives: ParkingSpot[]
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'explainRecommendation',
        query: userQuery,
        preferences,
        best,
        alternativesCount: alternatives.length,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`AI endpoint ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = (await response.json()) as { explanation?: string };
    if (!data.explanation) {
      throw new Error('Malformed AI response: missing explanation');
    }

    return data.explanation;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
