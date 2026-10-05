# ParkWise AI

> **"Find parking. Park smarter."**

ParkWise is an open-source, AI-powered parking discovery Progressive Web Application (PWA) that helps drivers find real nearby parking via OpenStreetMap and receive intelligent natural-language recommendations.

---

## Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Responsive PWA Foundation + UI System | Complete |
| Phase 2 | Real Map (Leaflet + OSM) + Live Geolocation | Complete |
| Phase 3 | Parking Data Layer & Provider Architecture | Complete |
| Phase 4 | Real Parking Locations (Overpass API) | Complete |
| **Phase 5** | **AI Recommendation Engine** | **Complete** |
| Phase 6 | Navigation & Polish | Planned |

---

## AI Recommendation Engine (Phase 5)

ParkWise uses an **open-weight language model** to understand natural-language parking preferences and generate short recommendation explanations.

### Model

| Property | Value |
|----------|-------|
| **Model** | Meta Llama 3.1 8B Instant (`llama-3.1-8b-instant`) |
| **Provider** | [Groq](https://groq.com) (hosted inference) |
| **License** | [Meta Llama 3.1 Community License](https://llama.meta.com/llama3_1/license/) |
| **Used for** | Preference extraction from natural language + recommendation explanation |

> **Important:** Llama 3.1 is an open-weight model. The weights are publicly available but subject to Meta's Community License, not an OSI open-source license. Groq provides hosted inference — no weights are downloaded or run locally.

### How it works

```
User natural-language request
           ↓
   Llama 3.1 (via Groq)
           ↓
  Structured preferences (JSON)
           ↓
   Deterministic ranking engine
  (operates on real parking data)
           ↓
     Best matching spot
           ↓
   Llama 3.1 (via Groq)
           ↓
  Short natural-language explanation
           ↓
       Shown to user
```

**The AI does not invent parking locations.**
All candidate parking data comes from OpenStreetMap or the demo provider.
The model only extracts preferences and generates an explanation.
Parking selection is performed by deterministic application code.

### Graceful degradation

- If `VITE_GROQ_API_KEY` is not set → falls back to local regex parser (no network call)
- If Groq API fails → falls back to local regex parser + template explanation
- If Overpass API fails → demo parking is used, AI recommendation still works

---

## Data Sources & Attribution

### OpenStreetMap / Overpass API

Real parking location data is retrieved from [OpenStreetMap](https://www.openstreetmap.org/) via the public [Overpass API](https://overpass-api.de/).

> © OpenStreetMap contributors, licensed under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

Map tiles rendered via [Leaflet](https://leafletjs.com/).

### Data Disclaimer

> **Availability is estimated, not live.**

- **Location data** (name, coordinates, parking type) is sourced from OpenStreetMap.
- **Availability percentages, capacity, and pricing** are **deterministic estimates** generated from OSM metadata. They do **not** reflect real-time occupancy.
- When OSM data is unavailable, the app falls back to simulated demo parking data.

Always verify parking availability on-site.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| Map | Leaflet + OpenStreetMap |
| Parking data | Overpass API → DemoParkingProvider fallback |
| AI inference | Groq (Llama 3.1 8B Instant) |
| Geolocation | Browser Geolocation API |
| PWA | vite-plugin-pwa |

---

## Getting Started

```bash
git clone https://github.com/PranavJey/ParkWise.git
cd ParkWise
npm install
cp .env.example .env
# Add your VITE_GROQ_API_KEY to .env (free at console.groq.com)
npm run dev
```

Visit `http://localhost:5173`.

### AI Setup

1. Sign up for a free account at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add it to your `.env`:

```
VITE_GROQ_API_KEY=your_key_here
```

Without the key, ParkWise AI uses a local fallback parser — the recommendation engine still works, just without the LLM.

### Production Build

```bash
npm run build
npm run preview
```

---

## Privacy

ParkWise requests browser geolocation to show nearby parking. Location data is used only within your browser session and is sent to Groq only as part of the parking recommendation request (as distance/walking time numbers, not raw coordinates).

---

## License

[MIT License](LICENSE)
Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL.
AI inference via Groq using Llama 3.1, subject to [Meta Llama 3.1 Community License](https://llama.meta.com/llama3_1/license/).
