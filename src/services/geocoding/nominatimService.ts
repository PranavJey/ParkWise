/**
 * Nominatim reverse geocoding service.
 *
 * Uses the public Nominatim API (OpenStreetMap) to resolve latitude/longitude
 * to a human-readable area name (suburb, neighbourhood, or city district).
 *
 * A single lookup is cached per coordinate pair so we never spam the API
 * across re-renders.
 *
 * Nominatim usage policy: max 1 req/s, must supply a User-Agent.
 * https://operations.osmfoundation.org/policies/nominatim/
 */

interface NominatimResult {
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
}

interface NominatimResponse {
  address?: NominatimResult;
  display_name?: string;
  error?: string;
}

const CACHE = new Map<string, string | null>();
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Derives the most human-friendly area name from a Nominatim address object.
 * Prefers fine-grained names (suburb/neighbourhood) over broader ones (city).
 */
function extractAreaName(addr: NominatimResult): string | null {
  return (
    addr.suburb ||
    addr.neighbourhood ||
    addr.city_district ||
    addr.village ||
    addr.town ||
    addr.city ||
    addr.county ||
    null
  );
}

/**
 * Returns a short "Near <area>" landmark string for the given coordinates,
 * or null if the lookup fails or the area cannot be determined.
 *
 * Results are cached so repeated calls with the same rounded coordinates
 * (to ~1 km precision) never generate additional network requests.
 */
export async function getNearestArea(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<string | null> {
  // Round to ~1 km precision for cache key
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  if (CACHE.has(key)) {
    return CACHE.get(key) ?? null;
  }

  try {
    const url = `${NOMINATIM_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ParkWise/1.0 (https://github.com/PranavJey/ParkWise)',
      },
      signal,
    });

    if (!response.ok) {
      CACHE.set(key, null);
      return null;
    }

    const data: NominatimResponse = await response.json();
    if (data.error || !data.address) {
      CACHE.set(key, null);
      return null;
    }

    const area = extractAreaName(data.address);
    CACHE.set(key, area);
    return area;
  } catch {
    // Network error, abort, etc. — fail silently, no landmark shown
    CACHE.set(key, null);
    return null;
  }
}
