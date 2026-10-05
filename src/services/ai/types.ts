/**
 * Structured parking preferences extracted from a natural-language user request.
 * Fields are nullable — null means "not mentioned / no preference".
 */
export interface ParkingPreferences {
  maxWalkingMinutes: number | null;
  pricePriority: 'high' | 'medium' | 'low' | null;
  availabilityPriority: 'high' | 'medium' | 'low' | null;
  covered: boolean | null;
  evCharging: boolean | null;
  preferredMaxPrice: number | null;
}

export interface AIRecommendationResult {
  preferences: ParkingPreferences;
  bestParkingId: string;
  explanation: string;
  usedFallback: boolean;
  aiUnavailable: boolean;
  noExactMatch: boolean;
}

export type AIRecommendationStatus =
  | 'idle'
  | 'extracting'
  | 'ranking'
  | 'explaining'
  | 'done'
  | 'error';
