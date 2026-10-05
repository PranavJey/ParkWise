import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  LocationState,
  UserLocation,
  LocationErrorKind,
  LocationStatus,
} from '@/types';

const HIGH_ACCURACY_TIMEOUT_MS = 10_000; // Give GPS more time on mobile
const STANDARD_TIMEOUT_MS = 15_000;
const CACHE_MAX_AGE_MS = 0; // Always request a fresh network position — no stale IP cache

// Positions with accuracy worse than this are IP-based guesses (not real GPS).
// Indian telecom PoPs commonly map to Bengaluru with accuracy ~50,000m.
// We reject these and keep loading until watchPosition delivers a real GPS fix.
const MAX_ACCEPTABLE_ACCURACY_M = 5_000;

export interface UseUserLocationReturn extends LocationState {
  /** Manually trigger a fresh location request */
  retry: () => void;
}

/**
 * Manages browser geolocation state with clear error categorization,
 * progressive accuracy fallback, and development diagnostics.
 *
 * 1. Attempts high accuracy first (e.g., GPS on mobile).
 * 2. If high accuracy is unavailable or times out (common on desktop/laptops
 *    without GPS hardware or when "Precise Location" is toggled off),
 *    automatically falls back to standard/network accuracy before giving up.
 * 3. Never rejects a position based on large accuracy values.
 * 4. Protects against race conditions so valid locations are never overwritten by fallback.
 */
