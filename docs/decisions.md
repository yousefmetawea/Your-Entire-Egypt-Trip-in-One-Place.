# Decisions

**Status:** Phase 3 — Landing and Discover implemented; pending review
**Last updated:** 2026-11-21

## Product

- Working name: **Discover Cairo**. The final name and logo are not decided.
- No logo has been created. A text-only wordmark may be used temporarily only after explicit approval.
- Audience: international visitors to Greater Cairo (Cairo and Giza).
- Visual direction: luxury modern, editorial, calm, using the Stitch design system.
- Booking model: hybrid — internal requests plus external provider links.
- Primary priority: the travel experience, with the front end as the main graduation evaluation.
- Full product scope and requirements remain in `docs/PLAN.md`.

## Repository

- Single monorepo using npm workspaces.
- Workspaces: `client/` and `server/`. Shared project documentation stays in `docs/`.
- `design/` contains the Stitch source material and is not modified by application work.
- Phases 0–3 are local-only. Hosting providers are undecided.
- Base branch: `main`. Phase work uses dedicated branches: `phase-0-setup`, `phase-1-design-system`, `phase-2-app-shell`, and, currently, `phase-3-landing-discover`.
- Phases 0–2 are committed. Phase 3 is implemented but remains uncommitted and unpushed pending review.

## Tooling

- Node.js requirement: `>=22.12.0`. Development was verified with Node `v26.13.1` and npm `11.20.0`.
- Package manager: npm with a single root `package-lock.json`.
- Client: Vite, React, TypeScript strict mode, Tailwind CSS v4 through `@tailwindcss/vite`.
- Server: Express 5, TypeScript strict mode, ESM with `NodeNext` module resolution, `tsx` for development, `dotenv` for environment loading.
- TypeScript is pinned to the 6.0.x line because `typescript-eslint` does not yet support TypeScript 7. Revisit only after the ESLint parser declares support.
- Linting: ESLint flat config in each workspace, with Prettier compatibility.
- Formatting: Prettier at the root. `design/` and `docs/PLAN.md` are excluded from formatting.
- Development ports: client `5173`, server `4000`.
- Server health endpoint: `GET /api/health` returning `{ "status": "ok" }`.
- The root `npm run dev` command starts both applications with `concurrently`.
- React Router `7.18.6` provides the Phase 2 client router.
- MongoDB, Mongoose, authentication, CORS, rate limiting, and product API routes are deferred to their planned phases.
- Vitest `5.1.1` runs client-side service and pure-logic tests in a Node environment through `npm test`. No component-testing dependencies were added.
- Phase 1 added Framer Motion and self-hosted Fontsource packages for Playfair Display and Plus Jakarta Sans. No icon library was added.
- Phase 2 added React Router and Vitest. No data-fetching or client-state library was added.
- Phase 3 added no dependencies. Landing and Discover use the existing services, React Router, i18next, Framer Motion, and inline SVG icons.

## Design system (Phase 1)

- Tailwind CSS v4 tokens are configured CSS-first in `client/src/styles/theme.css` from the Stitch design system. There is no `tailwind.config.*`.
- The canvas is `#F7F3EC`; primary surfaces use `#1F1F1F` (`#060607` is the primary token), and secondary/interactive text is `#775928`. `#B08D57` and `#D9C7A3` are decorative bronze/sand aliases and are not used for text or interactive contrast.
- Typography is Playfair Display for editorial/display text and Plus Jakarta Sans for interface and body text, self-hosted through Fontsource. This resolves the `docs/PLAN.md` §3 Inter reference in favor of `DESIGN.md` and the Stitch exports.
- Implemented primitives: Container, Section, Button, Card, Chip, Badge/StatusBadge, Input, Select, Tabs, and Modal. Navbar and Footer remain presentational; optional link components allow router-aware links without coupling the components directly to React Router.
- Phase 3 adds Skeleton. Slider, DatePicker, and Toast remain deferred until their screen designs exist.
- Component APIs are typed. Styling uses a small `cn` class joiner; no CVA, `tailwind-merge`, or icon library was added.
- Framer Motion is limited to shared variants and coordinated entrances. CSS handles hover and focus transitions; `MotionConfig reducedMotion="user"` and global CSS honour reduced-motion preferences. There are no ambient loops.
- The Phase 1 showcase reviews tokens, typography, components, motion, and a static English RTL preview. In Phase 2 it moved to the dev-only `/design-system` route, outside the product layout, and is excluded from production builds.
- Phase 1 is committed. Phase 2 is committed. Phase 3 is implemented but not yet approved; do not start Phase 4 without explicit approval.

