# ParkWise AI

> **"Find parking. Park smarter."**

ParkWise is an open-source, AI-powered parking discovery Progressive Web Application (PWA) that helps drivers find real nearby parking via OpenStreetMap, receive intelligent natural-language recommendations via Meta Llama 3.1, and navigate seamlessly using external turn-by-turn directions.

---

## Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Responsive PWA Foundation + UI System | Complete |
| Phase 2 | Real Map (Leaflet + OSM) + Live Geolocation | Complete |
| Phase 3 | Parking Data Layer & Provider Architecture | Complete |
| Phase 4 | Real Parking Locations (Overpass API) | Complete |
| Phase 5 | AI Recommendation Engine (Llama 3.1) | Complete |
| **Phase 6** | **Navigation, Secure Server-Side AI, Final Polish & PWA Demo Readiness** | **Complete** |

---

## Key Features

### 1. Navigation Flow (Phase 6)

- **One-tap external navigation**: Tap **Go** on any parking card, **Navigate** in the parking details sheet, or **Navigate** on an AI recommendation.
- **Universal Maps URL**: Launches Google Maps directions using the parking spot's real coordinates:
  ```
  https://www.google.com/maps/dir/?api=1&destination=LAT,LNG
  ```
- **Cross-platform**: Works on desktop browsers, mobile devices, and installed standalone PWAs without custom routing dependencies or backend overhead.

---

## Secure Server-Side AI Architecture (Phase 6)

ParkWise uses an **open-weight language model** to parse natural-language parking requests and generate recommendation explanations.

### Architecture

```
Browser / PWA (Client)
          ↓ POST /api/ai (Same-Origin)
ParkWise Serverless Endpoint (/api/ai.ts or Vite Dev Middleware)
          ↓ (Server-side GROQ_API_KEY)
   Meta Llama 3.1 8B Instant (Groq API)
          ↓
Structured Preferences (JSON)
          ↓
Deterministic Application Ranking Engine (Runs on Real Parking Data)
          ↓
Best Candidate Parking Spot Selected
          ↓
Explanation Generation via Llama 3.1
          ↓
Result Returned to Client & Displayed
```

### Security & Secret Handling

- **Zero Client-Side Secrets**: Browser code never contacts Groq directly and never contains `GROQ_API_KEY`.
- **No `VITE_GROQ_API_KEY`**: The production secret is strictly `GROQ_API_KEY` configured as a server environment variable.
- **Verified Bundle Cleanliness**: Production builds in `dist/` contain zero Groq endpoints or API keys.
- **Strict Input Validation**: Request payloads to `/api/ai` are validated (max 500-char queries, strict action whitelist, JSON schema enforcement).

### Model

| Property | Value |
|----------|-------|
| **Model** | Meta Llama 3.1 8B Instant (`llama-3.1-8b-instant`) |
| **Provider** | [Groq](https://groq.com) (hosted inference) |
| **License** | [Meta Llama 3.1 Community License](https://llama.meta.com/llama3_1/license/) |
| **Role** | Preference extraction from natural language + rationale explanation |

> **Important:** The LLM **never invents or selects parking locations**. All candidate locations originate from OpenStreetMap or the demo provider. Selection is performed deterministically by the application ranking engine.

### Graceful Fallback & Offline Resilience

- **AI endpoint unavailable / no key**: Automatically switches to the local deterministic regex parser and template explanations. The recommendation engine and ranking continue to function 100% locally.
- **OpenStreetMap / Overpass API offline**: Automatically falls back to `DemoParkingProvider` with realistic simulated parking spots anchored around the user's location.
- **Location denied / unavailable**: The app surfaces clear status indicators and allows browsing demo parking coordinates.

---

## Data Sources & Attribution

### OpenStreetMap / Overpass API

Real parking location data is retrieved from [OpenStreetMap](https://www.openstreetmap.org/) via the public [Overpass API](https://overpass-api.de/).

> © OpenStreetMap contributors, licensed under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

Map tiles rendered via [Leaflet](https://leafletjs.com/).

### Data Disclaimer

> **Availability is estimated, not live.**

- **Location data** (name, coordinates, parking type) is sourced from OpenStreetMap.
- **Availability percentages, capacity, and pricing** are **deterministic estimates** generated from OSM metadata. They do **not** reflect live sensor occupancy.
- When OSM data is unavailable, the app falls back to simulated demo parking data.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| Styling | Tailwind CSS v4 |
| Map | Leaflet + OpenStreetMap |
| Parking Data | Overpass API → DemoParkingProvider fallback |
| AI Inference | Groq (Llama 3.1 8B Instant) via Serverless Proxy |
| Geolocation | Browser Geolocation API |
| PWA | vite-plugin-pwa (Service Worker + Web App Manifest) |

---

## Getting Started

### Local Development

```bash
git clone https://github.com/PranavJey/ParkWise.git
cd ParkWise
npm install
cp .env.example .env
```

Add your optional server-side Groq key to `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start the Vite development server (which includes the built-in server proxy for `/api/ai`):
```bash
npm run dev
```

Visit `http://localhost:5173`.

### Production Build & Preview

```bash
npm run build
npm run preview
```

---

## Deployment & PWA Usage

### Deploying to Vercel (Recommended)

1. Import the repository in [Vercel](https://vercel.com).
2. The project includes `vercel.json` and `api/ai.ts`:
   - Static assets build automatically to `dist/`.
   - `/api/ai` is deployed automatically as a serverless function.
3. In the Vercel project settings under **Environment Variables**, set:
   ```
   GROQ_API_KEY = gsk_your_groq_api_key_here
   ```
4. Deploy.

### HTTPS & Geolocation Requirement

Modern web browsers require **HTTPS** for the Geolocation API to access device GPS. When deployed to Vercel (or any HTTPS domain), the browser will prompt for location permission on first load.

### Installing as a PWA

- On iOS Safari: Tap **Share** → **Add to Home Screen**.
- On Android Chrome: Tap **Install app** or the install banner.

---

## Privacy

ParkWise requests browser geolocation solely to discover nearby parking. Location coordinates are never sold or stored on external databases. When using AI recommendations, only non-identifying distance and walking times are sent as context to the AI model.

---

## License

[MIT License](LICENSE)  
Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL.  
AI inference via Groq using Llama 3.1, subject to [Meta Llama 3.1 Community License](https://llama.meta.com/llama3_1/license/).
