import { useEffect, useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import type { ParkingWithDistance } from '@/types';
import type { UserLocation } from '@/types';
import { getStatusStyle } from '@/lib/utils';

// Fix Leaflet's broken default icon paths when bundled with Vite
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
});

// ─── Custom marker icon factory ─────────────────────────────────────────────

function createParkingIcon(
  availability: number,
  status: 'high' | 'medium' | 'low',
  selected: boolean,
): L.DivIcon {
  const style = getStatusStyle(status);
  const size = selected ? 56 : 44;
  const fontSize = selected ? 13 : 11;

  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${style.markerBg};
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      color:white;
      border:2.5px solid white;
      box-shadow:${selected ? '0 4px 20px rgba(0,0,0,0.30)' : '0 2px 8px rgba(0,0,0,0.22)'};
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
      font-weight:800;
      line-height:1;
      transition:all 0.2s ease;
      ${selected ? `outline:3px solid ${style.markerBg};outline-offset:3px;` : ''}
    ">
      <span style="font-size:${fontSize}px;letter-spacing:-0.5px;">${availability}</span>
      <span style="font-size:8px;font-weight:600;opacity:0.85;">%</span>
    </div>
    <div style="
      width:0;height:0;
      border-left:5px solid transparent;
      border-right:5px solid transparent;
      border-top:6px solid ${style.markerBg};
      margin:-1px auto 0;
    "></div>
    <div style="
      width:${selected ? 28 : 20}px;height:${selected ? 6 : 4}px;
      border-radius:50%;
      background:rgba(0,0,0,0.15);
      filter:blur(1px);
      margin:1px auto 0;
    "></div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size + 14],
    popupAnchor: [0, -(size + 14)],
  });
}

function createUserLocationIcon(): L.DivIcon {
  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
      <div style="
        position:absolute;
        width:36px;height:36px;
        border-radius:50%;
        background:rgba(59,130,246,0.15);
        border:1.5px solid rgba(59,130,246,0.35);
      "></div>
      <div style="
        width:16px;height:16px;
        border-radius:50%;
        background:#3b82f6;
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(59,130,246,0.45);
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface LeafletMapProps {
  userLocation: UserLocation | null;
  parkings: ParkingWithDistance[];
  selectedId: string | null;
  onSelectParking: (parking: ParkingWithDistance) => void;
  onRecenter?: () => void;
  className?: string;
  mapRef?: MutableRefObject<L.Map | null>;
  onRegisterRecenter?: (fn: () => void) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  userLocation,
  parkings,
  selectedId,
  onSelectParking,
  onRecenter: _onRecenter,
  className = '',
  mapRef: externalMapRef,
  onRegisterRecenter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<L.Map | null>(null);
  const mapRef = externalMapRef ?? internalMapRef;
  const userMarkerRef = useRef<L.Marker | null>(null);
  const parkingMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const initialCenteredRef = useRef(false);

  // ── Initialise map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0], // neutral world view until location arrives
      zoom: 3,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    const markers = parkingMarkersRef.current;

    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
      userMarkerRef.current = null;
    };
  }, [mapRef]);

  // ── Resize observer — fixes Leaflet tile gaps on container resize ──────────
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [mapRef]);

  // ── User location marker + initial centering ───────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const { latitude, longitude } = userLocation;
    const latlng = L.latLng(latitude, longitude);

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(latlng, {
        icon: createUserLocationIcon(),
        zIndexOffset: 1000,
        title: 'Your location',
        alt: 'Your current location',
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(latlng);
    }

    // Fly to user on first successful location only
    if (!initialCenteredRef.current) {
      map.flyTo(latlng, 16, { animate: true, duration: 1.2 });
      initialCenteredRef.current = true;
    }
  }, [userLocation, mapRef]);

  // ── Parking markers ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existing = parkingMarkersRef.current;
    const incoming = new Set(parkings.map((p) => p.id));

    // Remove markers no longer in list
    for (const [id, marker] of existing) {
      if (!incoming.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    // Add or update markers
    for (const parking of parkings) {
      const isSelected = parking.id === selectedId;
      const icon = createParkingIcon(parking.availability, parking.status, isSelected);

      if (existing.has(parking.id)) {
        existing.get(parking.id)!.setIcon(icon);
      } else {
        const marker = L.marker(
          [parking.latitude, parking.longitude],
          {
            icon,
            title: parking.name,
            alt: `${parking.name}: ${parking.availability}% available`,
          },
        ).addTo(map);

        marker.on('click', () => onSelectParking(parking));
        existing.set(parking.id, marker);
      }
    }
  }, [parkings, selectedId, onSelectParking, mapRef]);

  // ── Fly-to selected parking on card click ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const parking = parkings.find((p) => p.id === selectedId);
    if (!parking) return;

    const currentCenter = map.getCenter();
    const target = L.latLng(parking.latitude, parking.longitude);

    // Only fly if parking is far from current center (>100 m offset)
    if (currentCenter.distanceTo(target) > 100) {
      map.flyTo(target, Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedId, parkings, mapRef]);

  // ── Recenter trigger ──────────────────────────────────────────────────────
  const recenterToUser = useCallback(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    map.flyTo(
      [userLocation.latitude, userLocation.longitude],
      16,
      { animate: true, duration: 0.9 },
    );
  }, [userLocation, mapRef]);

  useEffect(() => {
    if (onRegisterRecenter) {
      onRegisterRecenter(recenterToUser);
    }
  }, [onRegisterRecenter, recenterToUser]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="region"
      aria-label="Interactive parking map — powered by OpenStreetMap"
      style={{ minHeight: 0 }}
    />
  );
};
