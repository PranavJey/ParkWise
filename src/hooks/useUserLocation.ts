import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  LocationState,
  UserLocation,
  LocationErrorKind,
  LocationStatus,
} from '@/types';

const HIGH_ACCURACY_TIMEOUT_MS = 6_000;
const STANDARD_TIMEOUT_MS = 12_000;
const CACHE_MAX_AGE_MS = 300_000; // 5 minutes cache allowed for standard accuracy

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

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSuccess = useCallback(
    (pos: GeolocationPosition, reqId: number, isFallback = false) => {
      if (!mounted.current || reqId !== requestIdRef.current) return;

      const { latitude, longitude, accuracy } = pos.coords;

      // Diagnostic logging in development (Requirement 2)
      if (import.meta.env.DEV) {
        console.log(
          `[ParkWise Geolocation Success${isFallback ? ' (standard fallback)' : ''}]`,
          {
            latitude,
            longitude,
            accuracy,
          }
        );
      }

      // Requirement 3 & 6: Accept all valid coordinates; do not treat reduced accuracy as failure
      const userLoc: UserLocation = {
        latitude,
        longitude,
        accuracy: typeof accuracy === 'number' && !Number.isNaN(accuracy) ? accuracy : 100,
        timestamp: pos.timestamp || Date.now(),
        isApproximate: accuracy > 250,
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
        maximumAge: 10_000,
      }
    );
  }, [handleSuccess]);

  // Request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

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
