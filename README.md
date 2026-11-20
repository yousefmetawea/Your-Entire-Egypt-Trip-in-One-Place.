# Discover Cairo

An intelligent Greater Cairo travel platform for international visitors. The full product plan, scope, data model, and phased roadmap are in [`docs/PLAN.md`](docs/PLAN.md).

**Current status:** Phase 0 — setup only. The client and server run locally with placeholder content; no product features are implemented yet.

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
server/          Express + TypeScript server
docs/            Build plan and recorded decisions
design/          Stitch exports and design system source (do not modify)
```

## Localization

English is the default language; Arabic and RTL direction are supported. Translation resources are under `client/src/i18n/locales/`, and the selected language is stored in `localStorage`. Arabic visual design and typography are still pending approval.

## Project rules

- Read `docs/PLAN.md` before changing product behavior.
- Follow `design/` as the visual source of truth.
- Record architecture decisions in `docs/decisions.md`.
- Work one phase at a time and do not start the next phase without approval.
- All prices and demo data must be labeled honestly in the UI.