## App shell and mock data (Phase 2)

- The product routes are `/`, `/discover`, `/places/:slug`, `/plan`, `/trip/:id`, `/stay-transport`, `/my-trip`, `/login`, `/register`, and a catch-all 404. They currently share `SiteLayout`.
- `SiteLayout` reuses the Phase 1 Navbar and Footer. Navbar links point only to `/discover`, `/plan`, `/stay-transport`, and `/my-trip`; the CTA points to `/plan`; Footer links point only to existing routes. Phase 3 adds an accessible mobile disclosure menu with Escape and outside-click dismissal. Authentication routes can move to a separate layout later without changing the shell components.
- `RootLayout` provides the skip link, scroll restoration, route titles, and the outer Suspense boundary. `SiteLayout` provides the Navbar, semantic `<main id="main">`, an inner Suspense boundary, and the Footer. `RootErrorBoundary` is the route error boundary. Page routes are lazy-loaded; the 404 route is lazy as well.
- Navbar, Footer, and `ButtonLink` accept optional link components. The product shell supplies a React Router adapter, while the Phase 1 showcase keeps default anchor behavior.
- The Phase 1 showcase is registered only in development as `/design-system`; production builds do not include its route or chunk.
- Domain types live in `client/src/types/`. The client `User` type contains no password hash. Entities use stable string IDs, `LocalizedText` requires English and allows optional Arabic, and prices use explicit estimated/updated metadata.
- Trips have `startDate`/`endDate`, generated `TripDay` records, and ordered `TripActivity` records. Activity sources and booking request details are discriminated unions. Booking status history is recorded.
- Phase 2 seeds exactly 12 approved places across Giza, Downtown, Islamic Cairo, Coptic Cairo, Zamalek, and Old Cairo. No Food venue or Saqqara record was added. Factual fields remain null or empty and are listed in `placeholders`; every seeded record has `isDemo: true`. Images are empty until approved assets are supplied.
- Accommodation, transport, and ready-made trip seeds are empty. Their service contracts exist and return empty arrays; no fictional inventory was invented.
- Services are defined as interfaces in `client/src/services/contracts.ts` and implemented by `createMockServices`. The named `services` export in `client/src/services/index.ts` is the swappable singleton for later API replacement.
- Mock persistence uses `localStorage` under `discover-cairo.mock-store.v1`, with an in-memory fallback when storage is unavailable. Only user-created trips and booking requests are stored. The default owner is the explicit `demo-user`; no personal information is seeded.
- Mock services simulate latency (about 120 ms by default), validate inputs, and throw typed `ServiceError` values with `NOT_FOUND`, `VALIDATION`, `STORAGE`, or `UNAVAILABLE` codes. `UNAVAILABLE` is reserved for future implementations.
- Phase 2 trip updates cover non-date fields only; date regeneration is deferred. Activity reordering requires every existing activity exactly once.
- Placeholder copy is English-only for Phase 2 and does not claim live data. The i18n foundation remains; Arabic product copy and mirrored layouts still require approval.
- Tests cover the date helpers, seeded catalog behavior, trip creation/persistence/validation, activity ordering, and booking request validation. They use Vitest's Node environment and the mock services directly.

## Landing and Discover (Phase 3)

