# Contributing to ParkWise AI

Thank you for your interest in contributing to ParkWise AI! We welcome community contributions to help make smart urban parking discovery accessible, fast, and open.

## Project Vision & Roadmap

ParkWise is being built in distinct phases:
- **Phase 1 (Current)**: Responsive PWA frontend foundation, design system, and UI architecture.
- **Phase 2 (Future)**: Real-time parking availability feeds, OpenStreetMap/Leaflet integration, and FastAPI backend with PostgreSQL.
- **Phase 3 (Future)**: Open-source AI recommendation engine, predictive parking turnover models, and turn-by-turn navigation.

> **Note**: Contributions to Phase 1 must strictly follow frontend foundation boundaries. Do not submit pull requests introducing premature backend, live GPS tracking, or payment integrations until Phase 2 is officially kicked off.

## Development Workflow

1. **Fork and Clone** the repository.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```
4. **Run code validation** before opening a PR:
   ```bash
   npm run build
   ```

## Code Quality Guidelines

- **TypeScript**: Strict mode is enabled. Avoid `any` types. Provide clean TypeScript interfaces.
- **Styling**: Use the established Tailwind CSS design system tokens. Avoid ad-hoc inline styles.
- **Mobile First**: All UI components must remain responsive across mobile (375px+), tablet (768px), and desktop (1024px+).
- **Accessibility**: Include accessible button labels, keyboard focus rings, and proper ARIA semantics.
- **Zero Secrets**: Never commit API keys, credentials, or private tokens.

## Submitting Pull Requests

1. Create a descriptive feature branch: `git checkout -b feat/your-feature-name`.
2. Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`.
3. Open a Pull Request referencing any related issues.
