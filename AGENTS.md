# AGENTS.md

## Project rules (non-negotiable)

- Read `docs/PLAN.md` in full before changing anything. It is the product/build contract: scope, decisions, data model, API, phases, and open questions.
- Work on one phase at a time. Stop at the phase's "Done when" checks and do not start the next phase without explicit user approval.
- Never guess or invent requirements, content, prices, images, keys, or design details. Ask the user; start with the Open Questions in `docs/PLAN.md` §9.
- `design/` is the visual source of truth. Never redesign existing screens or modify `design/` without permission, and preserve decisions/architecture already recorded in `docs/PLAN.md`.
- Keep Git commits small, meaningful, and scoped to the current phase or change. Do not commit or push unless the user explicitly asks.

## Repo state (Phase 1 implemented, pending review)

- npm-workspaces monorepo with `client/` and `server/`; product features have not started.
- Phase work lives on dedicated branches (current: `phase-1-design-system`); `main` is the base branch. Phase 0 is committed; Phase 1 changes are uncommitted.
- Node requirement: `>=22.12.0` (verified locally with Node `v26.13.1`, npm `11.20.0`).
- No test runner, CI, or deployment configuration exists yet. Hosting is undecided; Phases 0 and 1 are local-only.
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
npm run build
npm run format
npm run format:check
```

- Server health check: `GET http://localhost:4000/api/health`.
- There is no test command yet.
- Workspace-specific scripts: `npm run <script> --workspace client` or `--workspace server`.

## Architecture

- `client/`: Vite 8 + React + TypeScript strict + Tailwind CSS v4 via `@tailwindcss/vite` + `i18next`/`react-i18next`.
- `server/`: Express 5 + TypeScript strict, ESM with `NodeNext`; relative imports require `.js` extensions. `tsx watch` for development, `dotenv` for env loading. Only a health endpoint exists.
- Root uses npm workspaces with one root `package-lock.json`.
- React Router is deferred to Phase 2. MongoDB, Mongoose, authentication, CORS, and product API routes are deferred to their planned phases. Do not add Socket.io or Redis (PLAN §8).
- Installed during Phase 0: Vite, Tailwind CSS, i18next, Express, and the lint/format toolchain. Phase 1 added Framer Motion and self-hosted Fontsource packages for Playfair Display and Plus Jakarta Sans. Do not install other PLAN §4 recommended defaults (dnd-kit, TanStack Query, Zustand, React Hook Form + Zod, map provider, AI provider, PDF export) without user approval. Map and AI providers are unresolved in §9.
- Tailwind v4 tokens live CSS-first in `client/src/styles/theme.css`; there is no Tailwind config file. Reusable UI lives in `client/src/components/` and the temporary review page in `client/src/showcase/`.
- Phase 1 primitives: Container, Section, Button, Card, Chip, Badge/StatusBadge, Input, Select, Tabs, Modal, presentational Navbar/Footer. Slider, DatePicker, Toast, and Skeleton are deferred until their screen designs exist. Icons are minimal inline SVG; no icon library was added.
- Phase 1 is implemented but not yet approved. Do not start Phase 2, add product routes, or replace the showcase without explicit approval.
- `docs/decisions.md` records confirmed choices. Update it when a decision changes; do not contradict it silently.

## Localization

- English is the default; Arabic must support RTL.
- i18next resources live in `client/src/i18n/locales/`; selected language is stored in `localStorage` under `discover-cairo.language`.
- Locale is not in URLs for the MVP. Runtime changes update `<html lang>` and `<html dir>`.
- Use flow-relative CSS/Tailwind properties and `rtl:` variants where needed; no RTL plugin is installed. Phase 1 adds logical-property RTL foundations and a static English RTL preview only.
- No language-switcher UI exists yet. Arabic typography, product naming, dialect/voice, and mirrored visual layouts are not in Stitch and require user approval. Showcase copy is review-only; product UI copy will use translation resources.

## Design source of truth

- `design/luxury_modern_editorial_concierge/DESIGN.md` contains the color, typography, spacing, radius, shadow, and component tokens. Read it before any UI work.
- `design/<screen>/screen.png` is the visual truth; `code.html` is the Stitch export showing exact layout/classes.
- Screens with exports: landing, GEM destination details, smart trip creator, itinerary builder, stay & transport, my trip dashboard, AI companion. The two landing exports (`discover_cairo_curated_luxury_travel_companion`, `discover_cairo_luxury_travel_concierge`) are byte-identical.
- Directories with only `screen.png` are imagery/mood assets, not screen designs.
- Separate mobile designs for landing, itinerary builder, and My Trip are missing. Propose responsive behavior, but ask before significant mobile-specific UI decisions.
- Stitch HTML is reference only: it uses Tailwind CDN, Google Fonts, inline demo JS, and remote `lh3.googleusercontent.com` images. Reimplement it in the app; do not copy it as production code or hotlink assets without permission.
- Typography is resolved in favor of the design source: **Playfair Display + Plus Jakarta Sans**, self-hosted via Fontsource in Phase 1. The `docs/PLAN.md` §3 Inter reference is superseded; record any future change in `docs/decisions.md`.

## Product behavior constraints

- Label every price `Estimated price` with a `Last updated` date; label demo data in the UI; never claim live prices or availability.
- Booking is hybrid: internal requests start `Pending` until confirmed; external links show an `External booking` badge.
- The AI companion may only suggest. Trip changes must be applied after explicit user confirmation.
- Match designs on desktop and mobile, respect `prefers-reduced-motion`, and keep semantic HTML, keyboard access, focus states, alt text, and contrast.

## Verification

- Use the current phase's "Done when" checks plus the global definition of done in PLAN §11 as acceptance criteria.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after changes.
- Compare each screen against both its `screen.png` and the running page; do not settle for approximate styling.
- Record architecture decisions in `docs/decisions.md` and do not contradict them silently.