- Landing (`/`) and Discover (`/discover`) are implemented. Discover has no dedicated Stitch export and is derived from the approved landing design. Inferred responsive behavior and the mobile disclosure Navbar were approved.
- Landing reuses the shared Navbar and Footer, shows a hero search, category shortcuts, five featured places, a ready-made-trips empty state, a how-it-works section, and a factual trust strip.
- The featured allowlist is fixed to `pyramids-of-giza`, `grand-egyptian-museum`, `khan-el-khalili`, `hanging-church`, and `cairo-tower`. No `featured` field was added to the domain model.
- Hero actions are separate: “Search places” submits the catalog search to Discover; “Plan My Trip” navigates to `/plan`.
- Discover state lives in the URL: `q`, `category`, `area`, and `duration` are filters; `from`, `to`, and `travelers` are trip context and do not filter places. Dates are validated as real ISO calendar dates, `to` cannot precede `from`, travelers must be a positive safe integer, invalid values are ignored, serialization is stable, and back/forward navigation is supported.
- Search is submit-based rather than live/debounced. Category chips on Landing navigate to Discover with the selected category; on Discover they update the URL filter.
- Duration buckets are `under-2h`, `2-4h`, and `over-4h`. Unknown durations are included only when no duration filter is selected; the UI discloses that seeded visit lengths are null and a duration filter may return no results.
- Place cards link to the existing `/places/:slug` placeholder. Missing details use “Visit length not listed” and “Details are being prepared for this place.”
- Place imagery is not supplied. Placeholders use token-based gradients and subtle arch linework; no remote images or Stitch screenshots are used as product imagery.
- Ready-made trips remain an empty state because the seed is empty. No fictional trips are shown; the carousel component is data-driven for future verified content.
- Landing and Discover keep demo disclosures visible. Prices are not claimed as live; the trust strip avoids unverified tourism claims.
- `Skeleton` is used for catalog loading states. No new dependencies were added; scroll-snap and inline SVG icons cover the UI needs.
- English Phase 3 copy lives in `client/src/i18n/locales/en.json`; no Arabic product copy was invented. Route titles and meta descriptions are set for Landing and Discover.
- Unit tests cover catalog helpers, URL parsing/serialization, filtering, and featured selection. Component and browser automation tests were not added.

## Localization

- English is the default language. Arabic is supported, including RTL direction.
- Localization uses `i18next` and `react-i18next`.
- The selected language is stored in `localStorage` under `discover-cairo.language`; English is used when no valid preference exists.
- The MVP does not use locale-prefixed URLs, preserving the route plan in `docs/PLAN.md`.
- Runtime language changes update `<html lang>` and `<html dir>` to `ltr` or `rtl`.
- UI copy lives in translation resources rather than hardcoded component strings. The Phase 1 showcase copy is review-only, Phase 2 placeholder copy is English-only, and Phase 3 product copy is English-only in `en.json` until Arabic copy is approved.
- Layouts will use flow-relative CSS/Tailwind properties and `rtl:` variants where necessary. No RTL-specific plugin is selected. Phase 1 adds logical-property RTL foundations and a static English RTL preview only.
- Dates, numbers, and currency will use built-in `Intl` APIs.
- Dynamic content such as place names and descriptions uses a localized shape (English required, Arabic optional, English fallback), defined in Phase 2. The API shape remains a Phase 10 concern.
- User-generated content will not be translated automatically.
- Arabic typography, Arabic product naming, translation voice/dialect, and mirrored visual layouts are not present in the Stitch exports. They require user approval before implementation.

## Deferred product decisions requested by `docs/PLAN.md` §9

- Final product name and logo.
- Project deadline and weekly available hours.
- Hosting for the client, server, and database.
- Map provider and API key.
- AI provider/key or rule-based fallback.
- Whether budget alerts and PDF export are MVP or later.
- Source of final place content, photos, prices, and Arabic translations.
- Mobile-specific visual designs.
