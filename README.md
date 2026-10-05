# ParkWise AI

> **"Find parking. Park smarter."**

ParkWise is an open-source, AI-powered parking discovery Progressive Web Application (PWA) designed to simplify urban mobility. ParkWise will help drivers find nearby parking spaces, check live bay availability, receive contextual AI-driven recommendations, and navigate effortlessly to selected parking destinations.

---

## 📌 Project Status: Phase 1 — UI Foundation & Design System

This repository currently implements **Phase 1: Responsive PWA Foundation + UI System**.

### Current Status & Boundaries:
- **UI & Design System**: Completed. Implements a responsive, mobile-first design system inspired by modern consumer mobility and travel apps.
- **Parking Data**: Currently uses isolated simulated mock data (`src/data/mockParking.ts`) for frontend evaluation and interaction demonstration.
- **Map Component**: Features a styled, interactive vector map placeholder abstraction (`<MapContainer />`) with dynamic markers and controls, prepared for drop-in integration with OpenStreetMap / Leaflet.
- **AI Recommendation**: Restrained UI entry point (`<AIActionCard />` and `<AIModal />`) demonstrating query filtering without live model inference.
- **Backend & Database**: Not yet implemented (reserved for Phase 2).
- **Navigation & GPS**: Not yet implemented (reserved for Phase 2).

---

## 🚀 Planned Features (Phase 2 & Phase 3 Roadmap)

- 📍 **Live Location & Radius Search**: High-accuracy geolocation and radius discovery.
- 🅿️ **Real-Time Parking Availability**: Live IoT sensor and parking provider data streams.
- 🗺️ **OpenStreetMap & Leaflet Integration**: Interactive vector tiles, custom routing layers, and geocoding.
- ✨ **AI Parking Recommendations**: Contextual machine learning scoring based on walking distance, turnover history, and rates.
- 💬 **Natural Language Parking Queries**: Semantic search via open-source LLMs connected to a FastAPI backend.
- 🧭 **Turn-by-Turn Navigation**: Direct routing guidance to parking entrance bays.
- 📱 **Full PWA Offline Support**: Local caching and offline spot guidance.

---

## 🛠️ Tech Stack (Phase 1)

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PWA Engine**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

## 📁 Project Architecture

```
ParkWise/
├── public/                     # Static assets & PWA manifest icons
│   ├── favicon.svg             # Vector brand icon
│   └── icons/                  # PWA 192x192 & 512x512 icons
├── src/
│   ├── components/             # Domain components
│   │   ├── ui/                 # Reusable design system primitives
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── ParkingAvailabilityBadge.tsx
│   │   │   ├── FilterButton.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── Header.tsx          # Top bar with branding & location
│   │   ├── LocationIndicator.tsx
│   │   ├── ResponsiveNavigation.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── MapContainer.tsx    # Map abstraction & vector simulation
│   │   ├── ParkingMapMarker.tsx # Status-coded circular percentage markers
│   │   ├── ParkingCard.tsx     # High-tactility parking summary card
│   │   ├── AIActionCard.tsx    # Restrained AI entry point
│   │   ├── ParkingDetailModal.tsx
│   │   └── AIModal.tsx
│   ├── layouts/
│   │   └── AppShell.tsx        # Responsive multi-breakpoint shell
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── hooks/
│   │   └── useParkingDiscovery.ts # Search & filtering logic
│   ├── data/
│   │   └── mockParking.ts      # Isolated mock dataset
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── styles/
│   │   └── index.css           # Global tokens & base CSS
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
└── vite.config.ts
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; tested on v22)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/parkwise.git
cd parkwise

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build
```bash
# Type-check and compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📱 Responsive Verification

The UI is built from the ground up to adapt seamlessly without requiring manual layout switching:
- **Mobile (375px - 430px)**: Map-focused view, floating bottom navigation, horizontal swipeable cards, thumb-friendly touch targets.
- **Tablet (768px)**: Adaptive layout with expanded map and tactile search/filter bar.
- **Desktop (1024px - 1440px+)**: Split workspace featuring persistent parking list + AI panel on the left, and an expanded interactive map on the right.

---

## 📄 Open Source License

This project is licensed under the [MIT License](LICENSE).
Third-party libraries, map data, and fonts are subject to their respective upstream licenses as noted in the [LICENSE](LICENSE) file.
