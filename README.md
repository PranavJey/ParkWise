# ParkWise AI

> **"Find parking. Park smarter."**

ParkWise is an open-source, AI-powered parking discovery Progressive Web Application (PWA) designed to simplify urban mobility. ParkWise helps drivers discover real nearby parking spaces via OpenStreetMap, check estimated availability, and navigate effortlessly to selected parking destinations.

---

## ?? Project Status: Phase 4 — Real Parking Locations (OSM + Overpass)

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Responsive PWA Foundation + UI System | ? Complete |
| Phase 2 | Real Map (Leaflet + OSM) + Live Geolocation | ? Complete |
| Phase 3 | Parking Data Layer & Provider Architecture | ? Complete |
| **Phase 4** | **Real Parking Locations (Overpass API)** | ? Complete |
| Phase 5 | AI Recommendation Engine | ?? Planned |

---

## ??? Data Sources & Attribution

### OpenStreetMap / Overpass API

Real parking location data is retrieved from the [OpenStreetMap](https://www.openstreetmap.org/) database via the public [Overpass API](https://overpass-api.de/).

> © OpenStreetMap contributors, licensed under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

Map tiles are provided by OpenStreetMap and rendered via [Leaflet](https://leafletjs.com/).

#### Provider Hierarchy

```
OpenStreetMapParkingProvider (primary)
  +-- On success (>0 results) ? real OSM parking locations displayed
  +-- On failure / timeout / empty ? DemoParkingProvider (fallback)
```

---

## ?? Data Disclaimer

> **Availability is estimated, not live.**

ParkWise does **not** have access to real-time parking sensors, occupancy feeds, or bay-level IoT data.

- **Location data** (name, latitude, longitude, parking type) is sourced from OpenStreetMap.
- **Availability percentages, capacity, and pricing** are **deterministic estimates** generated from OSM metadata. They do **not** reflect real-time occupancy.
- When OSM data is unavailable (timeout, network error, no results), the app falls back to fully simulated demo parking data.

Always verify parking availability on-site.

---

## ??? Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Map**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **Parking Data**: [OpenStreetMap](https://www.openstreetmap.org/) via [Overpass API](https://overpass-api.de/) (with DemoParkingProvider fallback)
- **Geolocation**: Browser Geolocation API (two-tier high/standard accuracy)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PWA Engine**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

## ?? Project Architecture

```
ParkWise/
+-- src/
¦   +-- components/
¦   ¦   +-- LeafletMap.tsx        # Leaflet map with OSM tiles
¦   ¦   +-- MapSurface.tsx        # Map shell + controls + attribution
¦   ¦   +-- ParkingRecommendationCard.tsx
¦   ¦   +-- ParkingDetailModal.tsx
¦   ¦   +-- ...
¦   +-- services/parking/
¦   ¦   +-- osmProvider.ts        # Overpass API provider
¦   ¦   +-- demoProvider.ts       # Deterministic fallback
¦   ¦   +-- parkingService.ts     # Primary -> fallback orchestrator
¦   ¦   +-- types.ts              # ParkingProvider interface
¦   +-- hooks/
¦   ¦   +-- useParkingDiscovery.ts
¦   ¦   +-- useUserLocation.ts
¦   +-- data/
¦   ¦   +-- mockParking.ts
¦   ¦   +-- parking.ts
¦   +-- types/index.ts
+-- vite.config.ts
```

---

## ?? Getting Started

```bash
git clone https://github.com/your-username/parkwise.git
cd parkwise
npm install
npm run dev
```

Visit `http://localhost:5173`.

```bash
# Production build
npm run build
npm run preview
```

---

## ?? Open Source License

This project is licensed under the [MIT License](LICENSE).
Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL.
