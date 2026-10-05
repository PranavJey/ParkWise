/**
 * ParkWise Secure AI Endpoint — Phase 6
 *
 * Server-side proxy for Groq API / Llama 3.1 inference.
 * Keeps GROQ_API_KEY secret on the server — never sent to or bundled in the browser.
 *
 * Compatible with:
 *  - Vercel Serverless Functions (auto-discovered in /api/ai.ts)
 *  - Vite dev server middleware (via vite.config.ts plugin)
 *  - Vite preview server middleware
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';
const TIMEOUT_MS   = 10_000;
const MAX_QUERY_LEN = 500;

export interface ParkingPreferences {
  maxWalkingMinutes: number | null;
  pricePriority: 'high' | 'medium' | 'low' | null;
  availabilityPriority: 'high' | 'medium' | 'low' | null;
  covered: boolean | null;
  evCharging: boolean | null;
  preferredMaxPrice: number | null;
}

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

function normalizePreferences(raw: Record<string, unknown>): ParkingPreferences {
  const validPriority = (v: unknown): 'high' | 'medium' | 'low' | null =>
    v === 'high' || v === 'medium' || v === 'low' ? v : null;

  return {
    maxWalkingMinutes:
      typeof raw.maxWalkingMinutes === 'number' && Number.isFinite(raw.maxWalkingMinutes)
        ? Math.max(1, Math.min(120, Math.round(raw.maxWalkingMinutes)))
        : null,
    pricePriority: validPriority(raw.pricePriority),
    availabilityPriority: validPriority(raw.availabilityPriority),
    covered: typeof raw.covered === 'boolean' ? raw.covered : null,
    evCharging: typeof raw.evCharging === 'boolean' ? raw.evCharging : null,
    preferredMaxPrice:
      typeof raw.preferredMaxPrice === 'number' && Number.isFinite(raw.preferredMaxPrice)
        ? Math.max(0, Math.round(raw.preferredMaxPrice))
        : null,
  };
}

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as Record<string, unknown>;
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 50_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
): Promise<void> {
  // Only accept POST
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
    return;
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request body';
    sendJson(res, 400, { error: msg });
    return;
  }

  const { action } = body;
  if (action !== 'extractPreferences' && action !== 'explainRecommendation') {
    sendJson(res, 400, {
      error: 'Invalid action. Supported: extractPreferences, explainRecommendation',
    });
    return;
  }

  // Validate action-specific inputs first
  if (action === 'extractPreferences') {
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (!query || query.length > MAX_QUERY_LEN) {
      sendJson(res, 400, {
        error: `Query must be a non-empty string under ${MAX_QUERY_LEN} characters.`,
      });
      return;
    }
  } else if (action === 'explainRecommendation') {
    const best = (body.best && typeof body.best === 'object') ? body.best as Record<string, unknown> : null;
    if (!best || typeof best.name !== 'string' || !best.name.trim()) {
      sendJson(res, 400, { error: 'Missing or invalid parking details in best.' });
      return;
    }
  }

  // Check GROQ_API_KEY
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    sendJson(res, 503, {
      error: 'AI service unavailable: GROQ_API_KEY is not configured on server.',
    });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    if (action === 'extractPreferences') {
      const query = (body.query as string).trim();

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: PREFERENCE_SYSTEM_PROMPT },
            { role: 'user', content: query },
          ],
          temperature: 0.1,
          max_tokens: 256,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!groqResponse.ok) {
        sendJson(res, 502, { error: `AI provider error: ${groqResponse.status}` });
        return;
      }

      const data = (await groqResponse.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        sendJson(res, 502, { error: 'Empty response from AI provider' });
        return;
      }

      const parsed = JSON.parse(content) as Record<string, unknown>;
      const preferences = normalizePreferences(parsed);
      sendJson(res, 200, { preferences });
      return;
    }

    if (action === 'explainRecommendation') {
      const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_QUERY_LEN) : '';
      const preferences = (body.preferences && typeof body.preferences === 'object') ? body.preferences : {};
      const best = (body.best && typeof body.best === 'object') ? body.best as Record<string, unknown> : null;
      const alternativesCount = typeof body.alternativesCount === 'number' ? body.alternativesCount : 0;

      if (!best || typeof best.name !== 'string') {
        clearTimeout(timeoutId);
        sendJson(res, 400, { error: 'Missing or invalid parking details in best.' });
        return;
      }

      const parkingSummary = {
        name: best.name,
        distanceMeters: best.distanceMeters ?? best.distance,
        walkingMinutes: best.walkingMinutes ?? best.walkingTime,
        pricePerHour: best.pricePerHour === 0 || best.price === 0 ? 'Free' : `${best.pricePerHour ?? best.price} per hour`,
        currency: best.currency ?? '₹',
        covered: Boolean(best.covered),
        evCharging: Boolean(best.evCharging),
        availabilityPercentage: best.availabilityPercentage ?? best.availability,
      };

      const userContent = `User's request: "${query}"

Extracted preferences: ${JSON.stringify(preferences)}

Selected parking: ${JSON.stringify(parkingSummary)}

Alternative options considered: ${alternativesCount}

Explain briefly why this is the best match.`;

      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: EXPLANATION_SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
          temperature: 0.4,
          max_tokens: 128,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!groqResponse.ok) {
        sendJson(res, 502, { error: `AI provider error: ${groqResponse.status}` });
        return;
      }

      const data = (await groqResponse.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        sendJson(res, 502, { error: 'Empty response from AI provider' });
        return;
      }

      sendJson(res, 200, { explanation: content.trim() });
      return;
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    sendJson(res, isAbort ? 504 : 500, {
      error: isAbort ? 'AI request timed out' : 'Internal server error processing AI request',
    });
  }
}
