# Discover Cairo

An intelligent Greater Cairo travel platform for international visitors. The full product plan, scope, data model, and phased roadmap are in [`docs/PLAN.md`](docs/PLAN.md).

**Current status:** Phase 5 — Smart Trip Creator implemented and pending review. Landing, Discover, the Destination Explorer, the six-step `/plan` wizard, and the read-only `/trip/:id` page are available. The app shell, typed domain model, mock services, and remaining route placeholders are in place. The Phase 1 design-system showcase remains available in development at `/design-system`.

## Prerequisites

- Node.js `>=22.12.0`
- npm (tested with npm `11.20.0`)

## Setup

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
```

The environment files contain local, non-secret defaults. Do not commit real `.env` files.

## Development

Start both applications:

```bash
npm run dev
```

Or start them separately:

```bash
npm run dev:client
npm run dev:server
```

- Client: <http://localhost:5173>
- Design-system showcase (development only): <http://localhost:5173/design-system>
- Server health check: <http://localhost:4000/api/health>

Product routes: `/`, `/discover`, `/places/:slug`, `/plan`, `/trip/:id`, `/stay-transport`, `/my-trip`, `/login`, `/register`, and a 404. They share the Navbar and Footer through the site layout. Landing, Discover, Destination Explorer, the trip planner, and the read-only trip page are implemented; the remaining product routes are placeholders.

## Design system

The dev-only `/design-system` showcase reviews the Stitch-derived tokens, self-hosted Playfair Display and Plus Jakarta Sans typography, reusable UI primitives, motion variants, and a static English RTL preview. It is isolated from the product layout and is not included in production builds.

## Mock data

The mock catalog includes 12 approved demo places with factual fields intentionally left empty and listed as placeholders. Accommodation, transport, and ready-made trip collections are empty until verified content is supplied. The planner generates a deterministic demo itinerary from the stored place data, with explicit missing states for duration, travel time, and prices; budget, stay, and transport remain preferences. Landing, Discover, the Destination Explorer, and the trip page label demo data and do not claim live prices or availability. User-created trips and booking requests are stored in `localStorage` under `discover-cairo.mock-store.v1`, and wizard progress under `discover-cairo.wizard.v1`; no authentication or live data is implemented. Planner rules are documented in [`docs/planner-rules.md`](docs/planner-rules.md).

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

Format the repository:

```bash
npm run format
```

## Structure

```text
client/          React + Vite + TypeScript + Tailwind client
  src/app/       Router, root/site layouts, error boundary, and route loading
  src/components/ Reusable UI, layout, Landing, Discover, place, planner, and trip components
  src/hooks/     Shared React hooks, including catalog, place, and trip planner loading
  src/lib/       Date, app, catalog, Discover, featured, and planner helpers
  src/pages/     Landing, Discover, Destination Explorer, planner, trip, and remaining placeholders
  src/services/  Service contracts and localStorage-backed mock implementation
  src/showcase/  Phase 1 design-system review page
  src/styles/    Theme tokens, typography, and base styles
  src/types/     Typed domain model
server/          Express + TypeScript server
docs/            Build plan and recorded decisions
design/          Stitch exports and design system source (do not modify)
```

## Localization

English is the default language; Arabic and RTL direction are supported. Translation resources are under `client/src/i18n/locales/`, and the selected language is stored in `localStorage`. Phase 1 adds logical-property RTL foundations and a static English RTL preview. Phase 3–5 product copy lives in `en.json` and is English-only for now; Arabic typography, product copy, and mirrored visual design are still pending approval.

## Project rules

- Read `docs/PLAN.md` before changing product behavior.
- Follow `design/` as the visual source of truth.
- Record architecture decisions in `docs/decisions.md`.
- Work one phase at a time and do not start the next phase without approval.
- All prices and demo data must be labeled honestly in the UI.