export function useUserLocation(): UseUserLocationReturn {
  const [state, setState] = useState<LocationState>({
    status: 'loading',
    location: null,
    loading: true,
    error: null,
    permissionState: 'prompt',
  });

  const mounted = useRef(true);
  const lastKnownLocationRef = useRef<UserLocation | null>(null);
  const requestIdRef = useRef(0);
  // Safety timeout: if an IP-based position was rejected and watchPosition
  // hasn't delivered a real GPS fix within this window, fall to timeout state.
  const gpsWatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (gpsWatchTimeoutRef.current) {
        clearTimeout(gpsWatchTimeoutRef.current);
      }
    };
  }, []);

  const handleSuccess = useCallback(
    (pos: GeolocationPosition, reqId: number, isFallback = false) => {
      if (!mounted.current || reqId !== requestIdRef.current) return;

      const { latitude, longitude, accuracy } = pos.coords;
      const resolvedAccuracy = typeof accuracy === 'number' && !Number.isNaN(accuracy) ? accuracy : 100;

      if (import.meta.env.DEV) {
        console.log(
          `[useUserLocation] Geolocation resolved${isFallback ? ' (standard fallback)' : ''}: (${latitude}, ${longitude}), accuracy=${resolvedAccuracy}m`
        );
      }

      // Reject IP-based positions from the network fallback.
      // When enableHighAccuracy=false, browsers may return an IP-geolocation fix
      // with accuracy > 5,000m (sometimes 50,000m). In India, telecom PoPs are
      // concentrated in Bengaluru, so these positions are almost always wrong.
      // We keep loading=true so watchPosition can deliver the real GPS fix instead.
      if (isFallback && resolvedAccuracy > MAX_ACCEPTABLE_ACCURACY_M) {
        if (import.meta.env.DEV) {
          console.warn(
            `[useUserLocation] Rejecting IP-based fallback position (accuracy=${resolvedAccuracy}m > ${MAX_ACCEPTABLE_ACCURACY_M}m threshold). Keeping loading=true for watchPosition.`
          );
        }
        // Start a safety timeout: if watchPosition doesn't give us a real fix
        // within 20s, fall gracefully to timeout/demo mode.
        if (!gpsWatchTimeoutRef.current) {
          gpsWatchTimeoutRef.current = setTimeout(() => {
            if (!mounted.current) return;
            if (import.meta.env.DEV) {
              console.warn('[useUserLocation] GPS watch timeout: no real fix received. Falling to demo mode.');
            }
            setState((prev) => {
              if (prev.status === 'granted') return prev; // already resolved
              return {
                status: 'timeout',
                location: lastKnownLocationRef.current,
                loading: false,
                error: 'timeout',
                permissionState: 'prompt',
              };
            });
          }, 20_000);
        }
        // Do NOT update state — leave loading:true so watchPosition can resolve it
        return;
      }

      const userLoc: UserLocation = {
        latitude,
        longitude,
        accuracy: resolvedAccuracy,
        timestamp: pos.timestamp || Date.now(),
        isApproximate: resolvedAccuracy > 250,
      };

      lastKnownLocationRef.current = userLoc;

      setState({
        status: 'granted',
        location: userLoc,
        loading: false,
        error: null,
        permissionState: 'granted',
      });
    },
    []
  );

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      if (import.meta.env.DEV) {
        console.warn('[ParkWise Geolocation] Geolocation is not supported by this browser.');
      }
      setState({
        status: 'unsupported',
        location: null,
        loading: false,
        error: 'unsupported',
        permissionState: 'unsupported',
      });
      return;
    }

    const currentReqId = ++requestIdRef.current;
    setState((prev) => ({
      ...prev,
      status: 'loading',
      loading: true,
      error: null,
    }));

    // Step 1: Attempt high accuracy
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSuccess(pos, currentReqId, false);
      },
      (err) => {
        if (!mounted.current || currentReqId !== requestIdRef.current) return;

        // Diagnostic logging in development (Requirement 2)
        if (import.meta.env.DEV) {
          console.warn('[ParkWise Geolocation High-Accuracy Attempt Error]', {
            code: err.code,
            message: err.message,
          });
        }

        // Case B: Permission denied — user explicitly denied access
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setState({
            status: 'permission_denied',
            location: null,
            loading: false,
            error: 'permission_denied',
            permissionState: 'denied',
          });
          return;
        }

        // For POSITION_UNAVAILABLE (code 2) or TIMEOUT (code 3):
        // Automatically attempt standard accuracy before declaring failure.
        // This is critical on Windows/macOS laptops without GPS hardware or
        // when users disable "Precise Location".
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            handleSuccess(fallbackPos, currentReqId, true);
          },
          (fallbackErr) => {
            if (!mounted.current || currentReqId !== requestIdRef.current) return;

            if (import.meta.env.DEV) {
              console.warn('[ParkWise Geolocation Standard Fallback Error]', {
                code: fallbackErr.code,
                message: fallbackErr.message,
              });
            }

            let status: LocationStatus = 'unavailable';
            let errorKind: LocationErrorKind = 'unavailable';

            if (fallbackErr.code === GeolocationPositionError.PERMISSION_DENIED) {
              status = 'permission_denied';
              errorKind = 'permission_denied';
            } else if (fallbackErr.code === GeolocationPositionError.TIMEOUT) {
              status = 'timeout';
              errorKind = 'timeout';
            } else {
              status = 'unavailable';
              errorKind = 'unavailable';
            }

            setState({
              status,
              // Requirement 5: Keep last known real location if one was previously obtained
              location: lastKnownLocationRef.current,
              loading: false,
              error: errorKind,
              permissionState:
                fallbackErr.code === GeolocationPositionError.PERMISSION_DENIED
                  ? 'denied'
                  : 'prompt',
            });
          },
          {
            enableHighAccuracy: false, // Allows network/Wi-Fi/IP location
            timeout: STANDARD_TIMEOUT_MS,
            maximumAge: CACHE_MAX_AGE_MS,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: HIGH_ACCURACY_TIMEOUT_MS,
        maximumAge: 0, // Always request a fresh position — no stale cache
      }
    );
  }, [handleSuccess]);

  // Request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Continuously watch for better GPS fixes after initial position is resolved.
  // This is critical on mobile: the first fix may be a rough network/IP position;
  // watchPosition fires again when GPS refines accuracy significantly.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!mounted.current) return;
        const { latitude, longitude, accuracy } = pos.coords;

        if (import.meta.env.DEV) {
          console.log(
            `[useUserLocation] watchPosition update: (${latitude}, ${longitude}), accuracy=${accuracy}m`
          );
        }

        const resolvedAccuracy = typeof accuracy === 'number' && !Number.isNaN(accuracy) ? accuracy : 100;

        // Reject IP-based positions from watchPosition too.
        // Only accept positions accurate to within MAX_ACCEPTABLE_ACCURACY_M.
        if (resolvedAccuracy > MAX_ACCEPTABLE_ACCURACY_M) {
          if (import.meta.env.DEV) {
            console.warn(
              `[useUserLocation] watchPosition: Ignoring coarse position (accuracy=${resolvedAccuracy}m > ${MAX_ACCEPTABLE_ACCURACY_M}m). Likely IP-based.`
            );
          }
          return;
        }

        // Cancel the safety timeout — watchPosition delivered a real GPS fix
        if (gpsWatchTimeoutRef.current) {
          clearTimeout(gpsWatchTimeoutRef.current);
          gpsWatchTimeoutRef.current = null;
        }

        const userLoc: UserLocation = {
          latitude,
          longitude,
          accuracy: resolvedAccuracy,
          timestamp: pos.timestamp || Date.now(),
          isApproximate: resolvedAccuracy > 250,
        };

        lastKnownLocationRef.current = userLoc;

        setState((prev) => {
          // Only update if we already have a granted state — don't override loading/denied
          if (prev.status !== 'granted' && prev.status !== 'loading') return prev;
          return {
            status: 'granted',
            location: userLoc,
            loading: false,
            error: null,
            permissionState: 'granted',
          };
        });
      },
      (err) => {
        // watchPosition errors are non-fatal; initial request handles permission denial
        if (import.meta.env.DEV) {
          console.warn('[useUserLocation] watchPosition error (non-fatal):', err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30_000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Listen to browser permission state changes where supported
  useEffect(() => {
    if (!('permissions' in navigator) || !navigator.permissions?.query) return;

    let permissionStatus: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permissionStatus = status;
        status.onchange = () => {
          if (!mounted.current) return;
          if (status.state === 'granted') {
            requestLocation();
          } else if (status.state === 'denied') {
            setState((prev) => ({
              ...prev,
              status: 'permission_denied',
              error: 'permission_denied',
              permissionState: 'denied',
              loading: false,
            }));
          }
        };
      })
      .catch(() => {
        // Permissions query API unsupported or rejected for geolocation
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [requestLocation]);

  return {
    ...state,
    retry: requestLocation,
  };
}
