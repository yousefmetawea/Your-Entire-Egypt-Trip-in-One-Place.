# Discover Cairo

An intelligent Greater Cairo travel platform for international visitors. The full product plan, scope, data model, and phased roadmap are in [`docs/PLAN.md`](docs/PLAN.md).

**Current status:** Phase 1 — design system implemented and pending review. The temporary design-system showcase is at `/`; product pages and routing have not started.

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
- Server health check: <http://localhost:4000/api/health>

## Design system

The temporary showcase at the client root reviews the Stitch-derived tokens, self-hosted Playfair Display and Plus Jakarta Sans typography, reusable UI primitives, motion variants, and a static English RTL preview. It will be replaced when routing and product screens begin in Phase 2.

## Checks

```bash
npm run lint
npm run typecheck
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
  src/styles/    Theme tokens, typography, and base styles
  src/components/ Reusable UI and presentational layout components
  src/showcase/  Temporary Phase 1 design-system review page
server/          Express + TypeScript server
docs/            Build plan and recorded decisions
design/          Stitch exports and design system source (do not modify)
```

## Localization

English is the default language; Arabic and RTL direction are supported. Translation resources are under `client/src/i18n/locales/`, and the selected language is stored in `localStorage`. Phase 1 adds logical-property RTL foundations and a static English RTL preview. Arabic typography, product copy, and mirrored visual design are still pending approval.

## Project rules

- Read `docs/PLAN.md` before changing product behavior.
- Follow `design/` as the visual source of truth.
- Record architecture decisions in `docs/decisions.md`.
- Work one phase at a time and do not start the next phase without approval.
- All prices and demo data must be labeled honestly in the UI.
