# AGENTS.md

## Project rules (non-negotiable)

- Read `docs/PLAN.md` in full before changing anything. It is the product/build contract: scope, decisions, data model, API, phases, and open questions.
- Work on one phase at a time. Stop at the phase's "Done when" checks and do not start the next phase without explicit user approval.
- Never guess or invent requirements, content, prices, images, keys, or design details. Ask the user; start with the Open Questions in `docs/PLAN.md` §9.
- `design/` is the visual source of truth. Never redesign existing screens or modify `design/` without permission, and preserve decisions/architecture already recorded in `docs/PLAN.md`.
- Keep Git commits small, meaningful, and scoped to the current phase or change. Do not commit or push unless the user explicitly asks.

## Repo state (Phase 10 implemented, pending review)

- npm-workspaces monorepo with `client/` and `server/`. Phases 0–10 are implemented; Phase 10 establishes the real backend API with Express 5, TypeScript strict, MongoDB Atlas (Mongoose 9), Argon2 password hashing, JWT session authentication via httpOnly cookies, centralized CSRF/origin enforcement, an idempotent zero-duplication seed pipeline, swappable client API services (`client/src/services/api/`), `AuthContext`, and real `/login` and `/register` pages.
- Phase work lives on dedicated branches (current: `phase-10-backend`); `main` is the base branch. Phase 10 changes are uncommitted.
- Node requirement: `>=22.12.0` (verified locally with Node `v26.13.1`, npm `11.20.0`).
- Vitest is installed for client-side and server-side unit, service, and integration tests (with in-memory MongoDB via `mongodb-memory-server`).
- Lighthouse is not runnable locally because Chrome/Chromium is unavailable. Firefox is used for manual visual and interaction checks; do not claim a Lighthouse score.
- TypeScript is pinned to `~6.0.3` because `typescript-eslint` 8 does not support TypeScript 7. Do not upgrade to TS 7 until the ESLint parser supports it.
- Real `.env` files are local and ignored; only `.env.example` files are tracked. Never commit secrets.

## Commands

```bash
npm install
npm run dev          # starts client and server together via concurrently
npm run dev:client   # client only, http://localhost:5173
npm run dev:server   # server only, http://localhost:4000
npm run lint
npm run typecheck
npm test
npm run build
npm run format
npm run format:check
```

- Server health check: `GET http://localhost:4000/api/health`.
- Client tests: `npm test`; watch mode: `npm run test:watch --workspace client`.
- Workspace-specific scripts: `npm run <script> --workspace client` or `--workspace server`.

## Architecture

