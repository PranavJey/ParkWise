/**
 * ParkWise AI Service — Phase 5
 *
 * Uses the Groq hosted inference API to run Meta Llama 3.1 8B Instant.
 * Llama 3.1 is an open-weight model released by Meta AI under the
 * Meta Llama 3.1 Community License (https://llama.meta.com/llama3_1/license/).
 *
 * Groq provides hosted inference; no model weights are downloaded locally.
 * API key: VITE_GROQ_API_KEY (see .env.example — never commit the real key).
 *
 * Two API calls are made per recommendation:
 *  1. Preference extraction  — returns strict JSON
 *  2. Explanation generation — returns a 1–2 sentence natural-language string
 *
 * Both calls fail gracefully; the ranking engine always runs deterministically.
 */

import type { ParkingPreferences } from './types';
import type { ParkingSpot } from '@/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';
const TIMEOUT_MS   = 10_000;

// ── Helpers ────────────────────────────────────────────────────────────────

function getApiKey(): string | null {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  return typeof key === 'string' && key.length > 0 ? key : null;
}

async function groqChat(
  messages: { role: 'system' | 'user'; content: string }[],
  options: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not configured');

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body: Record<string, unknown> = {
      model: GROQ_MODEL,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens:  options.maxTokens  ?? 256,
    };

    if (options.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Groq API ${response.status}: ${errorBody.slice(0, 120)}`);
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq API');
    return content.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ── Preference extraction ───────────────────────────────────────────────────

const PREFERENCE_SYSTEM_PROMPT = `You are a parking preference extractor for ParkWise, a parking discovery app.

Extract parking preferences from the user's natural language request.

Return ONLY valid JSON — no explanation, no markdown, just JSON.

Schema (use null for unmentioned fields):
{
  "maxWalkingMinutes": number | null,
  "pricePriority": "high" | "medium" | "low" | null,
  "availabilityPriority": "high" | "medium" | "low" | null,
  "covered": true | false | null,
  "evCharging": true | false | null,
  "preferredMaxPrice": number | null
}

Rules:
- pricePriority "high" means the user wants the cheapest option
- pricePriority "low" means price is not a concern
- Do not invent information
- Return null for any field the user did not specify`;

export async function extractPreferences(query: string): Promise<ParkingPreferences> {
  const raw = await groqChat(
    [
      { role: 'system', content: PREFERENCE_SYSTEM_PROMPT },
      { role: 'user',   content: query },
    ],
    { temperature: 0.1, maxTokens: 256, jsonMode: true }
  );

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return normalizePreferences(parsed);
}

function normalizePreferences(raw: Record<string, unknown>): ParkingPreferences {
  const validPriority = (v: unknown): 'high' | 'medium' | 'low' | null =>
    v === 'high' || v === 'medium' || v === 'low' ? v : null;

  return {
    maxWalkingMinutes:
      typeof raw.maxWalkingMinutes === 'number' ? raw.maxWalkingMinutes : null,
    pricePriority:       validPriority(raw.pricePriority),
    availabilityPriority: validPriority(raw.availabilityPriority),
    covered:
      typeof raw.covered === 'boolean' ? raw.covered : null,
    evCharging:
      typeof raw.evCharging === 'boolean' ? raw.evCharging : null,
    preferredMaxPrice:
      typeof raw.preferredMaxPrice === 'number' ? raw.preferredMaxPrice : null,
  };
}

// ── Explanation generation ──────────────────────────────────────────────────

const EXPLANATION_SYSTEM_PROMPT = `You are ParkWise AI, a helpful parking recommendation assistant.

Given the user's request, their extracted preferences, and the selected parking spot, write a brief explanation of why this parking is the best match.

Rules:
- Use ONLY the supplied parking data — never invent facts
- Keep the explanation to 1–2 sentences maximum
- Be specific about what matches the user's request
- Do not use phrases like "Based on the data" or "According to"
- Do not mention field names or technical IDs
- Write naturally as if talking to a driver
- Do not mention that availability is estimated unless needed for clarity`;

export async function explainRecommendation(
  userQuery:   string,
  preferences: ParkingPreferences,
  best:        ParkingSpot,
  alternatives: ParkingSpot[],
): Promise<string> {
  const parkingData = {
    name:                   best.name,
    distanceMeters:         best.distanceMeters,
    walkingMinutes:         best.walkingMinutes,
    pricePerHour:           best.pricePerHour === 0 ? 'Free' : `${best.pricePerHour} per hour`,
    currency:               best.currency,
    covered:                best.covered,
    evCharging:             best.evCharging,
    availabilityPercentage: best.availabilityPercentage,
    type:                   best.type,
  };

  const userContent = `User's request: "${userQuery}"

Extracted preferences: ${JSON.stringify(preferences)}

Selected parking: ${JSON.stringify(parkingData)}

Alternative options considered: ${alternatives.length}

Explain briefly why this is the best match.`;

  return groqChat(
    [
      { role: 'system', content: EXPLANATION_SYSTEM_PROMPT },
      { role: 'user',   content: userContent },
    ],
    { temperature: 0.4, maxTokens: 128 }
  );
}