- `client/`: Vite 8 + React + TypeScript strict + Tailwind CSS v4 via `@tailwindcss/vite` + `i18next`/`react-i18next`.
- `server/`: Express 5 + TypeScript strict, ESM with `NodeNext`; relative imports require `.js` extensions. `tsx watch` for development, `dotenv` for env loading. Features layered architecture: routes, controllers, services, Mongoose models, centralized error handling, and Zod validation middleware.
- Root uses npm workspaces with one root `package-lock.json`.
- React Router `7.18.6` drives the app shell. Phase 10 implements MongoDB, Mongoose, Argon2, JWT authentication, CORS, rate limiting, and core product API routes (/places, /catalog, /trips, /bookings, /auth). Do not add Socket.io or Redis (PLAN §8).
- Installed during Phase 0: Vite, Tailwind CSS, i18next, Express, and the lint/format toolchain. Phase 1 added Framer Motion and self-hosted Fontsource packages for Playfair Display and Plus Jakarta Sans. Phase 2 added React Router and Vitest. Phase 6 added `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`. Phase 10 added `mongoose`, `zod`, `jsonwebtoken`, `argon2`, `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `supertest`, and `mongodb-memory-server`. Do not install other PLAN §4 recommended defaults (TanStack Query, Zustand, React Hook Form + Zod, map provider, AI provider, PDF export) without user approval. Map and AI providers are unresolved in §9.
- Tailwind v4 tokens live CSS-first in `client/src/styles/theme.css`; there is no Tailwind config file. Reusable UI lives in `client/src/components/`; the Phase 1 review page remains in `client/src/showcase/` behind the dev-only `/design-system` route.
- Phase 1 primitives: Container, Section, Button, Card, Chip, Badge/StatusBadge, Input, Select, Tabs, Modal, presentational Navbar/Footer. Phase 3 adds Skeleton. Slider, DatePicker, and Toast remain deferred until their screen designs exist. Icons are minimal inline SVG; no icon library was added.
- Phase 2 adds `client/src/app/` (router, root layout, site layout, error boundary, loading), `client/src/pages/` placeholders, `client/src/types/`, `client/src/services/` (contracts plus localStorage-backed mock implementation), and `client/src/lib/` date/app helpers.
- Phase 3 implements Landing (`/`) and Discover (`/discover`) with the shared Navbar and Footer.
- Phase 4 implements the Destination Explorer at `/places/:slug`.
- Phase 5 implements `/plan` as a six-step planner.
- Phase 6 implements the editable builder at `/trip/:id`.
- Phase 8 implements the Stay and Transport page at `/stay-transport`.
- Phase 9 implements the My Trip Dashboard at `/my-trip`.
- Phase 10 implements the backend REST API, MongoDB models, idempotent seed script, Argon2 JWT authentication via httpOnly cookies, CSRF protection, client API services, AuthContext, `/login`, `/register`, and `ProtectedRoute` guarding `/my-trip`.
- Routes: `/`, `/discover`, `/places/:slug`, `/plan`, `/trip/:id`, `/stay-transport`, `/my-trip`, `/login`, `/register`, and a 404, all inside the shared site layout. All product routes are fully functional. `/design-system` is registered only in development and is isolated from the product layout.
- Phase 10 is implemented but not yet approved. Do not start Phase 11, add product screens beyond the current set, or commit Phase 10 without explicit approval.
- `docs/decisions.md` records confirmed choices. Update it when a decision changes; do not contradict it silently.

## Localization

- English is the default; Arabic must support RTL.
- i18next resources live in `client/src/i18n/locales/`; selected language is stored in `localStorage` under `discover-cairo.language`.
- Locale is not in URLs for the MVP. Runtime changes update `<html lang>` and `<html dir>`.
- Use flow-relative CSS/Tailwind properties and `rtl:` variants where needed; no RTL plugin is installed. Phase 1 adds logical-property RTL foundations and a static English RTL preview only.
- No language-switcher UI exists yet. Arabic typography, product naming, dialect/voice, and mirrored visual layouts are not in Stitch and require user approval. Showcase copy is review-only, Phase 2 placeholders are English-only, and Phase 3–6 product copy uses translation resources (English only for now).

## Design source of truth

- `design/luxury_modern_editorial_concierge/DESIGN.md` contains the color, typography, spacing, radius, shadow, and component tokens. Read it before any UI work.
- `design/<screen>/screen.png` is the visual truth; `code.html` is the Stitch export showing exact layout/classes.
- Screens with exports: landing, GEM destination details, smart trip creator, itinerary builder, stay & transport, my trip dashboard, AI companion. The two landing exports (`discover_cairo_curated_luxury_travel_companion`, `discover_cairo_luxury_travel_concierge`) are byte-identical.
- Directories with only `screen.png` are imagery/mood assets, not screen designs.
- Separate mobile designs for landing, the trip creator, itinerary builder, and My Trip are missing. Propose responsive behavior, but ask before significant mobile-specific UI decisions. Phase 3's inferred responsive Landing/Discover behavior and mobile disclosure Navbar were approved. Phase 4's inferred responsive Destination Explorer layout and mobile action bar were approved. Phase 5's inferred responsive planner layout stacks the summary below the step content. Phase 6's inferred itinerary-builder layout stacks the timeline, order preview, and summary; it adds no sticky action bar, map/list toggle, or bottom sheet. No separate mobile design exists.
- Discover has no dedicated Stitch export; Phase 3 derives it from the approved landing design.
- Stitch HTML is reference only: it uses Tailwind CDN, Google Fonts, inline demo JS, and remote `lh3.googleusercontent.com` images. Reimplement it in the app; do not copy it as production code or hotlink assets without permission.
- Typography is resolved in favor of the design source: **Playfair Display + Plus Jakarta Sans**, self-hosted via Fontsource in Phase 1. The `docs/PLAN.md` §3 Inter reference is superseded; record any future change in `docs/decisions.md`.

## Product behavior constraints

- Label every price `Estimated price` with a `Last updated` date; label demo data in the UI; never claim live prices or availability.
- Landing, Discover, and the Destination Explorer must keep demo disclosures visible and must not invent place content, imagery, prices, or trips. Ready-made trips show an empty state until verified trips exist; duration filters disclose that seeded visit lengths are not yet available. Destination pages render only stored data and show explicit missing states for prices, hours, duration, descriptions, images, tips, and nearby places.
- The planner must reject Food, require 1–14 days and 1–12 travelers, and treat budget/stay/transport as preferences because no verified inventory or price data exists. The generator may use only stored place data; missing duration, travel time, and prices must stay explicit. It must remain deterministic and pure, and zero-match generation must be blocked.
- The planner reuses one local draft, preserves its ID/title when regenerating, asks before replacing, and defaults to including saved places. “Start over” clears wizard answers only.
- `/trip/:id` is editable only in the local demo layer. It saves through `TripService.saveItinerary`, preserves stored start times when reordering, shows missing times/durations/prices explicitly, and has undo/redo. It does not provide a real map, travel times, live availability, bookings, PDF export, sharing, or AI edits. Days are append-only, capped at 14, and only the last day can be removed.
- Booking is hybrid: internal requests start `Pending` until confirmed; external links show an `External booking` badge.
- The AI companion may only suggest. Trip changes must be applied after explicit user confirmation.
- Match designs on desktop and mobile, respect `prefers-reduced-motion`, and keep semantic HTML, keyboard access, focus states, alt text, and contrast.

## Verification

- Use the current phase's "Done when" checks plus the global definition of done in PLAN §11 as acceptance criteria.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` after changes.
- Compare each screen against both its `screen.png` and the running page; do not settle for approximate styling.
- Lighthouse mobile audits are blocked until Chrome/Chromium is available; use Firefox for manual checks and report the limitation instead of inventing a score.
- Record architecture decisions in `docs/decisions.md` and do not contradict them silently.
